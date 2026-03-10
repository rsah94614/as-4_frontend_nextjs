/**
 * services/analytics-service.ts
 *
 * All dashboard data now fetched through the Next.js proxy (/api/proxy/*).
 * Benefits vs direct microservice calls:
 *  - Same-origin request → no CORS preflight
 *  - Token stays server-side
 *  - Single TCP connection from browser
 *
 * fetchAllDashboardData() fetches all 4 panels in ONE browser request
 * by hitting /api/proxy/dashboard which fans them out in parallel server-side.
 */

import {
    PlatformStatsResponse,
    RecentReviewResponse,
    LeaderboardEntryResponse,
    TeamSummaryResponse,
    TeamReportResponse,
} from "@/types/dashboard-types";

// All requests go through Next.js proxy — no direct microservice URLs in browser
const PROXY = "/api/proxy";

async function get<T>(path: string): Promise<T | null> {
    try {
        const res = await fetch(path, {
            headers: {
                Authorization: `Bearer ${
                    typeof window !== "undefined"
                        ? (localStorage.getItem("access_token") ?? "")
                        : ""
                }`,
            },
            // Next.js fetch cache — revalidate every 30s for dashboard data
            next: { revalidate: 30 },
        });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

// ─── Aggregate fetch — ONE browser request for the entire dashboard ───────────

export interface DashboardData {
    platformStats:  PlatformStatsResponse | null;
    recentReviews:  RecentReviewResponse[] | null;
    leaderboard:    LeaderboardEntryResponse[] | null;
    teams:          TeamSummaryResponse[] | null;
}

/**
 * Fetches all 4 dashboard panels in a single browser → Next.js request.
 * The proxy fans them out to the analytics service in parallel server-side.
 * Use this instead of calling the 4 individual functions below on the dashboard page.
 */
export async function fetchAllDashboardData(): Promise<DashboardData> {
    const data = await get<DashboardData>(`${PROXY}/dashboard`);
    return data ?? { platformStats: null, recentReviews: null, leaderboard: null, teams: null };
}

// ─── Individual fetches (kept for pages that need only one panel) ─────────────

export async function fetchDashboardPlatformStats(): Promise<PlatformStatsResponse | null> {
    return get<PlatformStatsResponse>(`${PROXY}/analytics/v1/dashboard/platform-stats`);
}

export async function fetchDashboardRecentReviews(): Promise<RecentReviewResponse[] | null> {
    return get<RecentReviewResponse[]>(`${PROXY}/analytics/v1/dashboard/recent-reviews`);
}

export async function fetchDashboardLeaderboard(): Promise<LeaderboardEntryResponse[] | null> {
    return get<LeaderboardEntryResponse[]>(`${PROXY}/analytics/v1/dashboard/leaderboard`);
}

export async function fetchTeamsSummary(): Promise<TeamSummaryResponse[] | null> {
    return get<TeamSummaryResponse[]>(`${PROXY}/analytics/v1/dashboard/teams`);
}

export async function fetchTeamReport(departmentId: string): Promise<TeamReportResponse | null> {
    return get<TeamReportResponse>(`${PROXY}/analytics/v1/dashboard/teams/${departmentId}`);
}