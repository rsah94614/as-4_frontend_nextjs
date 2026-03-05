"use client";

import { useState, useEffect, useCallback } from "react";
import { ShieldCheck, ChevronRight, Download, Loader2, AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import * as XLSX from "xlsx";
import AdminTeamsSection from "./AdminTeamsSection";
import AdminTeamDetailSection, { AdminTeamDetailSkeleton } from "./AdminTeamDetailsection";
import { fetchTeamReport } from "@/services/analytics-service";
import type { TeamSummaryResponse, TeamReportResponse } from "@/types/dashboard-types";

type SortOption = "score" | "points" | "members" | "name";

const ANALYTICS_API =
    process.env.NEXT_PUBLIC_ANALYTICS_API_URL || "http://localhost:8008";

async function fetchTeamsWithDetail(): Promise<{
    data: TeamSummaryResponse[] | null;
    error: string | null;
}> {
    const url = `${ANALYTICS_API}/v1/dashboard/teams`;
    try {
        const { fetchWithAuth } = await import("@/services/auth-service");
        const res = await fetchWithAuth(url);
        if (res.ok) {
            const data = await res.json();
            return { data: Array.isArray(data) ? data : data?.teams ?? [], error: null };
        }
        let detail = "";
        try {
            const body = await res.json();
            detail = body?.detail ?? body?.message ?? "";
        } catch { /* */ }
        return { data: null, error: detail || `HTTP ${res.status}` };
    } catch (e: any) {
        return { data: null, error: e?.message ?? "Unexpected error" };
    }
}

// ─── Teams loading skeleton ───────────────────────────────────────────────────
function TeamsLoadingSkeleton() {
    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
                <Skeleton className="h-9 w-56 rounded-lg" />
                <Skeleton className="h-9 w-64 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-52 rounded-2xl" />
                ))}
            </div>
        </div>
    );
}

// ─── Friendly error state ─────────────────────────────────────────────────────
function TeamsErrorState({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
            <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <div className="space-y-1.5">
                <p className="text-base font-bold text-gray-900">Something went wrong</p>
                <p className="text-sm text-gray-500 max-w-xs">
                    We couldn't load the team reports. Please check your connection and try again.
                </p>
            </div>
            <Button
                size="sm"
                onClick={onRetry}
                className="gap-2 font-bold rounded-lg bg-gray-900 text-white hover:bg-gray-700 px-5"
            >
                <RefreshCw className="w-3.5 h-3.5" />
                Try again
            </Button>
        </div>
    );
}

