'use client';

import { Search, Bell, Menu } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { auth } from '@/services/auth-service';
import { useRouter, usePathname } from 'next/navigation';
import { useNotifications } from '@/hooks/useNotifications';
import type { NotificationType } from '@/types/notification-types';

interface NavbarProps {
    onMenuClick: () => void;
}

// Emoji map for the dropdown previews
const TYPE_ICON: Record<NotificationType, string> = {
    REVIEW: "📋",
    REWARD: "🏅",
    SYSTEM: "⚙️",
    CELEBRATION: "🎉",
    ANNOUNCEMENT: "📣",
};

function formatRelativeTime(iso: string): string {
    const diffMins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [user] = useState(() => auth.getUser());
    const [showNotifications, setShowNotifications] = useState(false);

    const notificationRef = useRef<HTMLDivElement | null>(null);
    const pathname = usePathname();
    const router = useRouter();

    const { notifications, unreadCount, markAll, markOne } = useNotifications(10);
    const hasUnread = unreadCount > 0;

    // Close dropdown when navigating away
    useEffect(() => {
        setShowNotifications(false);
    }, [pathname]);

    // Mark all as read when the /notifications page is visited
    useEffect(() => {
        if (pathname === '/notifications') {
            markAll();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target as Node)
            ) {
                setShowNotifications(false);
            }
        }
        if (showNotifications) {
            document.addEventListener('pointerdown', handleClickOutside);
        }
        return () => document.removeEventListener('pointerdown', handleClickOutside);
    }, [showNotifications]);

    // Close dropdown if viewport goes below 1024px
    useEffect(() => {
        function handleResize() {
            if (window.innerWidth < 1024) setShowNotifications(false);
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleBellClick = () => {
        if (window.innerWidth < 1024) {
            router.push('/notifications');
        } else {
            const opening = !showNotifications;
            setShowNotifications(opening);
            if (opening) {
                // Mark all as read when dropdown opens
                markAll();
            }
        }
    };

    const initials = React.useMemo(() => {
        if (!user?.username) return '';
        const parts = (user.username as string).trim().split(/\s+/);
        return parts.length >= 2
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : user.username.slice(0, 2).toUpperCase();
    }, [user]);

    const username = user?.username || '';
    const previewItems = notifications.slice(0, 5);

    return (
        <nav className="w-full pt-4 shrink-0">
            <div className="px-4 sm:px-6">
                <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
                    {/* Hamburger — mobile only */}
                    <button
                        onClick={onMenuClick}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden shrink-0"
                    >
                        <Menu className="w-5 h-5 text-gray-600" />
                    </button>

                    {/* Search Bar */}
                    {/* <div className="flex-1 min-w-0 max-w-2xl">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search for rewards.."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                            />
                        </div>
                    </div> */}

                    <div className="flex flex-row items-center gap-2 ml-auto">                        <div className="relative flex items-center gap-2 shrink-0" ref={notificationRef}>
                        <button
                            onClick={handleBellClick}
                            className="w-10 h-10 rounded-full hover:bg-gray-100 transition-colors relative flex items-center justify-center"
                            aria-label="Notifications"
                        >
                            <Bell className="h-6 w-6 text-gray-900" />
                            {hasUnread && (
                                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white pointer-events-none" />
                            )}
                        </button>

                        {/* Dropdown — desktop only */}
                        {showNotifications && (
                            <div className="absolute right-0 top-14 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 hidden lg:flex flex-col overflow-hidden">
                                {/* Header */}
                                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                    <span className="font-semibold text-gray-800 text-sm">Notifications</span>
                                    {unreadCount > 0 && (
                                        <span className="text-xs font-bold text-white bg-indigo-600 rounded-full px-2 py-0.5">
                                            {unreadCount > 99 ? "99+" : unreadCount} unread
                                        </span>
                                    )}
                                </div>

                                {/* List */}
                                <div className="max-h-80 overflow-y-auto">
                                    {previewItems.length === 0 ? (
                                        <div className="py-10 text-center">
                                            <p className="text-sm text-gray-400">No notifications yet.</p>
                                        </div>
                                    ) : (
                                        previewItems.map((n) => (
                                            <button
                                                key={n.notification_id}
                                                onClick={() => {
                                                    if (!n.is_read) markOne(n.notification_id);
                                                }}
                                                className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0
                                                        ${!n.is_read ? "bg-indigo-50/50" : ""}`}
                                            >
                                                <span className="text-lg leading-none pt-0.5 shrink-0">
                                                    {TYPE_ICON[n.type] ?? "🔔"}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm leading-snug truncate ${!n.is_read ? "font-semibold text-gray-800" : "text-gray-500"}`}>
                                                        {n.title}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        {formatRelativeTime(n.created_at)}
                                                    </p>
                                                </div>
                                                {!n.is_read && (
                                                    <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>

                                {/* Footer */}
                                <button
                                    onClick={() => {
                                        setShowNotifications(false);
                                        router.push('/notifications');
                                    }}
                                    className="py-3 text-center text-sm font-semibold text-indigo-600 hover:bg-gray-50 border-t border-gray-100 transition-colors"
                                >
                                    View all notifications
                                </button>
                            </div>
                        )}
                    </div>

                        {/* Divider */}
                        <div className="h-10 w-px bg-gray-300" />

                        {/* Profile */}
                        <button
                            className="flex items-center gap-2 hover:opacity-80 transition-opacity pl-2"
                            onClick={() => router.push('/profile')}
                        >
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                                <span className="text-white font-medium text-xs sm:text-sm">
                                    {initials || '??'}
                                </span>
                            </div>
                            {username && (
                                <span className="text-gray-900 font-medium hidden md:block text-sm">
                                    {username}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}