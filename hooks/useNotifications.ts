"use client";

import { useEffect, useCallback, useRef } from "react";
import { useNotificationStore } from "@/lib/notification-store";
import type { UseNotificationsReturn } from "@/types";

const POLL_INTERVAL_MS = 30_000;

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

    const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const reload = useCallback(() => fetchNotifications(limit), [fetchNotifications, limit]);
    const markOne = useCallback((id: string) => markOneAsRead(id), [markOneAsRead]);
    const markAll = useCallback(() => markAllAsRead(), [markAllAsRead]);

    useEffect(() => {
        reload();

        pollTimerRef.current = setInterval(() => {
            fetchUnreadCount();
        }, POLL_INTERVAL_MS);

        return () => {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        };
    }, [reload, fetchUnreadCount]);

    return { notifications, unreadCount, loading, error, markOne, markAll, reload };
}
