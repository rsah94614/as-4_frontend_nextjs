"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Calendar Strip ───────────────────────────────────────────────────────────
export function CalendarStrip({
    month,
    year,
    onChange,
}: {
    month: number;
    year: number;
    onChange: (m: number, y: number) => void;
}) {
    const MONTHS = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const prev = () =>
        month === 0 ? onChange(11, year - 1) : onChange(month - 1, year);
    const next = () =>
        month === 11 ? onChange(0, year + 1) : onChange(month + 1, year);
    return (
        <div className="flex items-center gap-2 flex-wrap text-black">
            <Button
                variant="ghost"
                size="icon-xs"
                onClick={prev}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition h-8 w-8"
            >
                <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1 flex-wrap">
                {MONTHS.map((m, i) => (
                    <Button
                        key={m}
                        variant={i === month ? "default" : "ghost"}
                        size="xs"
                        onClick={() => onChange(i, year)}
                        className={cn(
                            "px-2.5 py-1 rounded-lg text-xs font-semibold transition",
                            i === month
                                ? "bg-purple-700 text-white shadow font-bold hover:bg-purple-800"
                                : "text-slate-500 hover:bg-slate-100"
                        )}
                    >
                        {m}
                    </Button>
                ))}
            </div>
            <Button
                variant="ghost"
                size="icon-xs"
                onClick={next}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition h-8 w-8"
            >
                <ChevronRight className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1 ml-1">
                <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onChange(month, year - 1)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 text-xs font-bold transition h-8 w-6"
                >
                    ◂
                </Button>
                <span className="text-sm font-bold text-black px-1 leading-none">
                    {year}
                </span>
                <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onChange(month, year + 1)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 text-xs font-bold transition h-8 w-6"
                >
                    ▸
                </Button>
            </div>
        </div>
    );
}

// ─── Stars ────────────────────────────────────────────────────────────────────
export function Stars({ value, size = "sm" }: { value: number; size?: "sm" | "md" }) {
    const cls = size === "md" ? "w-4 h-4" : "w-3 h-3";
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    className={`${cls} ${i <= value
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-200 fill-slate-200"
                        }`}
                />
            ))}
        </div>
    );
}
