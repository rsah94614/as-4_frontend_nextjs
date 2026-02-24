"use client";

import { ChevronDown } from "lucide-react";
import { periodOptions, typeOptions } from "./constants";
import type { PeriodFilter, TypeFilter } from "./types";

interface HistoryFilterBarProps {
    selectedPeriod: PeriodFilter;
    setSelectedPeriod: (v: PeriodFilter) => void;
    selectedType: TypeFilter;
    setSelectedType: (v: TypeFilter) => void;
    clearFilters: () => void;
    filteredCount: number;
    loading: boolean;
    periodDropdownOpen: boolean;
    setPeriodDropdownOpen: (v: boolean) => void;
    typeDropdownOpen: boolean;
    setTypeDropdownOpen: (v: boolean) => void;
}

export default function HistoryFilterBar({
    selectedPeriod,
    setSelectedPeriod,
    selectedType,
    setSelectedType,
    clearFilters,
    filteredCount,
    loading,
    periodDropdownOpen,
    setPeriodDropdownOpen,
    typeDropdownOpen,
    setTypeDropdownOpen,
}: HistoryFilterBarProps) {
    const hasActiveFilter =
        selectedPeriod !== "All History" || selectedType !== "All";

    return (
        <div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                {/* Period Dropdown */}
                <div
                    className="relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => {
                            setPeriodDropdownOpen(!periodDropdownOpen);
                            setTypeDropdownOpen(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-white border rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        {selectedPeriod}
                        <ChevronDown
                            className={`w-4 h-4 transition-transform ${periodDropdownOpen ? "rotate-180" : ""}`}
                        />
                    </button>

                    {periodDropdownOpen && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                            {periodOptions.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => {
                                        setSelectedPeriod(option);
                                        setPeriodDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${selectedPeriod === option
                                            ? "text-indigo-600 font-semibold bg-indigo-50"
                                            : "text-gray-700"
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Transaction Type Dropdown */}
                <div
                    className="relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => {
                            setTypeDropdownOpen(!typeDropdownOpen);
                            setPeriodDropdownOpen(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-white border rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        {selectedType === "All" ? "Transaction Type" : selectedType}
                        <ChevronDown
                            className={`w-4 h-4 transition-transform ${typeDropdownOpen ? "rotate-180" : ""}`}
                        />
                    </button>

                    {typeDropdownOpen && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                            {typeOptions.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => {
                                        setSelectedType(option);
                                        setTypeDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${selectedType === option
                                            ? "text-indigo-600 font-semibold bg-indigo-50"
                                            : "text-gray-700"
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Clear filters button */}
                {hasActiveFilter && (
                    <button
                        onClick={clearFilters}
                        className="px-3 py-1.5 text-xs text-indigo-600 border border-indigo-200 rounded-full hover:bg-indigo-50 transition-colors"
                    >
                        Clear filters
                    </button>
                )}
            </div>

            {/* Result count chip */}
            {hasActiveFilter && !loading && (
                <p className="mt-3 text-xs text-gray-400">
                    Showing{" "}
                    <span className="font-medium text-gray-600">{filteredCount}</span>{" "}
                    result{filteredCount !== 1 ? "s" : ""} for{" "}
                    {selectedPeriod !== "All History" && (
                        <span className="font-medium text-gray-600">
                            &quot;{selectedPeriod}&quot;
                        </span>
                    )}
                    {selectedPeriod !== "All History" && selectedType !== "All" && " · "}
                    {selectedType !== "All" && (
                        <span className="font-medium text-gray-600">
                            &quot;{selectedType}&quot;
                        </span>
                    )}
                </p>
            )}
        </div>
    );
}
