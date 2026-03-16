import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { getMessage } from "../../../lib/history-utils";
import type { HistoryItem } from "../../../types/history-types";
import { cn } from "@/lib/utils";

import {
    CARD_CONTAINER,
    SUCCESS_GREEN,
    DESTRUCTIVE_RED
} from "./history-styles";

interface HistoryCardProps {
    item: HistoryItem;
    onClick?: (item: HistoryItem) => void;
}

export default function HistoryCard({ item, onClick }: HistoryCardProps) {
    const isRedemption = !!item.reward_catalog;

    // Mimic the ReviewCard top-stripe and direction badge logic
    // Earned (Points) = Green, Redeemed = Red
    const stripeColor = isRedemption ? DESTRUCTIVE_RED : SUCCESS_GREEN;
    const badgeBg = isRedemption 
        ? "bg-red-50 text-red-600 border-red-100" 
        : "bg-green-50 text-green-600 border-green-100";

    return (
        <button
            type="button"
            onClick={() => onClick?.(item)}
            className={CARD_CONTAINER}
        >
            {/* Top accent stripe */}
            <div

              className="h-1 w-full transition-colors"

                style={{ backgroundColor: stripeColor }}
            />

            <div className="p-5 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        {/* Direction badge mimicking ReviewCard */}
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


                        
                        <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">

                            {new Date(item.granted_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                            })}
                        </span>
                    </div>

                    <p className="text-sm font-semibold text-gray-800 leading-snug group-hover:text-[#004C8F] transition-colors">
                        {getMessage(item)}
                    </p>

                    {item.comment && isRedemption && (
                        <p className="text-xs text-gray-500 truncate mt-1.5">{item.comment}</p>
                    )}
                </div>

                <div className="text-right shrink-0">
                    <span
                        className="text-base font-bold tracking-tight"
                        style={{ color: stripeColor }}
                    >
                        {isRedemption ? `-${item.points}` : `+${item.points}`}
                    </span>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter -mt-1">
                        Pts
                    </p>
                </div>
            </div>
        </button>
    );
}
