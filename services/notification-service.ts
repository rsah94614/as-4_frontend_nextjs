// services/notification-service.ts
// All requests routed through Next.js proxy — no direct microservice URL in browser.

import { createAuthenticatedClient } from "@/lib/api-utils";
import type { Notification, NotificationListResponse } from "@/types/notification-types";

// Notifications live on the employee service (port 8003)
const notifClient = createAuthenticatedClient("/api/proxy/employees/v1");
const BASE = "/notifications";

export async function getNotifications(
    limit = 50,
    unreadOnly = false
): Promise<NotificationListResponse> {
    const res = await notifClient.get(BASE, { params: { limit, unread_only: unreadOnly } });
    return res.data;
}

export async function getUnreadCount(): Promise<number> {
    try {
        const res = await notifClient.get(`${BASE}/unread-count`);
        return res.data.unread_count;
    } catch (err) {
        console.error("[NotificationService] getUnreadCount failed:", err);
        return 0;
    }
}

export async function markOneRead(notificationId: string): Promise<Notification> {
    const res = await notifClient.put(`${BASE}/${notificationId}/read`, {});
    return res.data;
}

export async function markAllRead(): Promise<number> {
    const res = await notifClient.put(`${BASE}/read-all`, {});
    return res.data.marked_read;
}