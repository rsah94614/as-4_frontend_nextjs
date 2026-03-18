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
        ? "bg-rose-50 text-rose-600 border-rose-100"
        : "bg-emerald-50 text-emerald-600 border-emerald-100";
    const amountColor = isRedemption ? "#374151" : SUCCESS_GREEN; // Use neutral slate for redemptions or the green for earnings

    return (
        <button
            type="button"
            onClick={() => onClick?.(item)}
            className={CARD_CONTAINER}
        >

            <div className="p-5 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        {/* Direction badge */}
                        <span className={cn(
                            "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border",
                            badgeBg
                        )}>
                            {isRedemption
                                ? <ArrowUpRight size={10} />
                                : <ArrowDownLeft size={10} />
                            }
                            {isRedemption ? "Redeemed" : "Earned"}
                        </span>

                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            {new Date(item.granted_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                            })}
                        </span>
                    </div>

                    <p className="text-sm font-semibold text-gray-800 leading-snug transition-colors">
                        {getMessage(item)}
                    </p>

                    {item.comment && isRedemption && (
                        <p className="text-xs text-gray-400 italic mt-1.5 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                            {item.comment}
                        </p>
                    )}
                </div>

                <div className="text-right shrink-0">
                    <span
                        className="text-base font-bold tracking-tight"
                        style={{ color: amountColor }}
                    >
                        {isRedemption ? `${item.points}` : `${item.points}`}
                    </span>
                </div>
            </div>
        </button>
    );
});
