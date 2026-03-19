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
        <div className="space-y-6">
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
                        onClick={clearFilters}
                        className={CLEAR_BTN}
                    >
                        Clear filters
                    </button>
                )}
            </div>
        </div>
    );
}
