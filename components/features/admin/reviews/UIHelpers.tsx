"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Calendar Strip ───────────────────────────────────────────────────────────
export function CalendarStrip({
    month, year, onChange,
}: {
    month: number; year: number;
    onChange: (m: number, y: number) => void;
}) {
    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const now = new Date();
    const todayMonth = now.getMonth();
    const todayYear = now.getFullYear();
    const isFuture = (m: number, y: number) => y > todayYear || (y === todayYear && m > todayMonth);

    const prev = () => month === 0 ? onChange(11, year - 1) : onChange(month - 1, year);
    const next = () => month === 11 ? onChange(0, year + 1) : onChange(month + 1, year);
    const isNextDisabled = isFuture(month === 11 ? 0 : month + 1, month === 11 ? year + 1 : year);
    const isNextYearDisabled = isFuture(month, year + 1);

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <button onClick={prev}
                className="w-7 h-7 rounded-lg flex items-center justify-center border border-gray-200 bg-white text-gray-500 hover:bg-[#004C8F] hover:text-white hover:border-[#004C8F] transition-all">
                <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1 flex-wrap">
                {MONTHS.map((m, i) => {
                    const future = isFuture(i, year);
                    return (
                        <button key={m} onClick={() => !future && onChange(i, year)} disabled={future}
                            className={cn(
                                "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all",
                                i === month
                                    ? "text-white"
                                    : future
                                        ? "text-gray-300 cursor-not-allowed"
                                        : "text-gray-500 hover:bg-gray-100"
                            )}
                            style={i === month ? { background: "#004C8F" } : {}}>
                            {m}
                        </button>
                    );
                })}
            </div>

            <button onClick={next} disabled={isNextDisabled}
                className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center border transition-all",
                    isNextDisabled
                        ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                        : "border-gray-200 bg-white text-gray-500 hover:bg-[#004C8F] hover:text-white hover:border-[#004C8F]"
                )}>
                <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1 ml-1 border-l border-gray-100 pl-2">
                <button onClick={() => onChange(month, year - 1)}
                    className="w-6 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 text-xs font-bold transition-all">
                    ◂
                </button>
                <span className="text-sm font-bold px-1 select-none" style={{ color: "#004C8F" }}>
                    {year}
                </span>
                <button onClick={() => !isNextYearDisabled && onChange(month, year + 1)} disabled={isNextYearDisabled}
                    className={cn(
                        "w-6 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all",
                        isNextYearDisabled
                            ? "text-gray-200 cursor-not-allowed"
                            : "text-gray-400 hover:bg-gray-100"
                    )}>
                    ▸
                </button>
            </div>
        </div>
    );
}