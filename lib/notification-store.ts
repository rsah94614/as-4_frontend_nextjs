import { create } from "zustand";
import { employeesClient as notifClient } from "@/services/api-clients";
import { extractErrorMessage } from "@/lib/error-utils";
import type { Notification } from "@/types/notification-types";

/**
 * Zustand store for notification state.
 * Now using modular Axios client pointing directly to microservices.
 */

interface NotificationState {
    notifications: Notification[];
    unreadCount:   number;
    loading:       boolean;
    error:         string | null;

    fetchNotifications: (limit?: number) => Promise<void>;
    fetchUnreadCount:   () => Promise<void>;
    markOneAsRead:      (id: string) => Promise<void>;
    markAllAsRead:      () => Promise<void>;
}

const BASE = "/notifications";

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    unreadCount:   0,
    loading:       false,
    error:         null,

    fetchNotifications: async (limit = 50) => {
        set({ loading: true, error: null });
        try {
            // Using axios client instead of fetch. 
            // Query params are passed in the second argument.
            const res = await notifClient.get<{ notifications: Notification[]; total: number }>(
                BASE, { params: { limit, unread_only: false } }
            );
            const data = res.data;

            set({
                notifications: data.notifications,
                unreadCount:   data.notifications.filter(n => !n.is_read).length,
                loading:       false,
            });
        } catch (err) {
            set({
                loading: false,
                error:   extractErrorMessage(err, "Failed to load notifications"),
            });
        }
    },

    fetchUnreadCount: async () => {
        try {
            const res = await notifClient.get<{ unread_count: number }>(
                `${BASE}/unread-count`
            );
            set({ unreadCount: res.data.unread_count });
        } catch {
            // Silently ignore background poll failures
        }
    },

    markOneAsRead: async (id: string) => {
        try {
            const res = await notifClient.put<Notification>(
                `${BASE}/${id}/read`,
                {}
            );
            const updated = res.data;
            set(state => ({
                notifications: state.notifications.map(n =>
                    n.notification_id === id ? { ...n, ...updated } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1),
            }));
        } catch (err) {
            set({ error: extractErrorMessage(err, "Failed to mark as read") });
        }
    },

    markAllAsRead: async () => {
        try {
            await notifClient.put<{ marked_read: number }>(
                `${BASE}/read-all`,
                {}
            );
            set(state => ({
                notifications: state.notifications.map(n => ({ ...n, is_read: true })),
                unreadCount:   0,
            }));
        } catch (err) {
            set({ error: extractErrorMessage(err, "Failed to mark all as read") });
        }
    },
}));