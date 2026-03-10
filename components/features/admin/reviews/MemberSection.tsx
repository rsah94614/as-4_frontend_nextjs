"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Flag } from "lucide-react";
import { Review, Employee } from "@/types/admin-review-types";
import { Stars } from "./UIHelpers";
import { ReviewRow } from "./ReviewRow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const FLAG_RATING = 2;

interface MemberSectionProps {
    member: Employee;
    reviews: Review[];
    employees: Employee[];
    isManager: boolean;
}

export function MemberSection({
    member,
    reviews,
    employees,
    isManager,
}: MemberSectionProps) {
    const [open, setOpen] = useState(false);
    const memberReviews = reviews.filter(
        (r) => r.receiver_id === member.employee_id
    );
    if (memberReviews.length === 0) return null;

    const avg =
        memberReviews.reduce((s, r) => s + r.rating, 0) / memberReviews.length;
    const flagged = memberReviews.filter((r) => r.rating <= FLAG_RATING).length;

    return (
        <div className="space-y-2 border-l-2 border-slate-100 pl-4 py-1">
            <Button
                variant="ghost"
                onClick={() => setOpen((v) => !v)}
                className={cn(
                    "w-full h-auto flex items-center gap-3 px-4 py-3 rounded-2xl transition text-left group border justify-start",
                    flagged > 0
                        ? "bg-red-50 border-red-100 hover:bg-red-50"
                        : "bg-slate-50 border-transparent hover:bg-slate-100/80 hover:border-slate-100"
                )}
            >
                <div
                    className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform",
                        isManager
                            ? "bg-purple-100 text-purple-700"
                            : "bg-white text-slate-600 border border-slate-200"
                    )}
                >
                    {member.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-black group-hover:text-purple-700 transition-colors">
                        {member.username}
                    </span>
                    {isManager && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100 px-2 py-0.5 rounded-full ml-2 shadow-sm uppercase tracking-tight font-extrabold text-[8px]">
                            Manager
                        </Badge>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <Stars value={Math.round(avg)} />
                    <span className="text-xs font-bold text-black w-8 text-right underline decoration-slate-200 underline-offset-4">
                        {avg.toFixed(1)}
                    </span>
                    {flagged > 0 && (
                        <Badge variant="destructive" className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100 px-2.5 py-1 rounded-full border border-red-200 shadow-sm hover:bg-red-100">
                            <Flag className="w-2.5 h-2.5" />
                            {flagged}
                        </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px] text-slate-400 font-bold bg-white px-2 py-0.5 rounded-full border border-slate-100 shadow-sm hover:bg-white">
                        {memberReviews.length} reviews
                    </Badge>
                    {open ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-purple-500 transition-colors" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-purple-500 transition-colors" />
                    )}
                </div>
            </Button>

            {open && (
                <div className="space-y-2.5 pt-1 animate-in slide-in-from-top-2 duration-300">
                    {memberReviews.map((r) => (
                        <ReviewRow key={r.review_id} review={r} employees={employees} />
                    ))}
                </div>
            )}
        </div>
    );
}
