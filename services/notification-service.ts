import axiosClient from './api-client';

export interface Notification {
    id: string;
    employee_id: string;
    actor_id: string | null;
    type: string;
    message: string;
    read_at: string | null;
    created_at: string;
    related_id: string | null;
    related_type: string | null;
}

export interface NotificationListResponse {
    notifications: Notification[];
    total: number;
}

export const notificationService = {
    /**
     * Get all notifications for the current user
     */
    getNotifications: async (unreadOnly = false, limit = 50): Promise<NotificationListResponse> => {
        const response = await axiosClient.get('/v1/notifications', {
            params: { unread_only: unreadOnly, limit },
        });
        return response.data;
    },

    /**
     * Get unread notification count
     */
    getUnreadCount: async (): Promise<number> => {
        const response = await axiosClient.get('/v1/notifications/unread-count');
        return response.data.unread_count;
    },

    /**
     * Mark all notifications as read
     */
    markAllRead: async (): Promise<number> => {
        const response = await axiosClient.put('/v1/notifications/read-all');
        return response.data.marked_read;
    },

    /**
     * Mark a single notification as read
     */
    markAsRead: async (notificationId: string): Promise<Notification> => {
        const response = await axiosClient.put(`/v1/notifications/${notificationId}/read`);
        return response.data;
    },
};
