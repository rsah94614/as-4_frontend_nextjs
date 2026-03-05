"use client";

// hooks/useNotifications.ts
// Fetches notifications, manages read state, and polls for unread count.

import { useState, useEffect, useCallback, useRef } from "react";
import {
    getNotifications,
    getUnreadCount,
    markOneRead,
    markAllRead,
} from "@/services/notification-service";
import type { Notification } from "@/types/notification-types";

const POLL_INTERVAL_MS = 30_000; // 30 seconds

export interface UseNotificationsReturn {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
    markOne: (id: string) => Promise<void>;
    markAll: () => Promise<void>;
    reload: () => Promise<void>;
}

export function useNotifications(limit = 50): UseNotificationsReturn {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ── Fetch full list + count ───────────────────────────────────────────────

    const reload = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [listRes, count] = await Promise.all([
                getNotifications(limit),
                getUnreadCount(),
            ]);
            setNotifications(listRes.notifications);
            setUnreadCount(count);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load notifications");
        } finally {
            setLoading(false);
        }
    }, [limit]);

    // ── Lightweight poll for unread count only ────────────────────────────────

    const pollCount = useCallback(async () => {
        const count = await getUnreadCount();
        setUnreadCount(count);
    }, []);

    useEffect(() => {
        reload();

        pollTimerRef.current = setInterval(pollCount, POLL_INTERVAL_MS);

        return () => {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        };
    }, [reload, pollCount]);

    // ── Mark one as read (optimistic) ─────────────────────────────────────────

    const markOne = useCallback(async (id: string) => {
        // Optimistically update local state immediately
        setNotifications((prev) =>
            prev.map((n) =>
                n.notification_id === id
                    ? { ...n, is_read: true, read_at: new Date().toISOString() }
                    : n
            )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        try {
            await markOneRead(id);
        } catch {
            // Revert on failure
            reload();
        }
    }, [reload]);

    // ── Mark all as read (optimistic) ─────────────────────────────────────────

    const markAll = useCallback(async () => {
        const now = new Date().toISOString();
        setNotifications((prev) =>
            prev.map((n) =>
                n.is_read ? n : { ...n, is_read: true, read_at: now }
            )
        );
        setUnreadCount(0);

        try {
            await markAllRead();
        } catch {
            reload();
        }
    }, [reload]);

    return { notifications, unreadCount, loading, error, markOne, markAll, reload };
}