export default function AdminDashboard() {
    const [teams, setTeams]                   = useState<TeamSummaryResponse[]>([]);
    const [selectedTeam, setSelectedTeam]     = useState<TeamReportResponse | null>(null);
    const [loadingTeams, setLoadingTeams]     = useState(true);
    const [loadingReport, setLoadingReport]   = useState(false);
    const [teamsError, setTeamsError]         = useState<string | null>(null);
    const [reportError, setReportError]       = useState<string | null>(null);
    const [searchQuery, setSearchQuery]       = useState("");
    const [sortBy, setSortBy]                 = useState<SortOption>("score");
    const [downloadingAll, setDownloadingAll] = useState(false);

    const loadTeams = useCallback(async () => {
        setLoadingTeams(true);
        setTeamsError(null);
        const { data, error: err } = await fetchTeamsWithDetail();
        if (data) setTeams(data);
        else setTeamsError(err);
        setLoadingTeams(false);
    }, []);

    useEffect(() => { loadTeams(); }, [loadTeams]);

    const downloadAllReports = useCallback(async () => {
        if (!teams.length) return;
        setDownloadingAll(true);
        try {
            const wb = XLSX.utils.book_new();
            const summaryHeaders = ["Department", "Members", "Total Points", "Avg Performance Score", "Reviews Received", "Rewards Redeemed"];
            const summaryRows = teams.map(t => [
                t.department_name, t.total_members, t.total_points,
                `${t.avg_performance_score}%`,
                (t as any).total_reviews ?? "—",
                (t as any).total_rewards ?? "—",
            ]);
            const summarySheet = XLSX.utils.aoa_to_sheet([summaryHeaders, ...summaryRows]);
            summarySheet["!cols"] = [{ wch: 24 }, { wch: 10 }, { wch: 14 }, { wch: 22 }, { wch: 18 }, { wch: 18 }];
            XLSX.utils.book_append_sheet(wb, summarySheet, "All Teams");

            const reports = await Promise.allSettled(teams.map(t => fetchTeamReport(t.department_id)));
            const memberHeaders = ["Rank", "Name", "Designation", "Performance Score", "Rating", "Total Points Earned", "Available Points", "Points This Month", "Reviews Received", "Reviews This Month", "Rewards Redeemed"];

            reports.forEach((result, i) => {
                const team = teams[i];
                const sheetName = team.department_name.replace(/[\\/:*?[\]]/g, "").slice(0, 31);
                if (result.status === "fulfilled" && result.value) {
                    const report = result.value;
                    const rows = report.members.map((m, idx) => [
                        idx + 1, m.username, m.designation, m.performance_score,
                        m.performance_score >= 75 ? "Excellent" : m.performance_score >= 50 ? "Good" : m.performance_score >= 25 ? "Fair" : "Needs Attention",
                        m.total_earned_points, m.available_points, m.points_this_month,
                        m.reviews_received, m.reviews_this_month, m.rewards_redeemed,
                    ]);
                    const sheet = XLSX.utils.aoa_to_sheet([memberHeaders, ...rows]);
                    sheet["!cols"] = [{ wch: 6 }, { wch: 22 }, { wch: 22 }, { wch: 18 }, { wch: 18 }, { wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }];
                    XLSX.utils.book_append_sheet(wb, sheet, sheetName);
                } else {
                    const sheet = XLSX.utils.aoa_to_sheet([["Failed to load data for this team"]]);
                    XLSX.utils.book_append_sheet(wb, sheet, sheetName);
                }
            });
            XLSX.writeFile(wb, `All_Team_Reports_${new Date().toISOString().slice(0, 10)}.xlsx`);
        } catch (e: any) {
            setTeamsError("Download failed. Please try again.");
        } finally {
            setDownloadingAll(false);
        }
    }, [teams]);

    const openTeam = useCallback(async (departmentId: string) => {
        setLoadingReport(true);
        setSelectedTeam(null);
        setReportError(null);
        const result = await fetchTeamReport(departmentId);
        if (result) setSelectedTeam(result);
        else setReportError("Could not load this team's report. Please try again.");
        setLoadingReport(false);
    }, []);

    const handleBack = () => { setSelectedTeam(null); setReportError(null); };

    const showBack = !!(selectedTeam || reportError || loadingReport);

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-orange-100">
                        <ShieldCheck className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                                {selectedTeam ? selectedTeam.department_name : "Admin Dashboard"}
                            </h1>
                            <Badge variant="outline" className="border-orange-300 text-orange-600 bg-orange-50 font-bold text-[11px] tracking-widest uppercase px-2.5">
                                Admin
                            </Badge>
                        </div>
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5 font-medium">
                            <button
                                onClick={handleBack}
                                className={`transition-colors ${selectedTeam ? "hover:text-gray-700 cursor-pointer" : "cursor-default"}`}
                            >
                                Team Reports
                            </button>
                            {selectedTeam && (
                                <>
                                    <ChevronRight className="w-3 h-3" />
                                    <span className="text-gray-700 font-semibold">{selectedTeam.department_name}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* ── Bold back button ── */}
                    {showBack && (
                        <Button
                            size="sm"
                            onClick={handleBack}
                            className="gap-1.5 font-bold rounded-lg bg-gray-900 text-white hover:bg-gray-700 active:scale-95 px-4 h-9 shadow-sm transition-all"
                        >
                            <ArrowLeft className="w-4 h-4 shrink-0" />
                            Back to Teams
                        </Button>
                    )}

                    {/* Download All */}
                    {!selectedTeam && !loadingReport && !loadingTeams && !teamsError && teams.length > 0 && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={downloadAllReports}
                            disabled={downloadingAll}
                            className="gap-2 font-semibold rounded-lg border-gray-300 hover:border-gray-500 hover:bg-gray-50 h-9"
                        >
                            {downloadingAll
                                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Downloading…</>
                                : <><Download className="w-3.5 h-3.5" /> Download All Reports</>
                            }
                        </Button>
                    )}
                </div>
            </div>

            {/* ── Divider ── */}
            <div className="h-px bg-gray-100" />

            {/* ── Report error ── */}
            {reportError && !loadingReport && (
                <div className="flex flex-col items-center justify-center py-16 gap-5 text-center">
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                        <AlertTriangle className="w-7 h-7 text-red-500" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-base font-bold text-gray-900">Something went wrong</p>
                        <p className="text-sm text-gray-500 max-w-xs">
                            We couldn't load this team's report. Go back and try another team.
                        </p>
                    </div>
                    <Button
                        size="sm"
                        onClick={handleBack}
                        className="gap-2 font-bold rounded-lg bg-gray-900 text-white hover:bg-gray-700 px-5"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to Teams
                    </Button>
                </div>
            )}

            {/* ── Teams list ── */}
            {!selectedTeam && !loadingReport && !reportError && (
                <>
                    {loadingTeams && <TeamsLoadingSkeleton />}
                    {!loadingTeams && teamsError && <TeamsErrorState onRetry={loadTeams} />}
                    {!loadingTeams && !teamsError && (
                        <AdminTeamsSection
                            teams={teams}
                            loading={false}
                            searchQuery={searchQuery}
                            sortBy={sortBy}
                            onSearchChange={setSearchQuery}
                            onSortChange={setSortBy}
                            onTeamClick={openTeam}
                        />
                    )}
                </>
            )}

            {loadingReport && <AdminTeamDetailSkeleton />}

            {selectedTeam && !loadingReport && (
                <AdminTeamDetailSection report={selectedTeam} />
            )}
        </div>
    );
}