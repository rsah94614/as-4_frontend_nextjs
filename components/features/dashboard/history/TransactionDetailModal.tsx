"use client";

import {
    Calendar,
    Hash,
    MessageSquare,
    Package,
    Coins,
    Clock,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { HistoryItem } from "@/types/history-types";
import { getMessage } from "@/lib/history-utils";
import {
    SUCCESS_GREEN,
} from "./history-styles";

interface TransactionDetailModalProps {
    item: HistoryItem | null;
    open: boolean;
    onClose: () => void;
}

function DetailRow({
    icon,
    label,
    value,
    className = " ",
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("flex flex-col gap-1", className)}>
            <div className="flex items-center gap-1.5 text-gray-600">
                <div className="w-3.5 h-3.5 flex items-center justify-center">
                    {icon}
                </div>
                <p className="text-[9px] font-normal uppercase tracking-wider">
                    {label}
                </p>
            </div>
            <div className="text-sm font-normal text-black pl-5">
                {value}
            </div>
        </div>
    );
}

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

export default function TransactionDetailModal({
    item,
    open,
    onClose,
}: TransactionDetailModalProps) {
    if (!item) return null;

    const isRedemption = !!item.reward_catalog;
    const accentColor = isRedemption ? "#004C8F" : SUCCESS_GREEN;
    const accentBg = isRedemption ? "#ffffff" : "#f0fdf4";
    const accentBorder = isRedemption ? "#dbeafe" : "#bbf7d0";

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            {/* Fully white, compact modal — no rounded-b artifacts */}
            <DialogContent
                className="sm:max-w-[400px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl bg-white"
                onOpenAutoFocus={(e) => {
                    e.preventDefault();
                }}
            >

                {/* Header */}
                <div className="px-7 pt-6 pb-5 text-center border-b border-gray-200">
                    <p className="text-lg font-bold text-gray-800 uppercase tracking-[0.18em] mb-1">
                        Transaction Details
                    </p>
                    <DialogTitle
                        className="text-base font-normal leading-snug text-black"
                    >
                        {getMessage(item)}
                    </DialogTitle>

                    <Badge
                        className="mt-3 rounded-full px-3 py-1 text-[9px] font-normal uppercase tracking-widest border"
                        style={{ backgroundColor: accentBg, color: accentColor, borderColor: accentBorder }}
                    >
                        {isRedemption ? "Redeemed Points" : "Earned Points"}
                    </Badge>
                </div>

                {/* Body */}
                <div className="px-7 py-5 space-y-4 bg-white">

                    {/* Points Card */}
                    <div className="rounded-xl border p-4 flex items-center gap-4 relative overflow-hidden border border-gray-200">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-gray-200"
                        >
                            <Coins size={20} />
                        </div>
                        <div>
                            <p className="text-[9px] font-normal text-gray-600 uppercase tracking-wider">
                                {isRedemption ? "Points Deducted" : "Total Received"}
                            </p>
                            <p className="text-xl font-normal">
                                {item.points.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Date / Time / ID grid */}
                    <div className="rounded-xl border border-gray-200 p-4 grid grid-cols-2 gap-4">
                        <DetailRow icon={<Calendar size={12} />} label="Date" value={formatDate(item.granted_at)} />
                        <DetailRow icon={<Clock size={12} />} label="Time" value={formatTime(item.granted_at)} />
                        <DetailRow
                            className="col-span-2"
                            icon={<Hash size={12} />}
                            label="Transaction ID"
                            value={
                                <span className="font-mono text-[10px] font-normal text-gray-600 break-all tracking-tight">
                                    {item.history_id}
                                </span>
                            }
                        />
                    </div>

                    {/* Reward info */}
                    {item.reward_catalog && (
                        <div
                            className="rounded-xl border border-gray-200 p-4 space-y-2">
                            <div className="flex items-center gap-1.5 text-gray-600">
                                <Package size={14} />
                                <p className="text-[9px] font-normal uppercase tracking-wider">Reward Info</p>
                            </div>
                            <p className="text-sm font-normal text-black">{item.reward_catalog.reward_name}</p>
                            <p className="text-[10px] text-gray-600 font-normal">
                                Code: <span className="font-mono font-normal text-gray-600">{item.reward_catalog.reward_code}</span>
                            </p>
                        </div>
                    )}

                    {/* Note */}
                    {item.comment && (
                        <div className="flex gap-3 pt-1">
                            <MessageSquare className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[9px] font-normal text-gray-600 uppercase tracking-widest mb-1">Note</p>
                                <p className="text-xs text-gray-600 italic leading-relaxed">
                                    &ldquo;{item.comment}&rdquo;
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
