"use client";

import React from "react";
import { Zap, Clock, Archive, HelpCircle } from "lucide-react";
import { Multiplier, MultiplierStatus } from "@/types/multiplier-types";

export const todayStr = () => new Date().toISOString().slice(0, 10);

export function getStatus(m: Multiplier): MultiplierStatus {
    if (!m.effective_from || !m.effective_to) return "undated";
    const t = todayStr();
    if (m.effective_from <= t && t <= m.effective_to) return "active";
    if (m.effective_from > t) return "upcoming";
    return "past";
}

export function StatusBadge({ m }: { m: Multiplier }) {
    const s = getStatus(m);
    if (s === "active") return <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg"><Zap className="w-3 h-3" />Active now</span>;
    if (s === "upcoming") return <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg"><Clock className="w-3 h-3" />Upcoming</span>;
    if (s === "past") return <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg"><Archive className="w-3 h-3" />Past</span>;
    return <span className="text-xs text-gray-300 font-medium italic">No dates set</span>;
}

export function formatDate(d?: string) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">{label}</label>
                {hint && (
                    <span className="group relative cursor-default">
                        <HelpCircle className="w-3 h-3 text-gray-300" />
                        <span className="absolute left-5 top-0 z-10 w-56 bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 hidden group-hover:block shadow-xl leading-relaxed">
                            {hint}
                        </span>
                    </span>
                )}
            </div>
            {children}
        </div>
    );
}
