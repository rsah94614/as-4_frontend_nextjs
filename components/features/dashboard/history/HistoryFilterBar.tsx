"use client";

import { ChevronDown } from "lucide-react";
import { periodOptions } from "./constants";
import type { HistoryTypeOption, PeriodFilter, TypeFilter } from "@/types/history-types";

import {
    FILTER_BTN_BASE,
    FILTER_BTN_ACTIVE,
    CLEAR_BTN,
    DROPDOWN_MENU,
    DROPDOWN_ITEM,
    DROPDOWN_ITEM_ACTIVE,
    DROPDOWN_ITEM_INACTIVE
} from "./history-styles";

interface HistoryFilterBarProps {
    selectedPeriod: PeriodFilter;
    setSelectedPeriod: (v: PeriodFilter) => void;
    selectedType: TypeFilter;
    setSelectedType: (v: TypeFilter) => void;
    typeOptions: HistoryTypeOption[];
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
    typeOptions,
    clearFilters,
    filteredCount,
    periodDropdownOpen,
    setPeriodDropdownOpen,
    typeDropdownOpen,
    setTypeDropdownOpen,
}: HistoryFilterBarProps) {
    const hasActiveFilter =
        selectedPeriod !== "All History" || selectedType !== "All";
    const disableTypeFilter = selectedPeriod === "Points History";
    const selectedTypeLabel =
        selectedType === "All"
            ? "Transaction Type"
            : typeOptions.find((option) => option.value === selectedType)?.label ?? selectedType;

    return (
        <div className="rounded-[24px] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 sm:p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Refine Results
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-[#004C8F]/15 bg-[#004C8F]/5 px-3 py-1 text-sm font-medium text-[#004C8F]">
                            {filteredCount} {filteredCount === 1 ? "transaction" : "transactions"}
                        </span>
                        {hasActiveFilter && (
                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">
                                Filters active
                            </span>
                        )}
                        {disableTypeFilter && (
                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
                                Type filter is unavailable for points history
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                {/* Period Dropdown */}
                <div
                    className="relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        type="button"
                        onClick={() => {
                            setPeriodDropdownOpen(!periodDropdownOpen);
                            setTypeDropdownOpen(false);
                        }}
                        aria-expanded={periodDropdownOpen}
                        className={`${FILTER_BTN_BASE} ${selectedPeriod !== "All History" ? FILTER_BTN_ACTIVE : ""
                            }`}
                    >
                        <span className="truncate max-w-[120px] sm:max-w-none">
                            {selectedPeriod}
                        </span>
                        <ChevronDown
                            className={`w-4 h-4 shrink-0 transition-transform duration-200 ${periodDropdownOpen ? "rotate-180" : ""}`}
                        />
                    </button>

                    {periodDropdownOpen && (
                        <div className={DROPDOWN_MENU}>
                            {periodOptions.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => {
                                        setSelectedPeriod(option);
                                        setPeriodDropdownOpen(false);
                                    }}
                                    className={`${DROPDOWN_ITEM} ${selectedPeriod === option
                                        ? DROPDOWN_ITEM_ACTIVE
                                        : DROPDOWN_ITEM_INACTIVE
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div
                    className={`relative ${disableTypeFilter ? "opacity-50" : ""}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        type="button"
                        onClick={() => {
                            if (disableTypeFilter) return;
                            setTypeDropdownOpen(!typeDropdownOpen);
                            setPeriodDropdownOpen(false);
                        }}
                        aria-expanded={typeDropdownOpen}
                        disabled={disableTypeFilter}
                        className={`${FILTER_BTN_BASE} ${selectedType !== "All" ? FILTER_BTN_ACTIVE : ""
                            }`}
                    >
                        <span className="truncate max-w-[120px] sm:max-w-none">
                            {selectedTypeLabel}
                        </span>
                        <ChevronDown
                            className={`w-4 h-4 shrink-0 transition-transform duration-200 ${typeDropdownOpen ? "rotate-180" : ""}`}
                        />
                    </button>

                    {typeDropdownOpen && (
                        <div className={DROPDOWN_MENU}>
                            <button
                                onClick={() => {
                                    setSelectedType("All");
                                    setTypeDropdownOpen(false);
                                }}
                                className={`${DROPDOWN_ITEM} ${selectedType === "All"
                                    ? DROPDOWN_ITEM_ACTIVE
                                    : DROPDOWN_ITEM_INACTIVE
                                    }`}
                            >
                                All
                            </button>
                            {typeOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        setSelectedType(option.value);
                                        setTypeDropdownOpen(false);
                                    }}
                                    className={`${DROPDOWN_ITEM} ${selectedType === option.value
                                        ? DROPDOWN_ITEM_ACTIVE
                                        : DROPDOWN_ITEM_INACTIVE
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Clear filters button */}
                {hasActiveFilter && (
                    <button
                        type="button"
                        onClick={clearFilters}
                        className={CLEAR_BTN}
                    >
                        Clear filters
                    </button>
                )}
                </div>
            </div>
        </div>
    );
}
