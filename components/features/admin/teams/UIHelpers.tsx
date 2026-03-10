"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Star, Users } from "lucide-react";
import { Employee, MemberStats } from "@/types/team-types";

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
        <div className="flex items-center gap-2 flex-wrap">
            <button
                onClick={prev}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 flex-wrap">
                {MONTHS.map((m, i) => (
                    <button
                        key={m}
                        onClick={() => onChange(i, year)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${i === month
                                ? "bg-purple-700 text-white shadow"
                                : "text-slate-500 hover:bg-slate-100"
                            }`}
                    >
                        {m}
                    </button>
                ))}
            </div>
            <button
                onClick={next}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition"
            >
                <ChevronRight className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 ml-1">
                <button
                    onClick={() => onChange(month, year - 1)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 text-xs font-bold transition"
                >
                    ◂
                </button>
                <span className="text-sm font-bold text-black px-1">{year}</span>
                <button
                    onClick={() => onChange(month, year + 1)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 text-xs font-bold transition"
                >
                    ▸
                </button>
            </div>
        </div>
    );
}

// ─── Stars ────────────────────────────────────────────────────────────────────
export function Stars({ value }: { value: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    className={`w-3 h-3 ${i <= Math.round(value)
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-200 fill-slate-200"
                        }`}
                />
            ))}
            <span className="text-xs font-semibold text-black ml-1">
                {value > 0 ? value.toFixed(1) : "—"}
            </span>
        </div>
    );
}

// ─── Stats Panel ──────────────────────────────────────────────────────────────
export function StatsPanel({
    manager,
    members,
    statsMap,
    month,
    year,
}: {
    manager: Employee | null;
    members: Employee[];
    statsMap: Record<string, MemberStats>;
    month: number;
    year: number;
}) {
    const MONTH_NAMES = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ];

    if (!manager) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3 p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm text-slate-400 font-medium">
                    Click a team to view stats
                </p>
            </div>
        );
    }

    const all = [manager, ...members];
    const rated = all.filter(
        (m) => (statsMap[m.employee_id]?.review_count ?? 0) > 0
    );
    const teamAvg =
        rated.length > 0
            ? rated.reduce(
                (s, m) => s + (statsMap[m.employee_id]?.avg_rating ?? 0),
                0
            ) / rated.length
            : 0;

    return (
        <div className="flex flex-col gap-4 p-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                    {manager.username.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p className="text-xs font-bold text-black">{manager.username}&apos;s Team</p>
                    <p className="text-[10px] text-slate-400">
                        {MONTH_NAMES[month]} {year}
                    </p>
                </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                <p className="text-[10px] text-amber-600 font-semibold uppercase tracking-wide mb-1">
                    Team Avg Rating
                </p>
                <Stars value={Number(teamAvg.toFixed(1))} />
                <p className="text-[10px] text-slate-400 mt-1">
                    {rated.length} of {all.length} member{all.length !== 1 ? "s" : ""}{" "}
                    reviewed
                </p>
            </div>

            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Members
            </p>

            <div className="space-y-2">
                {all.map((m, idx) => {
                    const s = statsMap[m.employee_id];
                    return (
                        <div
                            key={m.employee_id}
                            className="bg-white border border-slate-100 rounded-xl p-3 space-y-2"
                        >
                            <div className="flex items-center gap-2">
                                <div
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${idx === 0
                                            ? "bg-purple-100 text-purple-700"
                                            : "bg-slate-100 text-slate-500"
                                        }`}
                                >
                                    {m.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-black truncate">
                                        {m.username}
                                    </p>
                                    <p className="text-[10px] text-slate-400 truncate">
                                        {m.designation_name || "—"}
                                    </p>
                                </div>
                                {idx === 0 && (
                                    <span className="text-[9px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full flex-shrink-0">
                                        Lead
                                    </span>
                                )}
                            </div>
                            <div className="bg-slate-50 rounded-lg p-2">
                                <p className="text-[9px] text-slate-400 mb-0.5">
                                    Avg Rating{" "}
                                    {s?.review_count ? `(${s.review_count} reviews)` : "(no reviews)"}
                                </p>
                                <Stars value={s?.avg_rating ?? 0} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
