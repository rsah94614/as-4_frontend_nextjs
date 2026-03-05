"use client";

import HistoryCard from "./HistoryCard";
import HistoryListSkeleton from "./HistoryListSkeleton";
import type { HistoryItem, PeriodFilter, TypeFilter } from "./types";

interface HistoryListProps {
    items: HistoryItem[];
    allItemsCount: number;
    loading: boolean;
    error: string | null;
    onRetry: () => void;
    onClearFilters: () => void;
}

export default function HistoryList({
    items,
    allItemsCount,
    loading,
    error,
    onRetry,
    onClearFilters,
}: HistoryListProps) {
    return (
        <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
            {/* Loading */}
            {loading && <HistoryListSkeleton />}

            {/* Error */}
            {!loading && error && (
                <div className="text-center py-12">
                    <p className="text-sm text-red-500">{error}</p>
                    <button
                        onClick={onRetry}
                        className="mt-3 text-sm text-indigo-600 hover:underline"
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* Empty — no data at all */}
            {!loading && !error && allItemsCount === 0 && (
                <div className="text-center py-12">
                    <p className="text-sm text-gray-400">No history found.</p>
                </div>
            )}

            {/* Empty — filters wiped everything */}
            {!loading && !error && allItemsCount > 0 && items.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-sm text-gray-400">
                        No results match the selected filters.
                    </p>
                    <button
                        onClick={onClearFilters}
                        className="mt-3 text-sm text-indigo-600 hover:underline"
                    >
                        Clear filters
                    </button>
                </div>
            )}

            {/* Data */}
            {!loading &&
                !error &&
                items.map((item) => (
                    <HistoryCard key={item.history_id} item={item} />
                ))}
        </div>
    );
}
