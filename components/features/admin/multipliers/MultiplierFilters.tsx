"use client";

import { Quarter, QUARTERS } from "@/types/multiplier-types";

const Q_META: Record<Quarter, { label: string; months: string; pill: string; dot: string }> = {
    1: { label: "Q1", months: "Jan – Mar", pill: "bg-sky-50 text-sky-700 border-sky-200", dot: "bg-sky-400" },
    2: { label: "Q2", months: "Apr – Jun", pill: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-400" },
    3: { label: "Q3", months: "Jul – Sep", pill: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-400" },
    4: { label: "Q4", months: "Oct – Dec", pill: "bg-pink-50 text-pink-700 border-pink-200", dot: "bg-pink-400" },
};

interface MultiplierFiltersProps {
    filterQuarter: Quarter | 0;
    onFilterChange: (q: Quarter | 0) => void;
}

export function MultiplierFilters({ filterQuarter, onFilterChange }: MultiplierFiltersProps) {
    return (
        <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">Quarter:</span>
            {([0, ...QUARTERS] as (Quarter | 0)[]).map(q => {
                const meta = q ? Q_META[q as Quarter] : null;
                return (
                    <button
                        key={q}
                        onClick={() => onFilterChange(q)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${filterQuarter === q
                                ? meta ? `${meta.pill} border-current shadow-sm` : "bg-gray-900 text-white border-gray-900"
                                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
                            }`}
                    >
                        {meta && <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />}
                        {q === 0 ? "All Quarters" : `${meta!.label} (${meta!.months})`}
                    </button>
                );
            })}
        </div>
    );
}
