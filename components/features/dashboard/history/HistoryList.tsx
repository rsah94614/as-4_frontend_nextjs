"use client";

import HistoryCard from "./HistoryCard";
import HistoryListSkeleton from "./HistoryListSkeleton";
import type { HistoryItem } from "@/types/history-types";

interface HistoryListProps {
    items: HistoryItem[];
    allItemsCount: number;
    loading: boolean;
    error: string | null;
    onRetry: () => void;
    onClearFilters: () => void;
    onItemClick?: (item: HistoryItem) => void;
}

export default function HistoryList({
    items,
    allItemsCount,
    loading,
    error,
    onRetry,
    onClearFilters,
    onItemClick,
}: HistoryListProps) {
    return (
        <div className="mt-6 space-y-4 sm:space-y-5">
            {/* Loading */}
            {loading && <HistoryListSkeleton />}

            {/* Error */}
            {!loading && error && (
                <div className="rounded-[24px] border border-slate-200/80 bg-white px-6 py-12 text-center shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                    <p className="text-base font-semibold text-slate-800">Unable to load history</p>
                    <p className="mt-2 text-sm text-slate-500">{error}</p>
                    <button
                        type="button"
                        onClick={onRetry}
                        className="mt-4 inline-flex items-center rounded-full border border-[#004C8F]/15 bg-[#004C8F]/5 px-4 py-2 text-sm font-medium text-[#004C8F] transition-colors hover:bg-[#004C8F]/10"
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* Empty — no data at all */}
            {!loading && !error && allItemsCount === 0 && (
                <div className="rounded-[24px] border border-dashed border-slate-200 bg-white/80 px-6 py-12 text-center">
                    <p className="text-base font-semibold text-slate-700">No history yet</p>
                    <p className="mt-2 text-sm text-slate-500">Transactions and redemptions will appear here once activity starts.</p>
                </div>
            )}

            {/* Empty — filters wiped everything */}
            {!loading && !error && allItemsCount > 0 && items.length === 0 && (
                <div className="rounded-[24px] border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
                    <p className="text-base font-semibold text-slate-700">No matches for the current filters</p>
                    <p className="mt-2 text-sm text-slate-500">Try broadening the date range or resetting the transaction type.</p>
                    <button
                        type="button"
                        onClick={onClearFilters}
                        className="mt-4 inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-[#004C8F]/20 hover:bg-[#004C8F]/5 hover:text-[#004C8F]"
                    >
                        Clear filters
                    </button>
                </div>
            )}

            {/* Data */}
            {!loading &&
                !error &&
                items.map((item) => (
                    <HistoryCard key={item.history_id} item={item} onClick={onItemClick} />
                ))}
        </div>
    );
}
