"use client";

import { ArrowUpRight, TrendingUp } from "lucide-react";
import { getMessage } from "./history-utils";
import type { HistoryItem } from "./types";

interface HistoryCardProps {
    item: HistoryItem;
}

export default function HistoryCard({ item }: HistoryCardProps) {
    const isRedemption = !!item.reward_catalog;

    return (
        <div className="bg-white rounded-xl border p-3 sm:p-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                {isRedemption ? (
                    <ArrowUpRight className="w-5 h-5 text-red-500 shrink-0" />
                ) : (
                    <TrendingUp className="w-5 h-5 text-green-500 shrink-0" />
                )}

                <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-700 truncate sm:whitespace-normal">
                        {getMessage(item)}
                    </p>

                    {item.comment && isRedemption && (
                        <p className="text-xs text-gray-400 truncate">{item.comment}</p>
                    )}

                    <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(item.granted_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        })}
                    </p>
                </div>
            </div>

            <span
                className={`text-sm font-semibold shrink-0 ${isRedemption ? "text-red-500" : "text-green-600"
                    }`}
            >
                {isRedemption ? `-${item.points}` : `+${item.points}`}
            </span>
        </div>
    );
}
