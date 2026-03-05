"use client";

import {
  Users,
  Star,
  MessageSquare,
  Gift,
  TrendingUp,
  Download,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AdminTeamMemberRow from "./AdminTeamMemberrow";
import { scoreColor } from "./AdminTeamReportcard";
import type { TeamReportResponse } from "@/types/dashboard-types";
import * as XLSX from "xlsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";

// ─── Props type (was missing — caused the crash) ──────────────────────────────
interface Props {
  report: TeamReportResponse;
}

function scoreLabel(score: number) {
  return scoreColor(score).label;
}

function exportTeamToXLSX(report: TeamReportResponse) {
  const wb = XLSX.utils.book_new();
  const summaryData = [
    ["Team Report", report.department_name],
    [""],
    ["Metric", "Value"],
    ["Total Members", report.total_members],
    ["Total Points Earned", report.total_points],
    ["Total Reviews Received", report.total_reviews],
    ["Total Rewards Redeemed", report.total_rewards],
    ["Avg Performance Score", `${report.avg_performance_score}%`],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet["!cols"] = [{ wch: 28 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

  const headers = [
    "Rank",
    "Name",
    "Designation",
    "Performance Score",
    "Rating",
    "Total Points Earned",
    "Available Points",
    "Points This Month",
    "Reviews Received",
    "Reviews This Month",
    "Rewards Redeemed",
  ];
  const rows = report.members.map((m, i) => [
    i + 1,
    m.username,
    m.designation,
    m.performance_score,
    scoreLabel(m.performance_score),
    m.total_earned_points,
    m.available_points,
    m.points_this_month,
    m.reviews_received,
    m.reviews_this_month,
    m.rewards_redeemed,
  ]);
  const membersSheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  membersSheet["!cols"] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 22 },
    { wch: 18 },
    { wch: 18 },
    { wch: 20 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, membersSheet, "Members");
  XLSX.writeFile(
    wb,
    `${report.department_name.replace(/\s+/g, "_")}_Report.xlsx`,
  );
}

const KPI_CONFIG = [
  {
    key: "total_members" as const,
    label: "Members",
    icon: Users,
    bg: "bg-[#DFDFFF]",
    iconColor: "text-indigo-600",
  },
  {
    key: "total_points" as const,
    label: "Total Points",
    icon: Star,
    bg: "bg-[#FFE69C]",
    iconColor: "text-amber-600",
  },
  {
    key: "total_reviews" as const,
    label: "Reviews",
    icon: MessageSquare,
    bg: "bg-[#D1FFD7]",
    iconColor: "text-emerald-600",
  },
  {
    key: "total_rewards" as const,
    label: "Rewards",
    icon: Gift,
    bg: "bg-[#EED9FF]",
    iconColor: "text-purple-600",
  },
  {
    key: "avg_performance_score" as const,
    label: "Avg Performance",
    icon: TrendingUp,
    bg: "bg-[#FFE69C]",
    iconColor: "text-amber-600",
  },
];

// ─── Chart: Points per member ────────────────────────────────────────────────
function MemberPointsChart({ report }: Props) {
  const data = [...report.members]
    .sort((a, b) => b.total_earned_points - a.total_earned_points)
    .slice(0, 12)
    .map((m) => ({
      name: m.username.split(" ")[0],
      "Total Earned": m.total_earned_points,
      "This Month": m.points_this_month,
    }));

  return (
    <Card className="rounded-2xl border border-[#e4e4e7] shadow-none">
      <CardContent className="px-5 pt-5 pb-4">
        <p className="text-sm font-bold text-gray-800 mb-4 tracking-tight">
          Points Earned per Member
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={data}
            barSize={18}
            barGap={3}
            margin={{ top: 4, right: 8, left: -14, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="#f4f4f5" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#a1a1aa" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#a1a1aa" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
              }
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e4e4e7",
                fontSize: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              formatter={(value: number | string | undefined) =>
                typeof value === "number"
                  ? value.toLocaleString()
                  : (value ?? "0")
              }
            />
            <Legend
              iconType="circle"
              iconSize={7}
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            />
            <Bar dataKey="Total Earned" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="This Month" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ─── Chart: Performance scores ───────────────────────────────────────────────
function MemberScoreChart({ report }: Props) {
  const COLOR_MAP: Record<string, string> = {
    Excellent: "#22c55e",
    Good: "#f59e0b",
    Fair: "#f97316",
    "Needs Attention": "#ef4444",
  };
  const data = [...report.members]
    .sort((a, b) => b.performance_score - a.performance_score)
    .map((m) => ({
      name: m.username.split(" ")[0],
      Score: m.performance_score,
      label: scoreColor(m.performance_score).label,
    }));

  return (
    <Card className="rounded-2xl border border-[#e4e4e7] shadow-none">
      <CardContent className="px-5 pt-5 pb-4">
        <p className="text-sm font-bold text-gray-800 mb-4 tracking-tight">
          Performance Scores
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={data}
            barSize={22}
            margin={{ top: 4, right: 8, left: -14, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="#f4f4f5" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#a1a1aa" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "#a1a1aa" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e4e4e7",
                fontSize: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              formatter={(value: number | string | undefined, _name, props) => {
                const score = value ?? 0;
                const label = props?.payload?.label ?? "";
                return [`${score} — ${label}`, "Score"];
              }}
            />
            <Bar dataKey="Score" radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={COLOR_MAP[entry.label] ?? "#6366f1"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ─── Main detail section ─────────────────────────────────────────────────────
export default function AdminTeamDetailSection({ report }: Props) {
  const perfColors = scoreColor(report.avg_performance_score);

  return (
    <div className="space-y-5">
      {/* Export row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 font-medium">
          <span className="font-bold text-gray-800">
            {report.total_members}
          </span>{" "}
          member{report.total_members !== 1 ? "s" : ""}
          <span className="mx-1.5 text-gray-300">·</span>ranked by performance
          score
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => exportTeamToXLSX(report)}
          className="gap-2 font-semibold rounded-lg border-gray-300 hover:border-gray-500 hover:bg-gray-50 h-9"
        >
          <Download className="w-3.5 h-3.5" />
          Export to Excel
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {KPI_CONFIG.map(({ key, label, icon: Icon, bg, iconColor }) => {
          const raw = report[key];
          const isPerf = key === "avg_performance_score";
          const display = isPerf
            ? `${raw}%`
            : typeof raw === "number"
              ? raw.toLocaleString()
              : raw;

          return (
            <Card
              key={label}
              className="rounded-2xl border border-[#e4e4e7] shadow-none"
            >
              <CardContent className="px-4 py-4 flex flex-col gap-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      {label}
                    </p>
                    <h2
                      className={`text-2xl font-bold mt-1 tracking-tight ${isPerf ? perfColors.text : "text-gray-900"}`}
                    >
                      {display}
                    </h2>
                  </div>
                  <div className={`p-2.5 rounded-xl shrink-0 ${bg}`}>
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MemberPointsChart report={report} />
        <MemberScoreChart report={report} />
      </div>

      {/* Members table */}
      <div className="bg-white border border-[#e4e4e7] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f4f4f5] bg-gray-50/60">
          <h3 className="font-bold text-gray-900 text-sm tracking-tight">
            Team Members
          </h3>
          <span className="text-xs text-gray-400 font-medium">
            Sorted by performance score
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f4f4f5]">
                {[
                  "Rank",
                  "Employee",
                  "Points Earned",
                  "Reviews",
                  "Rewards",
                  "Performance",
                ].map((h) => (
                  <th
                    key={h}
                    className={`py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap
                      ${h === "Rank" || h === "Employee" || h === "Performance" ? "text-left" : "text-right"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.members.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-sm text-gray-400"
                  >
                    No members in this team.
                  </td>
                </tr>
              ) : (
                report.members.map((member, i) => (
                  <AdminTeamMemberRow
                    key={member.employee_id}
                    member={member}
                    rank={i + 1}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
export function AdminTeamDetailSkeleton() {
  return (
    <div className="space-y-5">
      {/* Export row */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-52 rounded-md" />
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card
            key={i}
            className="rounded-2xl border border-[#e4e4e7] shadow-none"
          >
            <CardContent className="px-4 py-4 flex flex-col gap-3">
              <div className="flex justify-between items-start gap-2">
                <div className="space-y-2 flex-1 min-w-0">
                  <Skeleton className="h-3 w-16 rounded" />
                  <Skeleton className="h-8 w-14 rounded-md" />
                </div>
                <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card
            key={i}
            className="rounded-2xl border border-[#e4e4e7] shadow-none"
          >
            <CardContent className="px-5 pt-5 pb-4">
              <Skeleton className="h-4 w-44 rounded-md mb-5" />
              {/* Simulated bar chart */}
              <div className="flex items-end gap-1.5 h-[220px]">
                {[55, 80, 40, 95, 65, 50, 85, 35, 70, 60, 75, 45].map(
                  (h, j) => (
                    <div
                      key={j}
                      className="flex-1 flex flex-col justify-end gap-1"
                    >
                      <Skeleton
                        className="w-full rounded-t-sm"
                        style={{ height: `${h * 0.78}%` }}
                      />
                      <Skeleton className="h-2 w-full rounded-sm" />
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white border border-[#e4e4e7] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f4f4f5] bg-gray-50/60">
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="h-3 w-44 rounded-md" />
        </div>
        <div className="divide-y divide-[#f4f4f5]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3.5">
              <Skeleton className="h-4 w-6 rounded" />
              <div className="flex-1 space-y-1.5 min-w-0">
                <Skeleton className="h-4 w-36 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-4 w-10 rounded" />
              <Skeleton className="h-4 w-10 rounded" />
              <div className="w-36 space-y-1.5">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
