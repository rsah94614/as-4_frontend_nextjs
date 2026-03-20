"use client";

import {
    Users, Star, MessageSquare, Gift, Download, TrendingUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import AdminTeamMemberRow from "./AdminTeamMemberRow";
import type { TeamReportResponse } from "@/types/dashboard-types";
import ExcelJS from "exceljs";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell, Legend,
} from "recharts";

interface Props { report: TeamReportResponse }

// ─── Export ──────────────────────────────────────────────────────────────────

async function exportTeamToXLSX(report: TeamReportResponse) {
    const wb = new ExcelJS.Workbook();

    const summarySheet = wb.addWorksheet("Summary");
    summarySheet.columns = [{ width: 28 }, { width: 20 }];
    [
        ["Team Report", report.department_name], [""],
        ["Metric", "Value"],
        ["Total Members", report.total_members],
        ["Total Points Earned", report.total_points],
        ["Total Reviews Received", report.total_reviews],
        ["Total Rewards Redeemed", report.total_rewards],
        ["Avg Performance Score", `${report.avg_performance_score}%`],
    ].forEach(row => summarySheet.addRow(row));

    const membersSheet = wb.addWorksheet("Members");
    membersSheet.columns = Array.from({ length: 11 }, () => ({ width: 18 }));
    membersSheet.addRow(["Rank", "Name", "Designation", "Performance Score", "Rating",
        "Total Points Earned", "Available Points", "Points This Month",
        "Reviews Received", "Reviews This Month", "Rewards Redeemed"]);
    report.members.forEach((m, i) => membersSheet.addRow([
        i + 1, m.username, m.designation, m.performance_score,
        m.performance_score >= 75 ? "Excellent" : m.performance_score >= 50 ? "Good" : m.performance_score >= 25 ? "Fair" : "Needs Attention",
        m.total_earned_points, m.available_points, m.points_this_month,
        m.reviews_received, m.reviews_this_month, m.rewards_redeemed,
    ]));

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.department_name.replace(/\s+/g, "_")}_Report.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
}

// ─── KPI cards ───────────────────────────────────────────────────────────────

const KPI_CONFIG = [
    { key: "total_members" as const,  label: "Members",          icon: Users,        gradient: "from-[#004C8F] to-[#1D6EC5]" },
    { key: "total_points" as const,   label: "Total Points",     icon: Star,         gradient: "from-[#004C8F] to-[#1D6EC5]" },
    { key: "total_reviews" as const,  label: "Reviews Received", icon: MessageSquare, gradient: "from-[#004C8F] to-[#1D6EC5]" },
    { key: "total_rewards" as const,  label: "Rewards Redeemed", icon: Gift,         gradient: "from-[#004C8F] to-[#1D6EC5]" },
];


function KpiCard({ label, value, icon: Icon, gradient }: {
    label: string; value: string | number; icon: typeof Users; gradient: string;
}) {
    return (
        <div className={`relative rounded-2xl p-5 text-white overflow-hidden bg-linear-to-br ${gradient}`}>
            <div className="absolute -right-5 -top-5 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute -right-2 -bottom-6 w-16 h-16 rounded-full bg-white/10" />
            <div className="relative">
                <div className="bg-white/20 p-2 rounded-xl w-fit mb-4">
                    <Icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-3xl font-black tabular-nums leading-none mb-1">{value}</h3>
                <p className="text-white/70 text-xs font-semibold uppercase tracking-wide">{label}</p>
            </div>
        </div>
    );
}

// ─── Charts ──────────────────────────────────────────────────────────────────

const TOOLTIP_STYLE = {
    borderRadius: 10, border: "1px solid #e4e4e7",
    fontSize: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
};

