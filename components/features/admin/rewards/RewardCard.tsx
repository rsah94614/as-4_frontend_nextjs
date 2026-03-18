"use client";

import React from "react";
import { Tag, Pencil, Archive } from "lucide-react";
import { RewardItem } from "@/types/reward-types";
import { StatusBadge, StockBadge } from "./UIHelpers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RewardCardProps {
    item: RewardItem;
    onEdit: (item: RewardItem) => void;
    onRestock: (item: RewardItem) => void;
}

export function RewardCard({ item, onEdit, onRestock }: RewardCardProps) {
    return (
        <Card className="rounded-xl border border-slate-300 p-5 flex flex-col gap-3.5 shadow-md shadow-slate-400 hover:shadow-xl hover:shadow-slate-300 hover:-translate-y-0.5 transition-all duration-300 group cursor-default animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Title Row */}
            <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                        <Tag className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                            {item.reward_code}
                        </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 truncate tracking-tight group-hover:text-[#004C8F] transition-colors">
                        {item.reward_name}
                    </h3>
                </div>
                <StatusBadge active={item.is_active} />
            </div>

            {/* Description */}
            {item.description && (
                <p className="text-xs font-semibold text-slate-500 line-clamp-2 leading-relaxed tracking-wide group-hover:text-slate-700 transition-colors">
                    {item.description}
                </p>
            )}

            {/* Points Section - Darkened and Enhanced */}
            <div className="flex justify-center bg-slate-100/50 rounded-xl p-3 border-2 border-slate-100">
                <div className="text-center">
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.1em] mb-0.5">
                        POINTS
                    </p>
                    <p className="text-2xl font-bold text-[#004C8F] tracking-tight leading-tight">
                        {item.default_points.toLocaleString()}
                    </p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                        pts
                    </p>
                </div>
            </div>

            {/* Footer Row */}
            <div className="flex justify-between items-center">
                <StockBadge stock={item.available_stock} />
                {item.category && (
                    <Badge
                        variant="secondary"
                        className="rounded-full text-[10px] font-semibold tracking-wider px-3 py-1 border shadow-sm bg-blue-50 text-[#004C8F] border-blue-100"
                    >
                        {item.category.category_name}
                    </Badge>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t-2 border-slate-100">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(item)}
                    className="flex-1 h-10 rounded-xl text-[10px] font-semibold tracking-wider text-slate-500 hover:text-[#004C8F] hover:bg-blue-50 transition-all active:scale-95 uppercase border-slate-200"
                >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRestock(item)}
                    className="flex-1 h-10 rounded-xl text-[10px] font-semibold tracking-wider text-slate-500 hover:text-white hover:bg-black transition-all active:scale-95 uppercase border-slate-200"
                >
                    <Archive className="w-3.5 h-3.5" />
                    Restock
                </Button>
            </div>
        </Card>
    );
}
