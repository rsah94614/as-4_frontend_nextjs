"use client";

import React, { useMemo } from "react";
import { MessageSquare, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { Review, Employee } from "@/types/admin-review-types";
import { MemberSection } from "./MemberSection";

interface TeamSectionProps {
    manager: Employee;
    members: Employee[];
    reviews: Review[];
    employees: Employee[];
    expanded: boolean;
    onToggle: () => void;
}

export function TeamSection({ manager, members, reviews, employees, expanded, onToggle }: TeamSectionProps) {
    const teamIds = useMemo(
        () => new Set([manager.employee_id, ...members.map((m) => m.employee_id)]),
        [manager.employee_id, members]
    );

    const teamReviews = reviews.filter((r) => teamIds.has(r.receiver_id));
    const totalCount  = teamReviews.length;
    const totalPoints = teamReviews.reduce((s, r) => s + (r.raw_points ?? 0), 0);
    const initial     = manager.username.charAt(0).toUpperCase();

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
            {/* Top accent bar */}
            <div className="h-0.5 w-full" style={{ background: "#004C8F" }} />

            {/* Team header */}
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-gray-50 transition-colors group"
            >
                {/* Avatar */}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base text-white shrink-0 group-hover:scale-105 transition-transform"
                    style={{ background: "#004C8F" }}>
                    {initial}
                </div>

                {/* Manager info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-bold group-hover:text-[#004C8F] transition-colors" style={{ color: "#004C8F" }}>
                            {manager.username}
                        </p>
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded text-white"
                            style={{ background: "#E31837" }}>
                            Manager
                        </span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-medium">
                        {manager.department_name || "—"}
                        <span className="mx-1.5 text-gray-300">·</span>
                        <span className="font-bold text-gray-500">{members.length + 1} members</span>
                    </p>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 bg-gray-50 text-gray-600">
                        <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                        {totalCount}
                    </span>
                    {totalPoints > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 border border-amber-200 text-amber-800">
                            <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {totalPoints.toFixed(2)} pts
                        </span>
                    )}
                </div>

                {/* Chevron */}
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 group-hover:bg-[#004C8F]/10 transition-colors shrink-0">
                    {expanded
                        ? <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-[#004C8F] transition-colors" />
                        : <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-[#004C8F] transition-colors" />}
                </div>
            </button>

            {/* Expanded members */}
            {expanded && (
                <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-5 space-y-3">
                    {totalCount === 0 ? (
                        <div className="py-10 bg-white rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center gap-2">
                            <MessageSquare className="w-6 h-6 text-gray-200" />
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No reviews this period</p>
                        </div>
                    ) : (
                        [manager, ...members].map((member) => (
                            <MemberSection
                                key={member.employee_id}
                                member={member}
                                reviews={reviews}
                                employees={employees}
                                isManager={member.employee_id === manager.employee_id}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}