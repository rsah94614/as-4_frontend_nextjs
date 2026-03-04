// types/notification-types.ts
// Matches the backend NotificationResponse and NotificationListResponse schemas.

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
