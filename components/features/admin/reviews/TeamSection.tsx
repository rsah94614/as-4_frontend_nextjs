"use client";

import React, { useMemo } from "react";
import { MessageSquare, Star, Flag, ChevronDown, ChevronUp } from "lucide-react";
import { Review, Employee } from "@/types/admin-review-types";
import { MemberSection } from "./MemberSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FLAG_RATING = 2;

interface TeamSectionProps {
    manager: Employee;
    members: Employee[];
    reviews: Review[];
    employees: Employee[];
    expanded: boolean;
    onToggle: () => void;
}

export function TeamSection({
    manager,
    members,
    reviews,
    employees,
    expanded,
    onToggle,
}: TeamSectionProps) {
    const teamIds = useMemo(
        () => new Set([manager.employee_id, ...members.map((m) => m.employee_id)]),
        [manager.employee_id, members]
    );

    const teamReviews = reviews.filter((r) => teamIds.has(r.receiver_id));
    const flaggedCount = teamReviews.filter((r) => r.rating <= FLAG_RATING).length;
    const totalCount = teamReviews.length;
    const avg = totalCount > 0
        ? teamReviews.reduce((s, r) => s + r.rating, 0) / totalCount
        : 0;

    return (
        <Card
            className={cn(
                "rounded-3xl border transition-all duration-300 shadow-sm overflow-hidden",
                flaggedCount > 0 ? "border-red-100 bg-red-50/10" : "border-slate-100/80 hover:shadow-md hover:border-slate-200"
            )}
        >
            <Button
                variant="ghost"
                onClick={onToggle}
                className="w-full h-auto flex items-center gap-4 p-5 text-left group transition-all hover:bg-white border-none justify-start"
            >
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
                    {manager.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-xl font-extrabold text-black tracking-tight group-hover:text-purple-700 transition-colors">
                            {manager.username}
                        </p>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100 px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm font-extrabold text-[10px]">
                            Manager
                        </Badge>
                    </div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        {manager.department_name || "—"} ·{" "}
                        <span className="text-slate-500 font-extrabold">{members.length + 1} members</span>
                    </p>
                </div>
                <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                    <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm hover:bg-slate-50">
                                <MessageSquare className="w-3.5 h-3.5 text-slate-400 fill-slate-50" />
                                {totalCount}
                            </Badge>
                            {avg > 0 && (
                                <Badge variant="outline" className="flex items-center gap-1.5 text-xs font-bold bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-amber-900 shadow-sm hover:bg-amber-50">
                                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                    {avg.toFixed(1)}
                                </Badge>
                            )}
                            {flaggedCount > 0 && (
                                <Badge variant="destructive" className="flex items-center gap-1.5 text-xs font-black text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl shadow-md animate-pulse hover:bg-red-50">
                                    <Flag className="w-3.5 h-3.5 fill-red-50" />
                                    {flaggedCount} flagged
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-purple-100 transition-colors border border-slate-100">
                    {expanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400 group-hover:text-purple-600 transition-colors" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-purple-600 transition-colors" />
                    )}
                </div>
            </Button>

            {expanded && (
                <div className="border-t border-slate-50 p-6 space-y-4 bg-slate-50/10 animate-in fade-in duration-500">
                    {totalCount === 0 ? (
                        <div className="py-12 bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-3">
                            <MessageSquare className="w-8 h-8 text-slate-200" />
                            <p className="text-xs font-bold text-slate-400 text-center uppercase tracking-widest leading-relaxed">No reviews received<br />this period.</p>
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
        </Card>
    );
}
