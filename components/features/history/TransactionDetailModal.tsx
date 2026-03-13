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
            <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden rounded-[32px] border-0 shadow-2xl animate-in zoom-in-95 duration-200">
                {/* ── Header ── */}
                <div className="relative px-8 pt-10 pb-8 bg-white border-b border-gray-100">
                    <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: isRedemption ? "#E31837" : "#004C8F" }} />

                    <DialogHeader className="relative z-10 space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm text-left align-left">
                            {isRedemption ? (
                                <ArrowUpRight className="w-7 h-7 text-[#E31837]" />
                            ) : (
                                <TrendingUp className="w-7 h-7 text-[#004C8F]" />
                            )}
                        </div>
                        <div className="space-y-1 text-left">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                                Transaction Detail
                            </p>
                            <DialogTitle className="text-2xl font-bold text-[#004C8F] leading-tight">
                                {getMessage(item)}
                            </DialogTitle>
                        </div>
                    </DialogHeader>
                </div>

                {/* ── Details section ── */}
                <div className="px-8 py-8 space-y-6 bg-white">
                    {/* Points row */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isRedemption ? "bg-[#E31837]/10 text-[#E31837]" : "bg-[#004C8F]/10 text-[#004C8F]"}`}>
                                <Coins className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    {isRedemption ? "Points Deducted" : "Points Earned"}
                                </p>
                                <p className={`text-xl font-black ${isRedemption ? "text-[#E31837]" : "text-[#004C8F]"}`}>
                                    {isRedemption ? "-" : "+"}{item.points}
                                </p>
                            </div>
                        </div>
                        <Badge
                            className={`rounded-lg py-1 text-[10px] font-bold uppercase ${isRedemption
                                ? "bg-[#E31837]/10 text-[#E31837] hover:bg-[#E31837]/10 border-none px-2"
                                : "bg-[#004C8F]/10 text-[#004C8F] hover:bg-[#004C8F]/10 border-none px-2"
                                }`}
                        >
                            {isRedemption ? "Redemption" : "Points Earned"}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <DetailRow icon={<Calendar className="w-4 h-4" />} label="Date">
                            <span className="text-sm text-gray-900 font-bold">
                                {formatDate(item.granted_at)}
                            </span>
                        </DetailRow>
                        <DetailRow icon={<Hash className="w-4 h-4" />} label="Time">
                            <span className="text-sm text-gray-900 font-bold">
                                {formatTime(item.granted_at)}
                            </span>
                        </DetailRow>
                    </div>

                    <div className="border-t border-gray-100 pt-6" />

                    <DetailRow
                        icon={<Hash className="w-4 h-4" />}
                        label="Transaction ID"
                    >
                        <span className="text-xs font-mono text-gray-500 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl inline-block">
                            {item.history_id}
                        </span>
                    </DetailRow>

                    {/* Reward details (if redemption) */}
                    {item.reward_catalog && (
                        <div className="p-4 rounded-2xl bg-[#004C8F]/5 border border-[#004C8F]/10 space-y-3">
                            <div className="flex items-center gap-2 text-[#004C8F]">
                                <Package className="w-4 h-4" />
                                <p className="text-[10px] font-bold uppercase tracking-wider">Reward Information</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-900 font-bold">
                                    {item.reward_catalog.reward_name}
                                </p>
                                <p className="text-xs font-mono text-[#004C8F]/70 mt-1">
                                    Code: {item.reward_catalog.reward_code}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Comment */}
                    {item.comment && (
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <div className="flex items-center gap-2 text-gray-400 mb-2">
                                <MessageSquare className="w-4 h-4" />
                                <p className="text-[10px] font-bold uppercase tracking-wider">Note</p>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed italic">
                                &ldquo;{item.comment}&rdquo;
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
