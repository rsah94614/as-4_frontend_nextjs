"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Zap } from "lucide-react";
import { Review, Employee } from "@/types/admin-review-types";
import { ReviewRow } from "./ReviewRow";

interface MemberSectionProps {
    member: Employee;
    reviews: Review[];
    employees: Employee[];
    isManager: boolean;
}

export function MemberSection({ member, reviews, employees, isManager }: MemberSectionProps) {
    const [open, setOpen] = useState(false);

    const memberReviews = reviews.filter((r) => r.receiver_id === member.employee_id);
    if (memberReviews.length === 0) return null;

    const totalPoints = memberReviews.reduce((s, r) => s + (r.raw_points ?? 0), 0);
    const initial     = member.username.charAt(0).toUpperCase();

    return (
        <div className="border-l-2 pl-4 py-1" style={{ borderColor: "#E5E7EB" }}>
            {/* Member header row */}
            <button
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 group"
            >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 text-white"
                    style={{ background: isManager ? "#004C8F" : "#1E3A5F" }}>
                    {initial}
                </div>

                {/* Name + manager badge */}
                <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-gray-800 group-hover:text-[#004C8F] transition-colors">
                        {member.username}
                    </span>
                    {isManager && (
                        <span className="ml-2 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded text-white"
                            style={{ background: "#004C8F" }}>
                            Manager
                        </span>
                    )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Zap className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        {totalPoints.toFixed(2)} pts
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded">
                        {memberReviews.length} review{memberReviews.length !== 1 ? "s" : ""}
                    </span>
                    {open
                        ? <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-[#004C8F] transition-colors" />
                        : <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-[#004C8F] transition-colors" />}
                </div>
            </button>

            {/* Reviews list */}
            {open && (
                <div className="mt-2 space-y-2">
                    {memberReviews.map((r) => (
                        <ReviewRow key={r.review_id} review={r} employees={employees} />
                    ))}
                </div>
            )}
        </div>
    );
}