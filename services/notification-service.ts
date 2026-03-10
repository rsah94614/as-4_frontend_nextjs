// services/notification-service.ts
// Notification API service — refactored to use dedicated Axios client.

import employeeApiClient from "@/services/employee-api-client";
import type {
    Notification,
    NotificationListResponse,
} from "@/types";

const BASE_URL = "/notifications";

// ─── List ─────────────────────────────────────────────────────────────────────

export async function getNotifications(
    limit = 50,
    unreadOnly = false
): Promise<NotificationListResponse> {
    const params = {
        limit,
        unread_only: unreadOnly,
    };
    const res = await employeeApiClient.get(BASE_URL, { params });
    return res.data;
}

// ─── Unread count ─────────────────────────────────────────────────────────────

export async function getUnreadCount(): Promise<number> {
    try {
        const res = await employeeApiClient.get(`${BASE_URL}/unread-count`);
        return res.data.unread_count;
    } catch (err) {
        console.error("[NotificationService] getUnreadCount failed:", err);
        return 0; // Return 0 to avoid breaking UI, but log error
    }
}

// ─── Mark one as read ─────────────────────────────────────────────────────────

export async function markOneRead(notificationId: string): Promise<Notification> {
    // Some backends require an empty body for PUT
    const res = await employeeApiClient.put(`${BASE_URL}/${notificationId}/read`, {});
    return res.data;
}

// ─── Mark all as read ────────────────────────────────────────────────────────

export async function markAllRead(): Promise<number> {
    // Some backends require an empty body for PUT
    const res = await employeeApiClient.put(`${BASE_URL}/read-all`, {});
    return res.data.marked_read;
}
