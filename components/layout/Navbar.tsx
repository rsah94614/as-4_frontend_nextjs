'use client';

import { Bell, Menu, ArrowLeft } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { auth } from '@/services/auth-service';
import { useRouter, usePathname } from 'next/navigation';
import { useNotificationStore } from '@/lib/notification-store';

// The Navbar reads directly from the Zustand store instead of going through
// useNotifications(). This means:
//   - It shares the same unreadCount and notifications list as every other
//     component (including the notifications page) — one source of truth.
//   - The poll that drives updates lives in useNotifications on the
//     notifications page. When that page isn't mounted (e.g. user is on the
//     dashboard), the Navbar starts its own lightweight poll here so the
//     badge stays live regardless of which page is active.
//   - No duplicate full-list fetches: the Navbar only calls fetchUnreadCount()
//     on its poll ticks. If the count goes up it also calls fetchNotifications()
//     so the dropdown preview is fresh.

const POLL_INTERVAL_MS = 30_000;

const TYPE_ICON: Record<string, string> = {
    REVIEW:       "📋",
    REWARD:       "🏅",
    SYSTEM:       "⚙️",
    CELEBRATION:  "🎉",
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

interface NavbarProps {
    onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
    const [user] = useState(() => auth.getUser());
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement | null>(null);
    const prevUnreadRef   = useRef<number>(0);
    const pathname = usePathname();
    const router = useRouter();

    // Read directly from the global Zustand store — shared with notifications page.
    const { notifications, unreadCount, fetchNotifications, fetchUnreadCount } =
        useNotificationStore();

    const hasUnread    = unreadCount > 0;
    const previewItems = notifications.slice(0, 5);

    const ADMIN_ROUTES = [
        '/audit-logs', '/departments', '/designations', '/employees',
        '/review-categories', '/reviews', '/reward-categories', '/rewards',
        '/roles', '/statuses', '/team-report'
    ];
    const isAdminRoute = ADMIN_ROUTES.some(route => pathname?.startsWith(route));

    // ── Bootstrap + poll ─────────────────────────────────────────────────────
    // Do an initial load when the Navbar mounts so the badge and dropdown
    // preview are populated immediately (e.g. on first page load / refresh).
    useEffect(() => {
        fetchNotifications(10).then(() => {
            prevUnreadRef.current = useNotificationStore.getState().unreadCount;
        });

        const timer = setInterval(async () => {
            await fetchUnreadCount();
            const latest = useNotificationStore.getState().unreadCount;
            // New notifications arrived → refresh the preview list too.
            if (latest > prevUnreadRef.current) {
                await fetchNotifications(10);
            }
            prevUnreadRef.current = latest;
        }, POLL_INTERVAL_MS);

        return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // mount once — store actions are stable references

    // ── Close dropdown on route change ────────────────────────────────────────
    useEffect(() => {
        const t = setTimeout(() => setShowNotifications(false), 0);
        return () => clearTimeout(t);
    }, [pathname]);

    // ── Close on outside click ────────────────────────────────────────────────
    useEffect(() => {
        function handleOut(e: MouseEvent) {
            if (notificationRef.current && !notificationRef.current.contains(e.target as Node))
                setShowNotifications(false);
        }
        if (showNotifications) document.addEventListener('pointerdown', handleOut);
        return () => document.removeEventListener('pointerdown', handleOut);
    }, [showNotifications]);

    // ── Close on small screens when resized ───────────────────────────────────
    useEffect(() => {
        function onResize() { if (window.innerWidth < 1024) setShowNotifications(false); }
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const handleBellClick = () => {
        if (window.innerWidth < 1024) router.push('/notifications');
        else setShowNotifications(v => !v);
    };

    const initials = React.useMemo(() => {
        if (!user?.username) return '';
        const parts = (user.username as string).trim().split(/\s+/);
        return parts.length >= 2
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : (user.username as string).slice(0, 2).toUpperCase();
    }, [user]);

    const username = user?.username || '';

    return (
        <nav className="sticky top-0 z-40 w-full shrink-0 bg-[#004C8F]">
            <div className="px-4 sm:px-6">
                <div className="flex items-center justify-between h-14 gap-2">

                    {/* Hamburger — mobile */}
                    {!isAdminRoute && (
                        <button
                            onClick={onMenuClick}
                            className="p-2 rounded-md transition-colors lg:hidden shrink-0"
                            style={{ color: '#fff' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    )}

                    {/* Back button for admin routes */}
                    {isAdminRoute && (
                        <button
                            onClick={() => router.back()}
                            className="p-2 ml-2 rounded-md transition-colors shrink-0 flex items-center justify-center"
                            style={{ color: '#fff', background: 'rgba(255,255,255,0.1)' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                            aria-label="Go back"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                    )}

                    {/* Right cluster */}
                    <div className="flex items-center gap-3 ml-auto">

                        {/* Bell */}
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={handleBellClick}
                                className="w-9 h-9 rounded-md flex items-center justify-center relative transition-colors"
                                style={{ color: '#fff' }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                aria-label="Notifications"
                            >
                                <Bell className="h-5 w-5" />
                                {hasUnread && (
                                    <span
                                        className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[17px] h-[17px] px-1 text-white text-[9px] font-bold rounded-full border-2 pointer-events-none"
                                        style={{ background: '#E31837', borderColor: '#004C8F' }}
                                    >
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown — desktop only */}
                            {showNotifications && (
                                <div
                                    className="absolute right-0 top-12 w-96 rounded-xl shadow-2xl border z-50 hidden lg:flex flex-col overflow-hidden"
                                    style={{ background: '#fff', borderColor: '#dde3ea' }}
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between px-5 py-3" style={{ background: '#004C8F' }}>
                                        <span className="font-semibold text-white text-sm">Notifications</span>
                                        {hasUnread && (
                                            <span
                                                className="text-[10px] font-bold text-white rounded-full px-2 py-0.5"
                                                style={{ background: '#E31837' }}
                                            >
                                                {unreadCount > 99 ? '99+' : unreadCount} unread
                                            </span>
                                        )}
                                    </div>

                                    {/* List */}
                                    <div className="max-h-80 overflow-y-auto divide-y" style={{ borderColor: '#f0f4f8' }}>
                                        {previewItems.length === 0 ? (
                                            <div className="py-10 text-center">
                                                <p className="text-sm text-gray-400">No notifications yet.</p>
                                            </div>
                                        ) : (
                                            previewItems.map(n => (
                                                <button
                                                    key={n.notification_id}
                                                    onClick={() => {
                                                        if (!n.is_read) {
                                                            useNotificationStore.getState().markOneAsRead(n.notification_id);
                                                        }
                                                    }}
                                                    className="w-full text-left flex items-start gap-3 px-5 py-3.5 transition-colors border-b last:border-0"
                                                    style={{
                                                        background:   !n.is_read ? '#EEF4FB' : '#fff',
                                                        borderColor:  '#f0f4f8',
                                                    }}
                                                    onMouseEnter={e => (e.currentTarget.style.background = '#EEF4FB')}
                                                    onMouseLeave={e => (e.currentTarget.style.background = !n.is_read ? '#EEF4FB' : '#fff')}
                                                >
                                                    <span className="text-base leading-none pt-0.5 shrink-0">
                                                        {TYPE_ICON[n.type] ?? '🔔'}
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <p
                                                            className="text-sm leading-snug truncate"
                                                            style={{
                                                                fontWeight: !n.is_read ? 600 : 400,
                                                                color:      !n.is_read ? '#003366' : '#6b7280',
                                                            }}
                                                        >
                                                            {n.title}
                                                        </p>
                                                        <p className="text-[11px] mt-0.5" style={{ color: '#9ca3af' }}>
                                                            {formatRelativeTime(n.created_at)}
                                                        </p>
                                                    </div>
                                                    {!n.is_read && (
                                                        <span
                                                            className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                                                            style={{ background: '#E31837' }}
                                                        />
                                                    )}
                                                </button>
                                            ))
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <button
                                        onClick={() => { setShowNotifications(false); router.push('/notifications'); }}
                                        className="py-3 text-center text-sm font-semibold border-t transition-colors"
                                        style={{ color: '#004C8F', borderColor: '#e5e7eb' }}
                                        onMouseEnter={e => (e.currentTarget.style.background = '#EEF4FB')}
                                        onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                                    >
                                        View all notifications →
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="h-7 w-px" style={{ background: 'rgba(255,255,255,0.25)' }} />

                        {/* Profile */}
                        <button
                            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
                            onClick={() => router.push('/profile')}
                        >
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                style={{ background: '#E31837' }}
                            >
                                <span className="text-white font-bold text-xs">{initials || '??'}</span>
                            </div>
                            {username && (
                                <span className="text-white font-medium hidden md:block text-sm">{username}</span>
                            )}
                        </button>

                    </div>
                </div>
            </div>
        </nav>
    );
}
