import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { getMessage } from "@/lib/history-utils";
import type { HistoryItem } from "@/types/history-types";
import { cn } from "@/lib/utils";

import {
    CARD_CONTAINER,
    SUCCESS_GREEN,
} from "./history-styles";

interface HistoryCardProps {
    item: HistoryItem;
    onClick?: (item: HistoryItem) => void;
}

import React from "react";

export default React.memo(function HistoryCard({ item, onClick }: HistoryCardProps) {
    const isRedemption = !!item.reward_catalog;

    const badgeBg = isRedemption
        ? "bg-[#004C8F]/5 text-[#004C8F] border-[#004C8F]/10"
        : "bg-emerald-50 text-emerald-700 border-emerald-100";
    const iconWrap = isRedemption
        ? "bg-[#004C8F]/5 text-[#004C8F] border-[#004C8F]/10"
        : "bg-emerald-50 text-emerald-700 border-emerald-100";
    const amountColor = isRedemption ? "#004C8F" : SUCCESS_GREEN;

    return (
        <button
            type="button"
            onClick={() => onClick?.(item)}
            className={CARD_CONTAINER}
        >
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#004C8F]/30 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            <div className="p-3 sm:p-4 flex items-center justify-between gap-4 sm:gap-5">
                <div className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
                    iconWrap
                )}>
                    {isRedemption
                        ? <ArrowUpRight size={18} />
                        : <ArrowDownLeft size={18} />
                    }
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={cn(
                            "inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.18em] px-3 py-1.5 rounded-full border",
                            badgeBg
                        )}>
                            {isRedemption ? "Redeemed" : "Earned"}
                        </span>

                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-medium text-slate-500">
                            {new Date(item.granted_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                            })}
                        </span>
                    </div>

                    <p className="mt-3 text-[15px] font-semibold leading-6 text-slate-900 transition-colors group-hover:text-slate-950">
                        {getMessage(item)}
                    </p>

                    {item.comment && isRedemption && (
                        <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            {item.comment}
                        </p>
                    )}
                </div>

                <div className="shrink-0 text-right px-4">
                    <span
                        className="block text-xl font-bold tracking-tight"
                        style={{ color: amountColor }}
                    >
                        {item.points.toLocaleString()}
                    </span>
                </div>
            </div>
        </button>
    );
});
