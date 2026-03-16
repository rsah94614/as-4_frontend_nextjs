"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function RewardBadge({ active }: { active: boolean }) {
    return (
        <Badge
            variant={active ? "secondary" : "destructive"}
            className={cn(
                "rounded-full text-[10px] font-semibold tracking-wider px-3 py-1 border shadow-sm",
                active
                    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                    : "bg-red-100 text-red-800 border-red-200"
            )}
        >
            <span
                className={cn(
                    "w-1.5 h-1.5 rounded-full mr-1.5",
                    active ? "bg-green-500 animate-pulse" : "bg-red-500"
                )}
            />
            {active ? "ACTIVE" : "INACTIVE"}
        </Badge>
    );
}

export function SkeletonRow() {
    return (
        <tr>
            {[40, 20, 50, 15, 15].map((w, i) => (
                <td key={i} className="px-6 py-4">
                    <div
                        className={cn(
                            "h-4 rounded-lg bg-slate-100 animate-shimmer bg-[length:200%_100%]",
                            i === 0 ? "w-48" : i === 1 ? "w-24" : i === 2 ? "w-64" : "w-16"
                        )}
                        style={{
                            backgroundImage: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
                            animation: "shimmer 2s infinite linear",
                        }}
                    />
                </td>
            ))}
            <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
        </tr>
    );
}

export function RewardField({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5 mb-5 group">
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1 group-focus-within:text-[#004C8F] transition-colors">
                {label}
            </label>
            {children}
        </div>
    );
}

export function RewardStats({
    total,
    active,
    inactive,
}: {
    total: number;
    active: number;
    inactive: number;
}) {
    const stats = [
        { label: "Total", value: total, color: "bg-[#004C8F]", shadow: "shadow-blue-100" },
        { label: "Active", value: active, color: "bg-green-500", shadow: "shadow-green-100" },
        { label: "Inactive", value: inactive, color: "bg-red-500", shadow: "shadow-red-100" },
    ];

    return (
        <div className="flex flex-wrap items-center gap-2 mb-6">
            {stats.map((s) => (
                <div
                    key={s.label}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50"
                >
                    <div className={cn("w-2 h-2 rounded-full shrink-0", s.color)} />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                        {s.label}
                    </span>
                    <span className="text-xs font-black text-gray-800 tabular-nums">
                        {s.value}
                    </span>
                </div>
            ))}
        </div>
    );
}

// ─── Status Badge (Active / Inactive) ─────────────────────────────────────────
export function StatusBadge({ active }: { active: boolean }) {
    return (
        <Badge
            variant={active ? "secondary" : "destructive"}
            className={cn(
                "rounded-full text-[10px] font-semibold tracking-wider px-3 py-1 border shadow-sm",
                active
                    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                    : "bg-red-100 text-red-800 border-red-200"
            )}
        >
            <span
                className={cn(
                    "w-1.5 h-1.5 rounded-full mr-1.5",
                    active ? "bg-green-500 animate-pulse" : "bg-red-500"
                )}
            />
            {active ? "ACTIVE" : "INACTIVE"}
        </Badge>
    );
}

// ─── Stock Badge ──────────────────────────────────────────────────────────────
export function StockBadge({ stock }: { stock: number }) {
    const low = stock > 0 && stock <= 5;
    const config =
        stock === 0
            ? { cls: "bg-red-50 text-red-700 border-red-100", label: "Out of stock" }
            : low
                ? { cls: "bg-amber-50 text-amber-700 border-amber-200", label: `Low stock · ${stock}` }
                : { cls: "bg-blue-50 text-[#004C8F] border-blue-100", label: `${stock} in stock` };

    return (
        <Badge
            variant="secondary"
            className={cn(
                "rounded-full text-[10px] font-semibold tracking-wider px-3 py-1 border shadow-sm",
                config.cls
            )}
        >
            {config.label}
        </Badge>
    );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
export function SkeletonCard() {
    return (
        <Card className="rounded-xl border border-slate-100 p-6 space-y-4 shadow-sm">
            {[55, 85, 100, 65, 40].map((w, i) => (
                <div
                    key={i}
                    className={cn(
                        "rounded-lg bg-slate-100 animate-shimmer bg-[length:200%_100%]",
                        i === 1 ? "h-5" : "h-3"
                    )}
                    style={{
                        width: `${w}%`,
                        backgroundImage: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
                        animation: "shimmer 2s infinite linear",
                    }}
                />
            ))}
            <style>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
        </Card>
    );
}
