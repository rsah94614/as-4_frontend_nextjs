"use client";

import { Building2, Users, Tag } from "lucide-react";

interface DepartmentStatsProps {
    total: number;
    active: number;
    types: number;
}

export function DepartmentStats({ total, active, types }: DepartmentStatsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Total
                </p>
                <p className="text-3xl font-bold text-black">{total}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Active
                </p>
                <p className="text-3xl font-bold text-black">{active}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Types
                </p>
                <p className="text-3xl font-bold text-black">{types}</p>
            </div>
        </div>
    );
}
