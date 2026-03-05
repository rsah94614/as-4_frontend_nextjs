"use client";

import { Users, TrendingUp, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TeamSummaryResponse } from "@/types/dashboard-types";

export function scoreColor(score: number) {
  if (score >= 75) return { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", bar: "bg-emerald-500", label: "Excellent" };
  if (score >= 50) return { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", bar: "bg-amber-400", label: "Good" };
  if (score >= 25) return { text: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", bar: "bg-orange-400", label: "Fair" };
  return { text: "text-red-600", bg: "bg-red-50", border: "border-red-200", bar: "bg-red-500", label: "Needs Attention" };
}

interface Props {
  team: TeamSummaryResponse;
  onClick: () => void;
}

export default function AdminTeamReportCard({ team, onClick }: Props) {
  const colors = scoreColor(team.avg_performance_score);

  return (
    <Card
      onClick={onClick}
      className="border border-[#d9d9d9] shadow-none rounded-3xl cursor-pointer transition-all duration-200 hover:border-[#b0b0b0] hover:shadow-md hover:-translate-y-0.5 group"
    >
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#EED9FF]">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">
                Department
              </p>
              <h3 className="font-bold text-gray-900 text-sm leading-tight">
                {team.department_name}
              </h3>
            </div>
          </div>
          <Badge
            variant="outline"
            className="text-xs font-semibold text-blue-600 border-blue-200 bg-blue-50 rounded-full"
          >
            {team.total_members} members
          </Badge>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#FFE69C]/40 rounded-2xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Star className="w-3 h-3 text-gray-400" />
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                Total Points
              </p>
            </div>
            <p className="text-lg font-extrabold text-gray-900">
              {team.total_points.toLocaleString()}
            </p>
          </div>
          <div className={`rounded-2xl p-3 ${colors.bg}`}>
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3 h-3 text-gray-400" />
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                Avg Score
              </p>
            </div>
            <p className={`text-lg font-extrabold ${colors.text}`}>
              {team.avg_performance_score}%
            </p>
          </div>
        </div>

        {/* Performance bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Performance</span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${colors.text} ${colors.bg} ${colors.border}`}>
              {colors.label}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
              style={{ width: `${team.avg_performance_score}%` }}
            />
          </div>
        </div>

        {/* CTA */}
        <p className="text-xs text-gray-400 group-hover:text-blue-600 font-semibold text-right mt-3 transition-colors duration-200">
          View Report →
        </p>
      </CardContent>
    </Card>
  );
}