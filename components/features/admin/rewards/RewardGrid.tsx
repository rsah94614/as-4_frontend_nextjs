"use client";

import React from "react";
import {
    Package,
    Plus,
    RefreshCw,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Loader2,
} from "lucide-react";
import { RewardItem, Pagination } from "@/types/reward-types";
import { SkeletonCard } from "./UIHelpers";
import { RewardCard } from "./RewardCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RewardGridProps {
    items: RewardItem[];
    loading: boolean;
    error: string;
    pagination: Pagination | null;
    page: number;
    setPage: (page: number) => void;
    onRetry: () => void;
    onEdit: (item: RewardItem) => void;
    onRestock: (item: RewardItem) => void;
    onCreateNew: () => void;
}

// ─── Pagination Helper ────────────────────────────────────────────────────────
function getPages(total: number, current: number): (number | "...")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (current > 3) pages.push("...");
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++)
        pages.push(i);
    if (current < total - 2) pages.push("...");
    pages.push(total);
    return pages;
}

export function RewardGrid({
    items,
    loading,
    error,
    pagination,
    page,
    setPage,
    onRetry,
    onEdit,
    onRestock,
    onCreateNew,
}: RewardGridProps) {
    // Error
    if (error && !loading) {
        return (
            <Card className="flex flex-col items-center justify-center py-24 gap-4 bg-red-50 border border-red-100 rounded-xl shadow-sm">
                <div className="w-16 h-16 rounded-lg bg-red-100 flex items-center justify-center text-red-600 shadow-inner">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <div className="text-center">
                    <p className="text-red-900 font-semibold text-xl tracking-tight">
                        Connection Interrupt
                    </p>
                    <p className="text-red-600/80 font-semibold text-[11px] tracking-wide mt-1 uppercase">
                        {error}
                    </p>
                </div>
                <Button
                    onClick={onRetry}
                    className="px-8 py-6 h-12 bg-red-600 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95 border-none"
                >
                    <RefreshCw className="w-4 h-4" />
                    RETRY SYNC
                </Button>
            </Card>
        );
    }

    // Loading
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-200" />
                    <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider animate-pulse">
                        Loading catalog...
                    </p>
                </div>
            </div>
        );
    }

    // Empty
    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-40 text-slate-400 text-sm bg-white rounded-xl border border-dashed border-slate-200 gap-6 group hover:border-blue-200 transition-all cursor-default">
                <div className="w-24 h-24 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors shadow-inner">
                    <Package className="w-10 h-10 opacity-20 group-hover:text-blue-400 group-hover:opacity-100 transition-all duration-700" />
                </div>
                <div className="text-center group-hover:scale-105 transition-transform">
                    <p className="font-semibold text-slate-300 uppercase tracking-wide mb-2 group-hover:text-blue-400 transition-colors">
                        No Rewards Found
                    </p>
                    <p className="font-bold text-slate-400/60 lowercase tracking-widest text-xs leading-relaxed max-w-xs">
                        Try adjusting your search or create
                        <br />a new reward for your employees.
                    </p>
                </div>
                <Button
                    onClick={onCreateNew}
                    className="mt-4 px-10 py-4 bg-black text-white rounded-xl text-[11px] font-semibold tracking-wider shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 uppercase flex items-center gap-2 group-hover:bg-[#004C8F] group-hover:shadow-blue-200"
                >
                    <Plus className="w-3.5 h-3.5" />
                    New Reward
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {items.map((item) => (
                    <RewardCard
                        key={item.catalog_id}
                        item={item}
                        onEdit={onEdit}
                        onRestock={onRestock}
                    />
                ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={!pagination.has_previous}
                        className="h-10 px-5 rounded-xl text-[10px] font-semibold tracking-wider uppercase border-slate-200 disabled:opacity-40 active:scale-95 transition-all"

                    >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Prev
                    </Button>

                    {getPages(pagination.total_pages, page).map((p, idx) =>
                        p === "..." ? (
                            <span
                                key={`e${idx}`}
                                className="px-2 text-slate-300 text-sm font-bold"
                            >
                                …
                            </span>
                        ) : (
                            <Button
                                key={p}
                                variant={p === page ? "default" : "outline"}
                                size="icon"
                                onClick={() => setPage(p as number)}
                                className={cn(
                                    "w-10 h-10 rounded-xl text-xs font-semibold transition-all active:scale-95",
                                    p === page
                                        ? "bg-[#004C8F] text-white shadow-lg border-none hover:bg-[#003d73]"
                                        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                                )}
                            >
                                {p}
                            </Button>
                        )
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={!pagination.has_next}
                        className="h-10 px-5 rounded-xl text-[10px] font-semibold tracking-wider uppercase border-slate-200 disabled:opacity-40 active:scale-95 transition-all"

                    >
                        Next
                        <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                </div>
            )}
        </div>
    );
}
