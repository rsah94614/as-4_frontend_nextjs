"use client";

import { useState } from "react";
import { useHistoryData } from "@/hooks/useHistoryData";
import HistoryFilterBar from "@/components/features/dashboard/history/HistoryFilterBar";
import HistoryList from "@/components/features/dashboard/history/HistoryList";
import HistoryPagination from "@/components/features/dashboard/history/HistoryPagination";
import dynamic from "next/dynamic";
import type { HistoryItem } from "@/types/history-types";

// Dynamically import the modal to reduce initial JS evaluation time
const TransactionDetailModal = dynamic(() => import("@/components/features/dashboard/history/TransactionDetailModal"), {
    ssr: false
});

import {
    PAGE_WRAPPER,
    PAGE_CONTENT,
    PAGE_HEADER,
    PAGE_HEADER_INNER,
    HDFC_RED,
    HDFC_BLUE
} from "@/components/features/dashboard/history/history-styles";

export default function HistoryPage() {
    const {
        selectedPeriod, setSelectedPeriod,
        selectedType, setSelectedType,
        typeOptions,
        clearFilters,
        allHistory, filteredHistory, paginatedHistory,
        loading, error, retry,
        page, setPage, totalPages,
    } = useHistoryData();

    const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
    const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

    function closeDropdowns() {
        setPeriodDropdownOpen(false);
        setTypeDropdownOpen(false);
    }

    return (
        <div
            className={PAGE_WRAPPER}
            onClick={closeDropdowns}
        >
            {/* ── Page Header ── */}
            <div className={PAGE_HEADER}>
                <div className={PAGE_HEADER_INNER}>
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight" style={{ color: HDFC_BLUE }}>
                            History
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            Review every point movement, reward redemption, and supporting transaction detail in one place.
                        </p>
                    </div>
                    <span className="hidden md:flex items-center text-2xl font-black tracking-tight select-none">
                        <span style={{ color: HDFC_RED }}>A</span>
                        <span style={{ color: HDFC_BLUE }}>abhar</span>
                    </span>
                </div>
            </div>

            <div className="h-0.5 shrink-0" />

            {/* ── Main content ── */}
            <div className={PAGE_CONTENT}>
                <HistoryFilterBar
                    selectedPeriod={selectedPeriod}
                    setSelectedPeriod={setSelectedPeriod}
                    selectedType={selectedType}
                    setSelectedType={setSelectedType}
                    typeOptions={typeOptions}
                    clearFilters={clearFilters}
                    filteredCount={filteredHistory.length}
                    loading={loading}
                    periodDropdownOpen={periodDropdownOpen}
                    setPeriodDropdownOpen={setPeriodDropdownOpen}
                    typeDropdownOpen={typeDropdownOpen}
                    setTypeDropdownOpen={setTypeDropdownOpen}
                />

                <HistoryList
                    items={paginatedHistory}
                    allItemsCount={allHistory.length}
                    loading={loading}
                    error={error}
                    onRetry={retry}
                    onClearFilters={clearFilters}
                    onItemClick={setSelectedItem}
                />

                {!loading && !error && filteredHistory.length > 0 && (
                    <HistoryPagination
                        page={page}
                        totalPages={totalPages}
                        onPrev={() => setPage((p) => Math.max(1, p - 1))}
                        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
                        onPageSelect={setPage}
                    />
                )}
            </div>

            <TransactionDetailModal
                item={selectedItem}
                open={!!selectedItem}
                onClose={() => setSelectedItem(null)}
            />
        </div>
    );
}
