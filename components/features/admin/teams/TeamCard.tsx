"use client";

import React from "react";
import { Users, ChevronDown, ChevronUp } from "lucide-react";
import { Employee } from "@/types/team-types";

interface TeamCardProps {
    manager: Employee;
    members: Employee[];
    expanded: boolean;
    selected: boolean;
    onToggle: () => void;
    onSelect: () => void;
}

export function TeamCard({
    manager,
    members,
    expanded,
    selected,
    onToggle,
    onSelect,
}: TeamCardProps) {
    return (
        <div
            className={`bg-white rounded-2xl border transition-all ${selected ? "border-purple-300 shadow-md" : "border-slate-100 shadow-sm"
                }`}
        >
            <div
                className="flex items-center gap-3 p-4 cursor-pointer"
                onClick={() => {
                    onSelect();
                    onToggle();
                }}
            >
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold flex-shrink-0">
                    {manager.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="font-bold text-black truncate">{manager.username}</p>
                        <span className="text-[10px] font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex-shrink-0">
                            Manager
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                        {manager.designation_name || "—"} · {manager.department_name || "—"}
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full">
                        <Users className="w-3 h-3" />
                        {members.length}
                    </span>
                    {expanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                </div>
            </div>

            {expanded && (
                <div className="border-t border-slate-100 divide-y divide-slate-50">
                    {members.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">
                            No direct reports
                        </p>
                    ) : (
                        members.map((emp) => (
                            <div
                                key={emp.employee_id}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/60 transition"
                            >
                                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    {emp.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-black truncate">
                                        {emp.username}
                                    </p>
                                    <p className="text-xs text-slate-400 truncate">{emp.email}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-xs font-semibold text-black">
                                        {emp.designation_name || "—"}
                                    </p>
                                    <span
                                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${emp.is_active
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-500"
                                            }`}
                                    >
                                        {emp.is_active ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
