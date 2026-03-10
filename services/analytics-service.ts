// services/analytics-service.ts
// All requests routed through Next.js proxy — no direct microservice URL in browser.

import { createAuthenticatedClient } from "@/lib/api-utils";
import type {
    PlatformStatsResponse,
    RecentReviewResponse,
    LeaderboardEntryResponse,
    TeamSummaryResponse,
    TeamReportResponse,
    ParticipationResponse,
    RecognitionTrendResponse,
    PaginatedUserRecognition,
    PaginatedTeamRecognition,
} from "@/types/dashboard-types";

const analyticsClient = createAuthenticatedClient("/api/proxy/analytics");

// ── Individual fetchers (used by pages that need only one panel) ──────────────

export async function fetchDashboardPlatformStats(): Promise<PlatformStatsResponse | null> {
    try {
        const res = await analyticsClient.get<PlatformStatsResponse>("/dashboard/platform-stats");
        return res.data;
    } catch { return null; }
}

export async function fetchDashboardRecentReviews(): Promise<RecentReviewResponse[] | null> {
    try {
        const res = await analyticsClient.get<RecentReviewResponse[]>("/dashboard/recent-reviews");
        return res.data;
    } catch { return null; }
}

export async function fetchDashboardLeaderboard(): Promise<LeaderboardEntryResponse[] | null> {
    try {
        const res = await analyticsClient.get<LeaderboardEntryResponse[]>("/dashboard/leaderboard");
        return res.data;
    } catch { return null; }
}

export async function fetchTeamsSummary(): Promise<TeamSummaryResponse[] | null> {
    try {
        // Current — correct path
        const res = await analyticsClient.get<TeamSummaryResponse[]>("/dashboard/teams");
        return res.data;
    } catch { return null; }
}

export async function fetchRecognitionUsers(
    range: "week" | "month" | "quarter" | "year",
    page = 1,
    limit = 100,
): Promise<PaginatedUserRecognition | null> {
    return get<PaginatedUserRecognition>(`${PROXY}/analytics/v1/dashboard/recognition/users?range=${range}&page=${page}&limit=${limit}`);
}

export async function fetchRecognitionTeams(
    range: "week" | "month" | "quarter" | "year",
    page = 1,
    limit = 50,
): Promise<PaginatedTeamRecognition | null> {
    return get<PaginatedTeamRecognition>(`${PROXY}/analytics/v1/dashboard/recognition/teams?range=${range}&page=${page}&limit=${limit}`);
}

export async function fetchRecognitionTrend(range: "3m" | "6m" | "1y"): Promise<RecognitionTrendResponse | null> {
    return get<RecognitionTrendResponse>(`${PROXY}/analytics/v1/dashboard/recognition-trend?range=${range}`);
}

export async function fetchParticipation(): Promise<ParticipationResponse | null> {
    return get<ParticipationResponse>(`${PROXY}/analytics/v1/dashboard/participation`);
}

export async function fetchTeamReport(departmentId: string): Promise<TeamReportResponse | null> {
    try {
        const res = await analyticsClient.get<TeamReportResponse>(`/dashboard/teams/${departmentId}`);
        return res.data;
    } catch { return null; }
}

// ── Aggregate fetch — for the main dashboard page ────────────────────────────
// Hits /api/proxy/dashboard which fans out all 4 endpoints in parallel server-side.
// Reduces 4 browser round trips to 1.

export interface DashboardData {
    platformStats:  PlatformStatsResponse | null;
    recentReviews:  RecentReviewResponse[] | null;
    leaderboard:    LeaderboardEntryResponse[] | null;
    teams:          TeamSummaryResponse[] | null;
}

export async function fetchAllDashboardData(): Promise<DashboardData> {
    try {
        const res = await analyticsClient.get<DashboardData>("/dashboard/all");
        return res.data;
    } catch {
        // Fallback: fire individually in parallel if aggregate route unavailable
        const [platformStats, recentReviews, leaderboard, teams] = await Promise.allSettled([
            fetchDashboardPlatformStats(),
            fetchDashboardRecentReviews(),
            fetchDashboardLeaderboard(),
            fetchTeamsSummary(),
        ]);
        return {
            platformStats: platformStats.status === "fulfilled" ? platformStats.value : null,
            recentReviews: recentReviews.status === "fulfilled" ? recentReviews.value : null,
            leaderboard:   leaderboard.status   === "fulfilled" ? leaderboard.value   : null,
            teams:         teams.status         === "fulfilled" ? teams.value         : null,
        };
    }
}