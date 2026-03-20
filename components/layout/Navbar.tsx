'use client';

import { Bell, Menu, ArrowLeft, LogOut, X } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { auth } from '@/services/auth-service';
import { useRouter, usePathname } from 'next/navigation';
import { useNotificationStore } from '@/lib/notification-store';
import { useAuth } from '@/providers/AuthProvider';
import { isAdminUser } from '@/lib/role-utils';
import {
    LayoutGrid, FileText, Trophy, Clock,
    Wallet, SlidersHorizontal, Bug,
} from 'lucide-react';
import {
    Dialog, DialogTrigger, DialogContent, DialogHeader,
    DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// ── Nav items ─────────────────────────────────────────────────────────────────

const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    { label: 'Recognize', href: '/review', icon: FileText },
    { label: 'Redeem', href: '/redeem', icon: Trophy },
    { label: 'Wallet', href: '/wallet', icon: Wallet },
    { label: 'History', href: '/history', icon: Clock },
    { label: 'Control Panel', href: '/control-panel', icon: SlidersHorizontal, adminOnly: true },
];

// ── Constants ─────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 30_000;

const TYPE_ICON: Record<string, string> = {
    REVIEW: '📋',
    REWARD: '🏅',
    SYSTEM: '⚙️',
    CELEBRATION: '🎉',
    ANNOUNCEMENT: '📣',
};

