"use client";

import type { TeamMemberReportResponse } from "@/types/dashboard-types";
import { cn } from "@/lib/utils";

interface Props {
    member: TeamMemberReportResponse;
    rank: number;
}

function initials(name: string) {
    const parts = name.split(/[._\s-]+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
}

const RANK_AVATAR: Record<number, string> = {
    1: "bg-[#004C8F]",
    2: "bg-[#1D6EC5]",
    3: "bg-[#5B9BD5]",
};

export default function AdminTeamMemberRow({ member, rank }: Props) {
    const rankBg = RANK_AVATAR[rank] ?? "bg-[#EEF4FB]";
    const rankText = rank <= 3 ? "text-white" : "text-[#004C8F]";

    return (
        <tr className="border-b border-gray-50 hover:bg-[#F8FAFD] transition-colors">
            {/* Rank */}
            <td className="py-3.5 px-4 w-12">
                <div className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold",
                    rankBg, rankText,
                    rank > 3 && "bg-[#EEF4FB]",
                )}>
                    {rank}
                </div>
            </td>

            {/* Employee */}
            <td className="py-3.5 px-4">
                <div className="flex items-center gap-2.5">
                    <div className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0",
                        rankBg,
                        rank > 3 && "bg-[#93C5FD]",
                    )}>
                        {initials(member.username)}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 text-sm leading-tight">{member.username}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{member.designation}</p>
                    </div>
                </div>
            </td>

            {/* Points */}
            <td className="py-3.5 px-4 text-right">
                <p className="text-sm font-bold text-gray-900 tabular-nums">
                    {member.total_earned_points.toLocaleString()}
                </p>
                <p className="text-xs text-[#1D6EC5] font-medium mt-0.5 tabular-nums">
                    +{member.points_this_month.toLocaleString()} this mo.
                </p>
            </td>

            {/* Reviews */}
            <td className="py-3.5 px-4 text-right">
                <p className="text-sm font-bold text-gray-900">{member.reviews_received}</p>
                <p className="text-xs text-gray-400 mt-0.5">{member.reviews_this_month} this mo.</p>
            </td>

            {/* Rewards */}
            <td className="py-3.5 px-4 text-right">
                <p className="text-sm font-bold text-gray-900">{member.rewards_redeemed}</p>
            </td>

            {/* Performance */}
            <td className="py-3.5 px-4 min-w-[180px]">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#BFDBFE] bg-[#EEF4FB] text-[#004C8F]">
                        Performance
                    </span>
                    <span className="text-xs font-mono font-bold text-[#004C8F]">
                        {member.performance_score}
                    </span>
                </div>
                <div className="h-1.5 bg-[#EEF4FB] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#004C8F] rounded-full transition-all duration-700"
                        style={{ width: `${member.performance_score}%` }}
                    />
                </div>
            </td>
        </tr>
    );
}
