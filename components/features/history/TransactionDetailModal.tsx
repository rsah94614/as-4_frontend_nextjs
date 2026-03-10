"use client";

import {
    ArrowUpRight,
    TrendingUp,
    Calendar,
    Hash,
    MessageSquare,
    Package,
    Coins,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { HistoryItem } from "./types";
import { getMessage } from "./history-utils";

// ─── Props ────────────────────────────────────────────────────────────────────

interface TransactionDetailModalProps {
    item: HistoryItem | null;
    open: boolean;
    onClose: () => void;
}

// ─── Detail Row ───────────────────────────────────────────────────────────────

function DetailRow({
    icon,
    label,
    children,
}: {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-3.5 group/row">
            <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shrink-0 mt-0.5 group-hover/row:bg-gray-100 transition-colors">
                {icon}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                    {label}
                </p>
                <div>{children}</div>
            </div>
        </div>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TransactionDetailModal({
    item,
    open,
    onClose,
}: TransactionDetailModalProps) {
    if (!item) return null;

    const isRedemption = !!item.reward_catalog;

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
                {/* ── Gradient header ── */}
                <div
                    className={`relative px-6 pt-7 pb-6 ${isRedemption
                            ? "bg-gradient-to-br from-fuchsia-50 via-purple-50 to-pink-50"
                            : "bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50"
                        }`}
                >
                    {/* Decorative circles */}
                    <div
                        className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-xl ${isRedemption ? "bg-fuchsia-300" : "bg-emerald-300"
                            }`}
                    />
                    <div
                        className={`absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-15 blur-lg ${isRedemption ? "bg-purple-300" : "bg-green-300"
                            }`}
                    />

                    <DialogHeader className="relative z-10 space-y-3">
                        <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm ${isRedemption
                                    ? "bg-white/80 backdrop-blur-sm"
                                    : "bg-white/80 backdrop-blur-sm"
                                }`}
                        >
                            {isRedemption ? (
                                <ArrowUpRight className="w-5 h-5 text-fuchsia-600" />
                            ) : (
                                <TrendingUp className="w-5 h-5 text-emerald-600" />
                            )}
                        </div>
                        <DialogTitle className="text-[17px] font-bold text-gray-900 leading-snug pr-6">
                            {getMessage(item)}
                        </DialogTitle>
                    </DialogHeader>
                </div>

                {/* ── Details section ── */}
                <div className="px-6 py-5 space-y-5">
                    {/* Type */}
                    <DetailRow icon={<Coins className="w-4 h-4" />} label="Type">
                        <div className="flex items-center gap-2.5">
                            <Badge
                                variant="outline"
                                className={`text-xs font-semibold ${isRedemption
                                        ? "border-fuchsia-200 text-fuchsia-700 bg-fuchsia-50"
                                        : "border-emerald-200 text-emerald-700 bg-emerald-50"
                                    }`}
                            >
                                {isRedemption ? "Redemption" : "Points Earned"}
                            </Badge>
                        </div>
                    </DetailRow>

                    {/* Points */}
                    <DetailRow
                        icon={<Coins className="w-4 h-4" />}
                        label={isRedemption ? "Points Deducted" : "Points Earned"}
                    >
                        <span
                            className={`text-xl font-bold tracking-tight ${isRedemption
                                    ? "text-fuchsia-600"
                                    : "text-emerald-600"
                                }`}
                        >
                            {item.points}
                        </span>
                        <span className="text-sm text-gray-400 ml-1.5 font-medium">
                            points
                        </span>
                    </DetailRow>

                    {/* Divider */}
                    <div className="border-t border-dashed border-gray-150" />

                    {/* Date & time */}
                    <DetailRow
                        icon={<Calendar className="w-4 h-4" />}
                        label="Date & Time"
                    >
                        <span className="text-sm text-gray-800 font-medium">
                            {formatDate(item.granted_at)}
                        </span>
                        <span className="text-xs text-gray-400 ml-2">
                            {formatTime(item.granted_at)}
                        </span>
                    </DetailRow>

                    {/* Transaction ID */}
                    <DetailRow
                        icon={<Hash className="w-4 h-4" />}
                        label="Transaction ID"
                    >
                        <span className="text-xs font-mono text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg inline-block">
                            {item.history_id.slice(0, 8)}…
                        </span>
                    </DetailRow>

                    {/* Reward details (if redemption) */}
                    {item.reward_catalog && (
                        <>
                            <div className="border-t border-dashed border-gray-150" />
                            <DetailRow
                                icon={<Package className="w-4 h-4" />}
                                label="Reward"
                            >
                                <p className="text-sm text-gray-800 font-semibold">
                                    {item.reward_catalog.reward_name}
                                </p>
                                <p className="text-xs font-mono text-gray-400 mt-0.5">
                                    {item.reward_catalog.reward_code}
                                </p>
                            </DetailRow>
                        </>
                    )}

                    {/* Comment */}
                    {item.comment && (
                        <DetailRow
                            icon={<MessageSquare className="w-4 h-4" />}
                            label="Note"
                        >
                            <p className="text-sm text-gray-600 leading-relaxed italic">
                                &ldquo;{item.comment}&rdquo;
                            </p>
                        </DetailRow>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
