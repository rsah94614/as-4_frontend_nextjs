"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function RewardBadge({ active }: { active: boolean }) {
    return (
        <span
            className={cn(
                "inline-flex items-center text-[10px] font-bold tracking-wider",
                active ? "text-emerald-700" : "text-red-600"
            )}
        >
            {active ? "ACTIVE" : "INACTIVE"}
        </span>
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
    filterState,
    setFilterState,
}: {
    total?: number;
    active?: number;
    inactive?: number;
    filterState?: string;
    setFilterState?: (s: "all" | "active" | "inactive") => void;
}) {
    const stats = [
        { id: "all", label: "Total", value: total },
        { id: "active", label: "Active", value: active },
        { id: "inactive", label: "Inactive", value: inactive },
    ];

    return (
        <div className="flex flex-wrap items-center gap-2">
            {stats.map((s) => {
                const isActive = filterState === s.id;
                return (
                    <button
                        key={s.label}
                        onClick={() => setFilterState?.(s.id as "all" | "active" | "inactive")}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#004C8F]/10",
                            isActive 
                                ? "bg-white border-[#004C8F] shadow-[#004C8F]/10 shadow-sm" 
                                : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                        )}
                    >
                        <span className={cn(
                            "text-[10px] font-bold uppercase tracking-widest whitespace-nowrap",
                            isActive ? "text-[#004C8F]" : "text-gray-400"
                        )}>
                            {s.label}
                        </span>
                        {s.value !== undefined && (
                            <span className={cn(
                                "text-xs font-black tabular-nums",
                                isActive ? "text-[#004C8F]" : "text-gray-800"
                            )}>
                                {s.value}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

// ─── Status Badge (Active / Inactive) ─────────────────────────────────────────
export function StatusBadge({ active }: { active: boolean }) {
    return (
        <span
            className={cn(
                "inline-flex items-center text-[10px] font-bold tracking-wider",
                active ? "text-emerald-400" : "text-red-600"
            )}
        >
            {active ? "ACTIVE" : "INACTIVE"}
        </span>
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
