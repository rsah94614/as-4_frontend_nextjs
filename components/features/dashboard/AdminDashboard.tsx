"use client";

import { useState, useEffect, useCallback } from "react";
import { ShieldCheck, ChevronRight, Download, Loader2, AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import * as XLSX from "xlsx";
import AdminTeamsSection from "./Adminteamssection";
import AdminTeamDetailSection, { AdminTeamDetailSkeleton } from "./Adminteamdetailsection";
import { fetchTeamReport, fetchTeamsSummary } from "@/services/analytics-service";
import type { TeamSummaryResponse, TeamReportResponse } from "@/types/dashboard-types";

import AdminParticipationSection from "./AdminParticipationSection";
import AdminRecognitionTrendSection from "./AdminRecognitionTrendSection";
import AdminRecognitionSection from "./AdminRecognitionSection";
import AdminTeamReportsSection from "./AdminTeamReportsSection";

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
                    We couldn&apos;t load the team reports. Please check your connection and try again.
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
    const [teams, setTeams] = useState<TeamSummaryResponse[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<TeamReportResponse | null>(null);
    const [loadingTeams, setLoadingTeams] = useState(true);
    const [loadingReport, setLoadingReport] = useState(false);
    const [teamsError, setTeamsError] = useState<string | null>(null);
    const [reportError, setReportError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("score");
    const [downloadingAll, setDownloadingAll] = useState(false);

    const loadTeams = useCallback(async () => {
        setLoadingTeams(true);
        setTeamsError(null);
        try {
            const data = await fetchTeamsSummary();
            if (data) setTeams(data);
            else setTeamsError("No data returned");
        } catch (e: unknown) {
            setTeamsError(e instanceof Error ? e.message : "Unexpected error");
        }
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
                (t as TeamSummaryResponse & { total_reviews?: number }).total_reviews ?? "—",
                (t as TeamSummaryResponse & { total_rewards?: number }).total_rewards ?? "—",
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
        } catch {
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

                <div className="flex items-center gap-2">
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

            <div className="h-px bg-gray-100" />

            {reportError && !loadingReport && (
                <div className="flex flex-col items-center justify-center py-16 gap-5 text-center">
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                        <AlertTriangle className="w-7 h-7 text-red-500" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-base font-bold text-gray-900">Something went wrong</p>
                        <p className="text-sm text-gray-500 max-w-xs">
                            We couldn&apos;t load this team&apos;s report. Go back and try another team.
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
