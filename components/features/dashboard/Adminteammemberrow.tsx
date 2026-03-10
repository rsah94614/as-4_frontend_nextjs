"use client";
import { scoreColor } from "./Adminteamreportcard";
import type { TeamMemberReportResponse } from "@/types/dashboard-types";

interface Props {
  member: TeamMemberReportResponse;
  rank: number;
}

export default function AdminTeamMemberRow({ member, rank }: Props) {
  const colors = scoreColor(member.performance_score);

  return (
    <tr className="border-b border-[#f0f0f0] hover:bg-gray-50/60 transition-colors">
      {/* Rank */}
      <td className="py-3.5 px-4 text-sm font-bold text-gray-400 w-12">
        #{rank}
      </td>

      {/* Employee */}
      <td className="py-3.5 px-4">
        <p className="font-semibold text-gray-900 text-sm">{member.username}</p>
        <p className="text-xs text-gray-400 mt-0.5">{member.designation}</p>
      </td>

      {/* Points Earned */}
      <td className="py-3.5 px-4 text-right">
        <p className="text-sm font-bold text-gray-900">
          {member.total_earned_points.toLocaleString()}
        </p>
        <p className="text-xs text-emerald-600 mt-0.5 font-medium">
          +{member.points_this_month.toLocaleString()} this month
        </p>
      </td>

      {/* Reviews */}
      <td className="py-3.5 px-4 text-right">
        <p className="text-sm font-bold text-gray-900">
          {member.reviews_received}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {member.reviews_this_month} this month
        </p>
      </td>

      {/* Rewards */}
      <td className="py-3.5 px-4 text-right">
        <p className="text-sm font-bold text-gray-900">
          {member.rewards_redeemed}
        </p>
      </td>

      {/* Performance */}
      <td className="py-3.5 px-4 min-w-45">
        <div className="flex items-center justify-between mb-1.5">
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${colors.text} ${colors.bg} ${colors.border}`}
          >
            {colors.label}
          </span>
          <span className={`text-xs font-mono font-bold ${colors.text}`}>
            {member.performance_score}
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
            style={{ width: `${member.performance_score}%` }}
          />
        </div>
      </td>
    </tr>
  );
}
