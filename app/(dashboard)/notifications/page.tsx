"use client";

import { Bell, CheckCheck, RefreshCw } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import type { Notification, NotificationType } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(iso: string): string {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60_000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const TYPE_CONFIG: Record<
    NotificationType,
    { label: string; color: string; bg: string; icon: string }
> = {
    REVIEW: { label: "Review", color: "text-indigo-700", bg: "bg-indigo-100", icon: "📋" },
    REWARD: { label: "Reward", color: "text-amber-700", bg: "bg-amber-100", icon: "🏅" },
    SYSTEM: { label: "System", color: "text-slate-600", bg: "bg-slate-100", icon: "⚙️" },
    CELEBRATION: { label: "Celebration", color: "text-pink-700", bg: "bg-pink-100", icon: "🎉" },
    ANNOUNCEMENT: { label: "Announcement", color: "text-emerald-700", bg: "bg-emerald-100", icon: "📣" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: NotificationType }) {
    const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.SYSTEM;
    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide whitespace-nowrap ${cfg.bg} ${cfg.color}`}
        >
            {cfg.icon} {cfg.label}
        </span>
    );
}

function NotificationRow({
    notification,
    onMarkRead,
}: {
    notification: Notification;
    onMarkRead: (id: string) => void;
}) {
    return (
        <button
            onClick={() => !notification.is_read && onMarkRead(notification.notification_id)}
            className={`w-full text-left flex items-start gap-4 px-5 py-4 transition-colors rounded-2xl cursor-pointer
                ${notification.is_read
                    ? "hover:bg-slate-50"
                    : "bg-indigo-50/60 hover:bg-indigo-50"
                }`}
        >
            {/* Unread dot */}
            <span className="pt-1.5 shrink-0 w-3 flex justify-center">
                {!notification.is_read && (
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 block" />
                )}
            </span>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <TypeBadge type={notification.type} />
                    <span className="text-xs text-slate-400 ml-auto shrink-0">
                        {formatRelativeTime(notification.created_at)}
                    </span>
                </div>
                <p className={`text-sm leading-snug truncate ${notification.is_read ? "text-slate-500 font-normal" : "text-slate-800 font-semibold"}`}>
                    {notification.title}
                </p>
                {notification.message && (
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                        {notification.message}
                    </p>
                )}
            </div>
        </button>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 px-3 py-3">
                    <Skeleton className="w-2.5 h-2.5 mt-1.5 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-20 rounded-full" />
                            <Skeleton className="h-3 w-14 ml-auto rounded" />
                        </div>
                        <Skeleton className="h-4 w-3/4 rounded" />
                        <Skeleton className="h-3 w-1/2 rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Bell className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-base font-semibold text-slate-700">All caught up!</p>
            <p className="text-sm text-slate-400 mt-1">
                No notifications yet. Check back later.
            </p>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
    const { notifications, unreadCount, loading, error, markOne, markAll, reload } =
        useNotifications(100);

    const hasUnread = unreadCount > 0;

    return (
        <div className="flex-1 w-full">
            <div className="bg-white rounded-[36px] px-6 md:px-10 py-8 max-w-[780px] mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-[22px] font-semibold text-gray-900">Notifications</h1>
                        {unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-600 text-white min-w-[22px]">
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={reload}
                            className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-400 hover:text-slate-600"
                            title="Refresh"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={markAll}
                            disabled={!hasUnread || loading}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition
                                bg-indigo-600 text-white hover:bg-indigo-700
                                disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <CheckCheck className="w-4 h-4" />
                            Mark all as read
                        </button>
                    </div>
                </div>

                {/* Error banner */}
                {error && (
                    <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                {/* Body */}
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    {loading ? (
                        <LoadingSkeleton />
                    ) : notifications.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="divide-y divide-slate-50 p-2">
                            {notifications.map((n) => (
                                <NotificationRow
                                    key={n.notification_id}
                                    notification={n}
                                    onMarkRead={markOne}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
