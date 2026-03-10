"use client";

import React from "react";

export function Field({
    label, hint, children,
}: {
    label: string; hint?: string; children: React.ReactNode;
}) {
    return (
        <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                {label}
            </label>
            {children}
            {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
        </div>
    );
}

export function LevelBadge({ level }: { level: number }) {
    const colors = [
        "bg-purple-100 text-purple-700",
        "bg-blue-100 text-blue-700",
        "bg-cyan-100 text-cyan-700",
        "bg-green-100 text-green-700",
        "bg-amber-100 text-amber-700",
        "bg-orange-100 text-orange-700",
        "bg-red-100 text-red-700",
    ];
    const cls = colors[(level - 1) % colors.length] ?? "bg-slate-100 text-slate-600";
    return (
        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${cls}`}>
            {level}
        </span>
    );
}
