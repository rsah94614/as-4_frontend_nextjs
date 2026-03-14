"use client";

// hooks/useNotifications.ts
// Thin hook over the Zustand notification store.
//
// Poll strategy:
//   Every 30s → fetch unread count (lightweight).
//   If the count has INCREASED since the last tick → new notifications arrived,
//   so do a full fetchNotifications() to bring the list up to date.
//   If the count is the same or decreased (user read some) → skip the full reload.
//
// This means the list self-updates within 30s of a new notification landing,
// without hammering the list endpoint on every tick.

import { useEffect, useCallback, useRef } from "react";
import { useNotificationStore } from "@/lib/notification-store";
import type { Notification } from "@/types/notification-types";

const POLL_INTERVAL_MS = 30_000;

export interface UseNotificationsReturn {
    notifications: Notification[];
    unreadCount:   number;
    loading:       boolean;
    error:         string | null;
    markOne:       (id: string) => Promise<void>;
    markAll:       () => Promise<void>;
    reload:        () => Promise<void>;
}

export function useNotifications(limit = 50): UseNotificationsReturn {
    const {
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        fetchUnreadCount,
        markOneAsRead,
        markAllAsRead,
    } = useNotificationStore();

    const pollTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
    // Track the unread count from the previous poll tick so we can detect increases.
    const prevUnreadRef = useRef<number>(unreadCount);

    const reload  = useCallback(() => fetchNotifications(limit), [fetchNotifications, limit]);
    const markOne = useCallback((id: string) => markOneAsRead(id), [markOneAsRead]);
    const markAll = useCallback(() => markAllAsRead(), [markAllAsRead]);

    useEffect(() => {
        // Initial full load on mount
        reload().then(() => {
            // Seed prevUnreadRef after the first load so the first poll tick
            // doesn't incorrectly treat every existing unread as "new".
            prevUnreadRef.current = useNotificationStore.getState().unreadCount;
        });

        pollTimerRef.current = setInterval(async () => {
            // 1. Fetch the lightweight count first.
            await fetchUnreadCount();

            // 2. Read the freshly-written count directly from the store
            //    (the state closure captured at interval creation would be stale).
            const latest = useNotificationStore.getState().unreadCount;

            // 3. If count went up → new notifications arrived → reload the list.
            if (latest > prevUnreadRef.current) {
                await fetchNotifications(limit);
            }

            // 4. Update the ref regardless (handles both increases and decreases).
            prevUnreadRef.current = latest;
        }, POLL_INTERVAL_MS);

        return () => {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // run once on mount — fetchNotifications/fetchUnreadCount are stable Zustand actions

    return { notifications, unreadCount, loading, error, markOne, markAll, reload };
}