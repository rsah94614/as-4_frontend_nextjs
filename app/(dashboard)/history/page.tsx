"use client";

import { useState } from "react";
import { useHistoryData } from "@/components/features/history/useHistoryData";
import HistoryFilterBar from "@/components/features/history/HistoryFilterBar";
import HistoryList from "@/components/features/history/HistoryList";
import HistoryPagination from "@/components/features/history/HistoryPagination";

export default function HistoryPage() {
    const {
        selectedPeriod, setSelectedPeriod,
        selectedType, setSelectedType,
        clearFilters,
        allHistory, filteredHistory,
        loading, error, retry,
        page, setPage, totalPages,
    } = useHistoryData();

    const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
    const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);

    function closeDropdowns() {
        setPeriodDropdownOpen(false);
        setTypeDropdownOpen(false);
    }

    return (
        <div
            className="bg-white rounded-2xl md:rounded-4xl min-h-screen shadow-2xs"
            onClick={closeDropdowns}
        >
            <div className="p-4 sm:p-6 md:p-8">
                <HistoryFilterBar
                    selectedPeriod={selectedPeriod}
                    setSelectedPeriod={setSelectedPeriod}
                    selectedType={selectedType}
                    setSelectedType={setSelectedType}
                    clearFilters={clearFilters}
                    filteredCount={filteredHistory.length}
                    loading={loading}
                    periodDropdownOpen={periodDropdownOpen}
                    setPeriodDropdownOpen={setPeriodDropdownOpen}
                    typeDropdownOpen={typeDropdownOpen}
                    setTypeDropdownOpen={setTypeDropdownOpen}
                />

                <HistoryList
                    items={filteredHistory}
                    allItemsCount={allHistory.length}
                    loading={loading}
                    error={error}
                    onRetry={retry}
                    onClearFilters={clearFilters}
                    selectedPeriod={selectedPeriod}
                    selectedType={selectedType}
                />

                {!loading && !error && (
                    <HistoryPagination
                        page={page}
                        totalPages={totalPages}
                        onPrev={() => setPage((p) => Math.max(1, p - 1))}
                        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
                    />
                )}
            </div>
        </div>
    );
}