function MemberPointsChart({ report }: Props) {
    const data = [...report.members]
        .sort((a, b) => b.total_earned_points - a.total_earned_points)
        .slice(0, 12)
        .map((m) => ({
            name: m.username.split(/[._\s]/)[0],
            "Total Earned": m.total_earned_points,
            "This Month": m.points_this_month,
        }));

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm font-bold text-gray-800 mb-4">Points Earned per Member</p>
            <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data} barSize={14} barGap={3} margin={{ top: 4, right: 8, left: -14, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="#f4f4f5" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false}
                        tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                    <Tooltip contentStyle={TOOLTIP_STYLE}
                        formatter={(v) => typeof v === "number" ? v.toLocaleString() : String(v ?? 0)} />
                    <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                    <Bar dataKey="Total Earned" fill="#004C8F" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="This Month" fill="#93C5FD" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

function MemberScoreChart({ report }: Props) {
    const BLUE_SHADES = ["#004C8F", "#1D6EC5", "#5B9BD5", "#93C5FD", "#BFDBFE"];
    const data = [...report.members]
        .sort((a, b) => b.performance_score - a.performance_score)
        .map((m) => ({
            name: m.username.split(/[._\s]/)[0],
            Score: m.performance_score,
        }));

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm font-bold text-gray-800 mb-4">Performance Scores</p>
            <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data} barSize={18} margin={{ top: 4, right: 8, left: -14, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="#f4f4f5" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE}
                        formatter={(v, _n, p) => {
                            const s = typeof v === "number" ? v : Number(v) || 0;
                            const lbl = (p as { payload?: { label?: string } })?.payload?.label ?? "";
                            return [`${s} — ${lbl}`, "Score"];
                        }} />
                    <Bar dataKey="Score" radius={[4, 4, 0, 0]}>
                        {data.map((_, i) => <Cell key={i} fill={BLUE_SHADES[i % BLUE_SHADES.length]} />)}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminTeamDetailSection({ report }: Props) {

    return (
        <div className="space-y-5">
            {/* Hero banner */}
            <div className="relative rounded-2xl overflow-hidden bg-linear-to-br from-[#003A70] via-[#004C8F] to-[#1D6EC5] px-6 py-6 text-white">
                <div className="absolute top-0 right-0 w-64 h-full opacity-10 pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-72 h-72 rounded-full bg-white" />
                    <div className="absolute bottom-[-30%] right-[20%] w-40 h-40 rounded-full bg-white" />
                </div>
                <div className="relative flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold mb-1.5">
                            Department Report
                        </p>
                        <h2 className="text-2xl font-black text-white leading-tight">
                            {report.department_name}
                        </h2>
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                            <span className="bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                {report.total_members} member{report.total_members !== 1 ? "s" : ""}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-3 shrink-0">
                        <Button
                            size="sm"
                            onClick={() => exportTeamToXLSX(report)}
                            className="gap-1.5 bg-white/15 border-0 text-white hover:bg-white/25 font-semibold h-8 text-xs rounded-xl"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Export
                        </Button>
                        <div className="text-right hidden sm:block">
                            <p className="text-white/50 text-[10px] uppercase tracking-wider">Avg Score</p>
                            <p className="text-5xl font-black leading-none tabular-nums">
                                {report.avg_performance_score}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI cards — 4 + performance */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {KPI_CONFIG.map(({ key, label, icon, gradient: g }) => (
                    <KpiCard
                        key={key}
                        label={label}
                        value={report[key].toLocaleString()}
                        icon={icon}
                        gradient={g}
                    />
                ))}
                <KpiCard
                    label="Avg Performance"
                    value={`${report.avg_performance_score}%`}
                    icon={TrendingUp}
                    gradient="from-[#004C8F] to-[#1D6EC5]"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MemberPointsChart report={report} />
                <MemberScoreChart report={report} />
            </div>

            {/* Members table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm">Team Members</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Ranked by performance score</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                        {report.members.length} members
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-50">
                                {["#", "Employee", "Points", "Reviews", "Rewards", "Performance"].map((h) => (
                                    <th key={h} className={`py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap
                                        ${h === "#" || h === "Employee" || h === "Performance" ? "text-left" : "text-right"}`}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {report.members.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center text-sm text-gray-400">
                                        No members in this team.
                                    </td>
                                </tr>
                            ) : (
                                report.members.map((member, i) => (
                                    <AdminTeamMemberRow key={member.employee_id} member={member} rank={i + 1} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function AdminTeamDetailSkeleton() {
    return (
        <div className="space-y-5">
            {/* Hero */}
            <Skeleton className="h-[130px] rounded-2xl" />

            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-[110px] rounded-2xl" />
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[0, 1].map((i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
                        <Skeleton className="h-4 w-44 rounded mb-5" />
                        <div className="flex items-end gap-1.5 h-[220px]">
                            {[55, 80, 40, 95, 65, 50, 85, 35, 70, 60, 75, 45].map((h, j) => (
                                <div key={j} className="flex-1 flex flex-col justify-end gap-1">
                                    <Skeleton className="w-full rounded-t" style={{ height: `${h * 0.78}%` }} />
                                    <Skeleton className="h-2 w-full rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="space-y-1.5">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-36" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="divide-y divide-gray-50">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 px-4 py-3.5">
                            <Skeleton className="h-6 w-6 rounded-lg shrink-0" />
                            <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                            <div className="flex-1 space-y-1.5 min-w-0">
                                <Skeleton className="h-3.5 w-32" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                            <Skeleton className="h-3.5 w-16" />
                            <Skeleton className="h-3.5 w-10" />
                            <Skeleton className="h-3.5 w-10" />
                            <div className="w-36 space-y-1.5">
                                <div className="flex justify-between">
                                    <Skeleton className="h-5 w-20 rounded-full" />
                                    <Skeleton className="h-3.5 w-6" />
                                </div>
                                <Skeleton className="h-1.5 w-full rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
