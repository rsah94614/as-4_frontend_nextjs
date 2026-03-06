"use client";

import { create } from "zustand";
import {
    getNotifications,
    getUnreadCount,
    markOneRead,
    markAllRead,
} from "@/services/notification-service";
import type { Notification } from "@/types/notification-types";

/**
 * State Management for Notifications
 * Centralized store to ensure Navbar badge, Notifications Page, and Dropdown
 * are always in sync.
 */
interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
    lastLimit: number;

    // Actions
    fetchNotifications: (limit?: number) => Promise<void>;
    fetchUnreadCount: () => Promise<void>;
    markOneAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    lastLimit: 50,

    fetchNotifications: async (limit = 50) => {
        set({ loading: true, error: null });
        try {
            const [listRes, count] = await Promise.all([
                getNotifications(limit),
                getUnreadCount(),
            ]);

            set({
                notifications: listRes.notifications,
                unreadCount: count,
                loading: false,
                lastLimit: limit,
            });
        } catch (err) {
            console.error("[NotificationStore] fetchNotifications failed:", err);
            set({
                error: err instanceof Error ? err.message : "Failed to load notifications",
                loading: false,
            });
        }
    },

    fetchUnreadCount: async () => {
        try {
            const count = await getUnreadCount();
            set({ unreadCount: count });
        } catch (err) {
            console.error("[NotificationStore] fetchUnreadCount failed:", err);
        }
    },

    markOneAsRead: async (id: string) => {
        const { notifications, unreadCount, lastLimit } = get();

        // 1. Optimistic Update
        set({
            notifications: notifications.map((n) =>
                n.notification_id === id
                    ? { ...n, is_read: true, read_at: new Date().toISOString() }
                    : n
            ),
            unreadCount: Math.max(0, unreadCount - 1),
        });

        try {
            await markOneRead(id);
        } catch (err) {
            console.error("[NotificationStore] markOneAsRead failed:", err);
            // Revert on error by re-fetching
            const freshCount = await getUnreadCount();
            const freshList = await getNotifications(lastLimit);
            set({ notifications: freshList.notifications, unreadCount: freshCount });
        }
    },

    markAllAsRead: async () => {
        const { notifications, lastLimit } = get();

        // 1. Optimistic Update
        set({
            notifications: notifications.map((n) =>
                n.is_read ? n : { ...n, is_read: true, read_at: new Date().toISOString() }
            ),
            unreadCount: 0,
        });

        try {
            await markAllRead();
        } catch (err) {
            console.error("[NotificationStore] markAllAsRead failed:", err);
            // Revert on error
            const freshCount = await getUnreadCount();
            const freshList = await getNotifications(lastLimit);
            set({ notifications: freshList.notifications, unreadCount: freshCount });
        }
    },
}));
