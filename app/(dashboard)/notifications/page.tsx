'use client';

import { useEffect, useState } from 'react';
import { notificationService, Notification } from '@/services/notification-service';
import { Bell, Loader2, CheckCircle2 } from 'lucide-react';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const response = await notificationService.getNotifications(false, 100);
            setNotifications(response.notifications);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllRead();
            // Update local state to show as read
            setNotifications(prev =>
                prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
            );
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50/30">
            <div className="max-w-2xl mx-auto bg-white min-h-screen shadow-sm border-x">
                <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
                    <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
                    {notifications.some(n => !n.read_at) && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Mark all as read
                        </button>
                    )}
                </div>

                <div className="divide-y">
                    {isLoading ? (
                        <div className="p-12 flex flex-col items-center justify-center text-gray-500">
                            <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-500" />
                            <p className="font-medium">Loading notifications...</p>
                        </div>
                    ) : notifications.length > 0 ? (
                        notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={`p-4 sm:p-5 transition-colors hover:bg-gray-50/80 ${!notif.read_at ? 'bg-blue-50/40 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`}
                            >
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex-1">
                                        <p className={`text-base leading-relaxed ${!notif.read_at ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                            {notif.message}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-2 font-medium uppercase tracking-wider">
                                            {formatDateTime(notif.created_at)}
                                        </p>
                                    </div>
                                    {!notif.read_at && (
                                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-16 text-center text-gray-500">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">No notifications yet</h3>
                            <p className="text-gray-500 max-w-xs mx-auto">
                                When you receive notifications about rewards or nominations, they&apos;ll show up here.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}