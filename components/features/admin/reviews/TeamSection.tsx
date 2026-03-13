"use client";

import React, { useMemo } from "react";
import { MessageSquare, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { Review, Employee } from "@/types/admin-review-types";
import { MemberSection } from "./MemberSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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
    const totalCount = teamReviews.length;
    const totalPoints = teamReviews.reduce((s, r) => s + (r.raw_points ?? 0), 0);

    return (
        <Card
            className="rounded-3xl border transition-all duration-300 shadow-sm overflow-hidden border-slate-100/80 hover:shadow-md hover:border-slate-200"
        >
            <Button
                variant="ghost"
                onClick={onToggle}
                className="w-full h-auto flex items-center gap-4 p-5 text-left group transition-all hover:bg-white border-none justify-start"
            >
                <div className="w-12 h-12 rounded-2xl bg-[#004C8F]/10 text-[#004C8F] flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
                    {manager.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-xl font-extrabold text-black tracking-tight group-hover:text-[#004C8F] transition-colors">
                            {manager.username}
                        </p>
                        <Badge variant="secondary" className="bg-[#004C8F]/10 text-[#004C8F] hover:bg-[#004C8F]/10 px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm font-extrabold text-[10px]">
                            Manager
                        </Badge>
                    </div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        {manager.department_name || "—"} ·{" "}
                        <span className="text-slate-500 font-extrabold">{members.length + 1} members</span>
                    </p>
                </div>
                <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm hover:bg-slate-50">
                            <MessageSquare className="w-3.5 h-3.5 text-slate-400 fill-slate-50" />
                            {totalCount}
                        </Badge>
                        {totalPoints > 0 && (
                            <Badge variant="outline" className="flex items-center gap-1.5 text-xs font-bold bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-amber-900 shadow-sm hover:bg-amber-50">
                                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                {totalPoints.toFixed(0)} pts
                            </Badge>
                        )}
                    </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-[#004C8F]/10 transition-colors border border-slate-100">
                    {expanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400 group-hover:text-[#004C8F] transition-colors" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-[#004C8F] transition-colors" />
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