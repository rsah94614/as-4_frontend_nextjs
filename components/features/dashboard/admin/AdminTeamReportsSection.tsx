'use client';

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import AdminTeamsSection from "./AdminTeamsSection";
import { fetchTeamReport } from "@/services/analytics-service";
import type { TeamSummaryResponse } from "@/types/dashboard-types";

type SortOption = "score" | "points" | "members" | "name";

const ANALYTICS_API =
    process.env.NEXT_PUBLIC_ANALYTICS_API_URL || "http://localhost:8008";

async function fetchTeamsWithDetail(): Promise<{
    data: TeamSummaryResponse[] | null;
    error: string | null;
}> {
    const url = `${ANALYTICS_API}/v1/analytics/dashboard/teams`;
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
    } catch (e: unknown) {
        return { data: null, error: e instanceof Error ? e.message : "Unexpected error" };
    }
}

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
                className="gap-2 font-bold rounded-lg bg-[#004C8F] text-white hover:bg-[#003A70] px-5"
            >
                <RefreshCw className="w-3.5 h-3.5" />
                Try again
            </Button>
        </div>
    );
}

export default function AdminTeamReportsSection({ initialTeams }: { initialTeams?: TeamSummaryResponse[] | null }) {
    const [teams, setTeams] = useState<TeamSummaryResponse[]>(initialTeams ?? []);
    const [loadingTeams, setLoadingTeams] = useState(initialTeams === undefined);
    const [teamsError, setTeamsError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("score");
    const [downloadingAll, setDownloadingAll] = useState(false);

    const loadTeams = useCallback(async () => {
        setLoadingTeams(true);
        setTeamsError(null);
        const { data, error: err } = await fetchTeamsWithDetail();
        if (data) setTeams(data);
        else setTeamsError(err);
        setLoadingTeams(false);
    }, []);

    useEffect(() => {
        if (initialTeams) {
            setTeams(initialTeams);
            setLoadingTeams(false);
            return;
        }
        loadTeams();
    }, [loadTeams, initialTeams]);

    const downloadAllReports = useCallback(async () => {
        if (!teams.length) return;
        setDownloadingAll(true);
        try {
            // 1. DYNAMIC IMPORT: Browser only downloads ExcelJS when button is clicked
            const ExcelJS = (await import('exceljs')).default || await import('exceljs');
            const workbook = new ExcelJS.Workbook();

            // 2. Setup Summary Sheet
            const summarySheet = workbook.addWorksheet("All Teams");
            summarySheet.columns = [
                { header: "Department", width: 24 },
                { header: "Members", width: 10 },
                { header: "Total Points", width: 14 },
                { header: "Avg Performance Score", width: 22 },
                { header: "Reviews Received", width: 18 },
                { header: "Rewards Redeemed", width: 18 }
            ];
            
            // Style header row
            summarySheet.getRow(1).font = { bold: true };

            const summaryRows = teams.map(t => [
                t.department_name, 
                t.total_members, 
                t.total_points,
                `${t.avg_performance_score}%`,
                (t as TeamSummaryResponse & { total_reviews?: number }).total_reviews ?? "—",
                (t as TeamSummaryResponse & { total_rewards?: number }).total_rewards ?? "—",
            ]);
            summarySheet.addRows(summaryRows);

            // 3. Fetch detailed reports and create individual sheets
            const reports = await Promise.allSettled(teams.map(t => fetchTeamReport(t.department_id)));
            
            reports.forEach((result, i) => {
                const team = teams[i];
                const sheetName = team.department_name.replace(/[\\/:*?[\]]/g, "").slice(0, 31);
                const sheet = workbook.addWorksheet(sheetName);

                if (result.status === "fulfilled" && result.value) {
                    const report = result.value;
                    
                    sheet.columns = [
                        { header: "Rank", width: 6 },
                        { header: "Name", width: 22 },
                        { header: "Designation", width: 22 },
                        { header: "Performance Score", width: 18 },
                        { header: "Rating", width: 18 },
                        { header: "Total Points Earned", width: 20 },
                        { header: "Available Points", width: 18 },
                        { header: "Points This Month", width: 18 },
                        { header: "Reviews Received", width: 18 },
                        { header: "Reviews This Month", width: 18 },
                        { header: "Rewards Redeemed", width: 18 }
                    ];
                    sheet.getRow(1).font = { bold: true };

                    const rows = report.members.map((m, idx) => [
                        idx + 1, m.username, m.designation, m.performance_score,
                        m.performance_score >= 75 ? "Excellent" : m.performance_score >= 50 ? "Good" : m.performance_score >= 25 ? "Fair" : "Needs Attention",
                        m.total_earned_points, m.available_points, m.points_this_month,
                        m.reviews_received, m.reviews_this_month, m.rewards_redeemed,
                    ]);
                    sheet.addRows(rows);
                } else {
                    sheet.addRow(["Failed to load data for this team"]);
                }
            });

            // 4. Generate file and trigger native browser download
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `All_Team_Reports_${new Date().toISOString().slice(0, 10)}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error(error);
            setTeamsError("Download failed. Please try again.");
        } finally {
            setDownloadingAll(false);
        }
    }, [teams]);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <CardTitle className="text-base">Team Reports</CardTitle>
                    {!loadingTeams && !teamsError && teams.length > 0 && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={downloadAllReports}
                            disabled={downloadingAll}
                            className="gap-2 font-semibold rounded-lg border-[#004C8F] text-[#004C8F] hover:bg-[#EEF4FB] h-9"
                        >
                            {downloadingAll
                                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Downloading…</>
                                : <><Download className="w-3.5 h-3.5" /> Download All</>
                            }
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
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
                    />
                )}
            </CardContent>
        </Card>
    );
}