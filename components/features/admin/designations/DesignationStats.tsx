"use client";

import { Layers, Users, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DesignationStatsProps {
    total: number;
    active: number;
    avgLevel: string;
    loading?: boolean;
}

export function DesignationStats({ total, active, avgLevel, loading = false }: DesignationStatsProps) {
    const stats = [
        { label: "Total Designations", value: total, icon: Layers, accent: "#1a4ab5" },
        { label: "Active", value: active, icon: Users, accent: "#1a4ab5" },
        { label: "Avg Level", value: avgLevel, icon: TrendingUp, accent: "#1a4ab5" },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm"
                        style={{ border: "1px solid #e5e7eb" }}
                    >
                        <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-3.5 w-28" />
                            <Skeleton className="h-7 w-16" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map(({ label, value, icon: Icon, accent }) => (
                <div
                    key={label}
                    className="bg-white rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm"
                    style={{ border: "1px solid #e5e7eb" }}
                >
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: accent + "1a" }}
                    >
                        <Icon className="w-5 h-5" style={{ color: accent }} />
                    </div>
                    <div>
                        <p className="text-xs font-medium" style={{ color: "#6b7280" }}>{label}</p>
                        <p className="text-2xl font-bold" style={{ color: "#111827" }}>{value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
