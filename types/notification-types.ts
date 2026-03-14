// types/notification-types.ts
// Matches the backend NotificationResponse, NotificationListResponse,
// AnnouncementCreateRequest, DigestEmailRequest schemas.

// ── Notification types ────────────────────────────────────────────────────────

export type NotificationType =
    | "REVIEW"
    | "REWARD"
    | "SYSTEM"
    | "CELEBRATION"
    | "ANNOUNCEMENT";

export interface Notification {
    notification_id: string;
    employee_id: string;
    title: string;
    message: string;
    type: NotificationType;
    is_read: boolean;
    email_sent: boolean;
    created_at: string;
    read_at: string | null;
}

export interface NotificationListResponse {
    notifications: Notification[];
    total: number;
}

export interface UnreadCountResponse {
    unread_count: number;
}

export interface MarkAllReadResponse {
    marked_read: number;
}

// ── Announcement types ────────────────────────────────────────────────────────

export interface AnnouncementRequest {
    title: string;
    message: string;
    /** Optional: restrict to specific department UUIDs. Omit to broadcast to all. */
    department_ids?: string[];
    /** Optional: restrict to specific employee UUIDs. */
    employee_ids?: string[];
}

export interface AnnouncementResponse {
    created: number;
    recipient_count: number;
    title: string;
    message: string;
}

// ── Digest types ──────────────────────────────────────────────────────────────

export interface DigestEmailRequest {
    manager_email: string;
    /** UUID of the manager whose direct reports to scope the digest to. Omit for platform-wide. */
    manager_id?: string;
    /** ISO 8601 Monday date. Omit for last completed week. */
    week_start?: string;
}

export interface TopPerformer {
    employee_id: string;
    username: string;
    count: number;
}

export interface WeeklyDigestData {
    week_start: string;
    week_end: string;
    total_recognitions: number;
    total_points_awarded: number;
    unique_givers: number;
    unique_receivers: number;
    top_giver?: TopPerformer | null;
    top_receiver?: TopPerformer | null;
}

export interface DigestResponse {
    success: boolean;
    message: string;
    data?: WeeklyDigestData | null;
}