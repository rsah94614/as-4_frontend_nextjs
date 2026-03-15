"use client";

import { Building2, Users, Tag } from "lucide-react";

interface DepartmentStatsProps {
    total: number;
    active: number;
    types: number;
}

export function DepartmentStats({ total, active, types }: DepartmentStatsProps) {
    const stats = [
        { label: "Total Departments", value: total, icon: Building2, accent: "#1a4ab5" },
        { label: "Active", value: active, icon: Users, accent: "#14a882" },
        { label: "Department Types", value: types, icon: Tag, accent: "#e8192c" },
    ];

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