function formatRelativeTime(iso: string): string {
    const diffMins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Navbar() {
    const [user] = useState(() => auth.getUser());
    const [showNotifications, setShowNotifications] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const notificationRef = useRef<HTMLDivElement | null>(null);
    const prevUnreadRef = useRef<number>(0);
    const pathname = usePathname();
    const router = useRouter();
    const { logoutUser } = useAuth();
    const isAdmin = isAdminUser();

    const { notifications, unreadCount, fetchNotifications, fetchUnreadCount } =
        useNotificationStore();

    const hasUnread = unreadCount > 0;
    const previewItems = notifications.slice(0, 5);

    const ADMIN_ROUTES = [
        '/audit-logs', '/departments', '/designations', '/employees',
        '/review-categories', '/reviews', '/reward-categories', '/rewards',
        '/roles', '/statuses', '/team-report',
    ];
    const isAdminRoute = ADMIN_ROUTES.some(route => pathname?.startsWith(route));
    const visibleNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

    useEffect(() => {
        const id = setTimeout(() => { setMounted(true); }, 0);
        return () => clearTimeout(id);
    }, [pathname]);

    // ── Bootstrap + poll ──────────────────────────────────────────────────────
    useEffect(() => {
        fetchNotifications(10).then(() => {
            prevUnreadRef.current = useNotificationStore.getState().unreadCount;
        });
        const timer = setInterval(async () => {
            await fetchUnreadCount();
            const latest = useNotificationStore.getState().unreadCount;
            if (latest > prevUnreadRef.current) await fetchNotifications(10);
            prevUnreadRef.current = latest;
        }, POLL_INTERVAL_MS);
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Close on route change ─────────────────────────────────────────────────
    useEffect(() => {
        const t = setTimeout(() => {
            setShowNotifications(false);
            setMobileMenuOpen(false);
        }, 0);
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

    // ── Close on resize ───────────────────────────────────────────────────────
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
        <>
            {/* ── Single-row navbar ── */}
            <nav className="sticky top-0 z-50 w-full shrink-0 bg-[#004C8F] shadow-md">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 gap-4">

                        {/* ── Left: Logo ── */}
                        <div className="flex items-center shrink-0">
                            {isAdminRoute ? (
                                <button
                                    onClick={() => router.back()}
                                    className="p-2 rounded-md transition-colors flex items-center justify-center"
                                    style={{ color: '#fff', background: 'rgba(255,255,255,0.1)' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                                    aria-label="Go back"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                            ) : (
                                <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
                                    <Image
                                        src="/logo.svg"
                                        alt="HDFC Bank"
                                        width={130}
                                        height={38}
                                        priority
                                    />
                                </Link>
                            )}
                        </div>

                        {/* ── Center: HDFC-style pipe-separated nav links (desktop) ── */}
                        {!isAdminRoute && (
                            <div className="hidden lg:flex items-center flex-1 justify-center">
                                {visibleNavItems.map((item, idx) => {
                                    const isActive =
                                        pathname === item.href || pathname.startsWith(item.href + '/');
                                    return (
                                        <React.Fragment key={item.href}>
                                            {/* Pipe separator — not before first item */}
                                            {idx !== 0 && (
                                                <span
                                                    className="h-5 w-px mx-1 shrink-0"
                                                    style={{ background: 'rgba(255,255,255,0.25)' }}
                                                />
                                            )}
                                            <Link
                                                href={item.href}
                                                className={`
                                                    relative px-4 py-1.5 text-[15px] font-semibold tracking-wide transition-all whitespace-nowrap
                                                    ${isActive
                                                        ? 'text-white'
                                                        : 'text-white/70 hover:text-white'
                                                    }
                                                `}
                                            >
                                                {item.label}
                                            </Link>
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        )}

                        {/* ── Right: Dev Logger + Bell + Divider + Profile + Logout + Hamburger ── */}
                        <div className="flex items-center gap-2 shrink-0">

                            {/* Dev Logger — admin only, desktop */}
                            {mounted && isAdmin && !isAdminRoute && (
                                <Link
                                    href="/dev-logger"
                                    className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border border-white/10"
                                    style={
                                        pathname.startsWith('/dev-logger')
                                            ? { background: 'rgba(139,92,246,0.2)', color: '#fff' }
                                            : { color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.03)' }
                                    }
                                >
                                    <Bug className="w-3.5 h-3.5" />
                                    <span className="hidden xl:inline">Dev Logger</span>
                                    <span className="ml-1 bg-violet-500 text-white px-1.5 py-0.5 rounded text-[9px]">API</span>
                                </Link>
                            )}

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

                                {/* Notification dropdown — desktop only */}
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
                                                            background: !n.is_read ? '#EEF4FB' : '#fff',
                                                            borderColor: '#f0f4f8',
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
                                                                    color: !n.is_read ? '#003366' : '#6b7280',
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
                                className="flex items-center gap-2 transition-opacity hover:opacity-80"
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

                            {/* Logout — desktop */}
                            <Dialog>
                                <DialogTrigger asChild>
                                    <button
                                        className="hidden lg:flex items-center justify-center w-9 h-9 rounded-md transition-colors"
                                        style={{ color: '#fff' }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                        aria-label="Logout"
                                    >
                                        <LogOut className="w-4.5 h-4.5" />
                                    </button>
                                </DialogTrigger>
                                <DialogContent showCloseButton={false} className="sm:max-w-sm">
                                    <DialogHeader>
                                        <DialogTitle>Confirm Logout</DialogTitle>
                                        <DialogDescription>
                                            Are you sure you want to log out? You will need to sign in again to access your account.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                        <Button
                                            onClick={logoutUser}
                                            style={{ background: '#E31837', color: '#fff' }}
                                            className="hover:opacity-90 cursor-pointer"
                                        >
                                            Confirm
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            {/* Hamburger — mobile */}
                            {!isAdminRoute && (
                                <button
                                    onClick={() => setMobileMenuOpen(v => !v)}
                                    className="p-2 rounded-md transition-colors lg:hidden shrink-0"
                                    style={{ color: '#fff' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                    aria-label="Menu"
                                >
                                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* ── Mobile slide-down menu ── */}
            {mobileMenuOpen && !isAdminRoute && (
                <>
                    <div
                        className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <div className="fixed top-16 left-0 right-0 z-50 lg:hidden bg-[#004C8F] border-t border-white/10 shadow-xl">
                        <div className="px-4 py-3 space-y-1">
                            {visibleNavItems.map(item => {
                                const isActive =
                                    pathname === item.href || pathname.startsWith(item.href + '/');
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`
                                            flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                                            ${isActive
                                                ? 'bg-white/15 text-white'
                                                : 'text-white/70 hover:bg-white/10 hover:text-white'
                                            }
                                        `}
                                    >
                                        <item.icon className="w-4.5 h-4.5 shrink-0" />
                                        {item.label}
                                    </Link>
                                );
                            })}

                            {/* Dev Logger — mobile, admin only */}
                            {mounted && isAdmin && (
                                <Link
                                    href="/dev-logger"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-white/50 hover:bg-white/10 hover:text-white"
                                >
                                    <Bug className="w-4.5 h-4.5 shrink-0" />
                                    Dev Logger
                                    <span className="ml-auto bg-violet-500 text-white px-1.5 py-0.5 rounded text-[9px]">API</span>
                                </Link>
                            )}

                            {/* Logout — mobile */}
                            <Dialog>
                                <DialogTrigger asChild>
                                    <button
                                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold transition-all mt-2"
                                        style={{ background: '#E31837', color: '#fff' }}
                                    >
                                        <LogOut className="w-4 h-4 shrink-0" />
                                        Log out
                                    </button>
                                </DialogTrigger>
                                <DialogContent showCloseButton={false} className="sm:max-w-sm">
                                    <DialogHeader>
                                        <DialogTitle>Confirm Logout</DialogTitle>
                                        <DialogDescription>
                                            Are you sure you want to log out? You will need to sign in again to access your account.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                        <Button
                                            onClick={logoutUser}
                                            style={{ background: '#E31837', color: '#fff' }}
                                            className="hover:opacity-90 cursor-pointer"
                                        >
                                            Confirm
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}