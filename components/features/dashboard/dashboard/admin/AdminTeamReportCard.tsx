"use client";

import { Users, TrendingUp, Star, ArrowRight } from "lucide-react";
import type { TeamSummaryResponse } from "@/types/dashboard-types";


interface Props {
    team: TeamSummaryResponse;
    index: number;
    onClick: () => void;
}

export default function AdminTeamReportCard({ team, onClick }: Props) {

    return (
        <div
            onClick={onClick}
            className="relative bg-white border-2 border-[#BFDBFE] rounded-2xl p-5 cursor-pointer group
                       transition-all duration-200 hover:border-[#004C8F] hover:shadow-lg hover:shadow-[#004C8F]/10 hover:-translate-y-0.5"
        >
            {/* Blue top accent bar */}
            {/* <div className="absolute top-0 left-5 right-5 h-0.5 bg-gradient-to-r from-[#004C8F] to-[#93C5FD] rounded-full" /> */}

            {/* Header */}
            <div className="flex items-start justify-between mb-4 mt-1">
                <div className="flex items-center gap-2.5">
                    <div className="bg-[#EEF4FB] p-2 rounded-xl border border-[#BFDBFE]">
                        <Users className="w-4 h-4 text-[#004C8F]" />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                            Department
                        </p>
                        <h3 className="font-bold text-[#004C8F] text-sm leading-tight">
                            {team.department_name}
                        </h3>
                    </div>
                </div>
                <span className="text-[11px] font-semibold text-[#004C8F] bg-[#EEF4FB] border border-[#BFDBFE] px-2.5 py-1 rounded-full shrink-0">
                    {team.total_members} members
                </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#F0F7FF] border border-[#DBEAFE] rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                        <Star className="w-3 h-3 text-[#93C5FD]" />
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                            Total Points
                        </p>
                    </div>
                    <p className="text-xl font-black text-gray-900 tabular-nums">
                        {team.total_points.toLocaleString()}
                    </p>
                </div>
                <div className="border border-[#DBEAFE] rounded-xl p-3 bg-[#F0F7FF]">
                    <div className="flex items-center gap-1.5 mb-1">
                        <TrendingUp className="w-3 h-3 text-[#93C5FD]" />
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                            Avg Score
                        </p>
                    </div>
                    <p className="text-xl font-black tabular-nums text-[#004C8F]">
                        {team.avg_performance_score}%
                    </p>
                </div>
            </div>

            {/* Performance bar */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#BFDBFE] bg-[#EEF4FB] text-[#004C8F]">
                        Performance
                    </span>
                    <span className="text-[11px] font-bold text-gray-400">{team.avg_performance_score}%</span>
                </div>
                <div className="h-1.5 bg-[#EEF4FB] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#004C8F] rounded-full transition-all duration-700"
                        style={{ width: `${team.avg_performance_score}%` }}
                    />
                </div>
            </div>

            {/* CTA */}
            <div className="flex items-center justify-end mt-3 gap-1 text-gray-400 group-hover:text-[#004C8F] transition-colors duration-200">
                <span className="text-xs font-semibold">View Report</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
        </div>
    );
}
