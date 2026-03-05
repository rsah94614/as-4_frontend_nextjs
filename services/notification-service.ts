// services/notification-service.ts
// Notification API service — fetches and mutates notifications.
//
// Endpoints (all prefixed /v1/notifications):
//   GET    ""               → list notifications
//   GET    "/unread-count"  → get unread count
//   PUT    "/read-all"      → mark all as read
//   PUT    "/{id}/read"     → mark one as read

import { fetchWithAuth } from "@/services/auth-service";
import type {
    Notification,
    NotificationListResponse,
    UnreadCountResponse,
    MarkAllReadResponse,
} from "@/types/notification-types";

const NOTIFICATION_API =
    process.env.NEXT_PUBLIC_NOTIFICATION_API_URL || "http://localhost:8002";

const BASE = `${NOTIFICATION_API}/v1/notifications`;

// ─── List ─────────────────────────────────────────────────────────────────────

export async function getNotifications(
    limit = 50,
    unreadOnly = false
): Promise<NotificationListResponse> {
    const params = new URLSearchParams({
        limit: String(limit),
        unread_only: String(unreadOnly),
    });
    const res = await fetchWithAuth(`${BASE}?${params}`);
    if (!res.ok) throw new Error(`Failed to fetch notifications (${res.status})`);
    return res.json();
}

// ─── Unread count ─────────────────────────────────────────────────────────────

export async function getUnreadCount(): Promise<number> {
    try {
        const res = await fetchWithAuth(`${BASE}/unread-count`);
        if (!res.ok) return 0;
        const data: UnreadCountResponse = await res.json();
        return data.unread_count;
    } catch {
        return 0;
    }
}

// ─── Mark one as read ─────────────────────────────────────────────────────────

export async function markOneRead(notificationId: string): Promise<Notification> {
    const res = await fetchWithAuth(`${BASE}/${notificationId}/read`, {
        method: "PUT",
    });
    if (!res.ok) throw new Error(`Failed to mark notification as read (${res.status})`);
    return res.json();
}

// ─── Mark all as read ────────────────────────────────────────────────────────

export async function markAllRead(): Promise<number> {
    const res = await fetchWithAuth(`${BASE}/read-all`, { method: "PUT" });
    if (!res.ok) throw new Error(`Failed to mark all as read (${res.status})`);
    const data: MarkAllReadResponse = await res.json();
    return data.marked_read;
}
