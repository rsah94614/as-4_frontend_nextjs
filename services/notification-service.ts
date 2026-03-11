// services/notification-service.ts
// All requests routed through Next.js proxy — no direct microservice URL in browser.

import { createAuthenticatedClient } from "@/lib/api-utils";
import type { Notification, NotificationListResponse } from "@/types/notification-types";

const notifClient = createAuthenticatedClient("/api/proxy/employees");
const BASE = "/notifications";

// ── In-flight deduplication — prevents double-fetch from React StrictMode ────
let _inFlightUnreadCount: Promise<number> | null = null;
let _inFlightList: Promise<NotificationListResponse> | null = null;

export async function getUnreadCount(): Promise<number> {
    if (_inFlightUnreadCount) return _inFlightUnreadCount;
    _inFlightUnreadCount = notifClient
        .get<{ unread_count: number }>(`${BASE}/unread-count`)
        .then(r => r.data.unread_count)
        .catch(() => 0)
        .finally(() => { _inFlightUnreadCount = null; });
    return _inFlightUnreadCount;
}

export async function getNotifications(
    limit = 50,
    unreadOnly = false
): Promise<NotificationListResponse> {
    if (_inFlightList) return _inFlightList;
    _inFlightList = notifClient
        .get<NotificationListResponse>(BASE, { params: { limit, unread_only: unreadOnly } })
        .then(r => r.data)
        .finally(() => { _inFlightList = null; });
    return _inFlightList;
}

export async function markOneRead(notificationId: string): Promise<Notification> {
    const res = await notifClient.put<Notification>(`${BASE}/${notificationId}/read`, {});
    return res.data;
}

export async function markAllRead(): Promise<number> {
    const res = await notifClient.put<{ marked_read: number }>(`${BASE}/read-all`, {});
    return res.data.marked_read;
}