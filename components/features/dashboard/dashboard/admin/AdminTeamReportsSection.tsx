import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import ExcelJS from "exceljs";
import AdminTeamsSection from "./AdminTeamsSection";
import { fetchTeamReport, fetchTeamsSummary } from "@/services/analytics-service";
import { extractErrorMessage } from "@/lib/error-utils";
import type { TeamSummaryResponse } from "@/types/dashboard-types";

type SortOption = "score" | "points" | "members" | "name";

async function fetchTeamsWithDetail(): Promise<{
    data: TeamSummaryResponse[] | null;
    error: string | null;
}> {
    try {
        const data = await fetchTeamsSummary();
        return { data, error: null };
    } catch (e: unknown) {
        return { data: null, error: extractErrorMessage(e, "Unexpected error") };
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




export default function AdminTeamReportsSection() {
    const [teams, setTeams] = useState<TeamSummaryResponse[]>([]);
    const [loadingTeams, setLoadingTeams] = useState(true);
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

    useEffect(() => { loadTeams(); }, [loadTeams]);

    const downloadAllReports = useCallback(async () => {
        if (!teams.length) return;
        setDownloadingAll(true);
        try {
            const wb = new ExcelJS.Workbook();

            const summarySheet = wb.addWorksheet("All Teams");
            summarySheet.columns = [{ width: 24 }, { width: 10 }, { width: 14 }, { width: 22 }, { width: 18 }, { width: 18 }];
            summarySheet.addRow(["Department", "Members", "Total Points", "Avg Performance Score", "Reviews Received", "Rewards Redeemed"]);
            teams.forEach(t => summarySheet.addRow([
                t.department_name, t.total_members, t.total_points,
                `${t.avg_performance_score}%`,
                (t as TeamSummaryResponse & { total_reviews?: number }).total_reviews ?? "—",
                (t as TeamSummaryResponse & { total_rewards?: number }).total_rewards ?? "—",
            ]));

            const reports = await Promise.allSettled(teams.map(t => fetchTeamReport(t.department_id)));
            const memberHeaders = ["Rank", "Name", "Designation", "Performance Score", "Rating", "Total Points Earned", "Available Points", "Points This Month", "Reviews Received", "Reviews This Month", "Rewards Redeemed"];
            reports.forEach((result, i) => {
                const team = teams[i];
                const sheetName = team.department_name.replace(/[\\/:*?[\]]/g, "").slice(0, 31);
                if (result.status === "fulfilled" && result.value) {
                    const report = result.value;
                    const sheet = wb.addWorksheet(sheetName);
                    sheet.columns = [6, 22, 22, 18, 18, 20, 18, 18, 18, 18, 18].map(w => ({ width: w }));
                    sheet.addRow(memberHeaders);
                    report.members.forEach((m, idx) => sheet.addRow([
                        idx + 1, m.username, m.designation, m.performance_score,
                        m.performance_score >= 75 ? "Excellent" : m.performance_score >= 50 ? "Good" : m.performance_score >= 25 ? "Fair" : "Needs Attention",
                        m.total_earned_points, m.available_points, m.points_this_month,
                        m.reviews_received, m.reviews_this_month, m.rewards_redeemed,
                    ]));
                } else {
                    const sheet = wb.addWorksheet(sheetName);
                    sheet.addRow(["Failed to load data for this team"]);
                }
            });

            const buffer = await wb.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `All_Team_Reports_${new Date().toISOString().slice(0, 10)}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
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
