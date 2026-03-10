// services/analytics-service.ts
// All requests routed through Next.js proxy — no direct microservice URL in browser.

import { createAuthenticatedClient } from "@/lib/api-utils";
import type {
    PlatformStatsResponse,
    RecentReviewResponse,
    LeaderboardEntryResponse,
    TeamSummaryResponse,
    TeamReportResponse,
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