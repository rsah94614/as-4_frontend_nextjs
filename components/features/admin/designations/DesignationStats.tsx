"use client";

import { Layers, Users, TrendingUp } from "lucide-react";

interface DesignationStatsProps {
    total: number;
    active: number;
    avgLevel: string;
}

export function DesignationStats({ total, active, avgLevel }: DesignationStatsProps) {
    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 transition hover:shadow-md">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-purple-400" /> Total
                </p>
                <p className="text-3xl font-bold text-black tracking-tight">{total}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 transition hover:shadow-md">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Users className="w-3 h-3 text-emerald-400" /> Active
                </p>
                <p className="text-3xl font-bold text-black tracking-tight">{active}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 transition hover:shadow-md">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-blue-400" /> Avg Level
                </p>
                <p className="text-3xl font-bold text-black tracking-tight font-mono">{avgLevel}</p>
            </div>
        </div>
    );
}
