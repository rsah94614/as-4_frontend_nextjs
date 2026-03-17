// services/analytics-service.ts
// All requests routed through Next.js proxy — no direct microservice URL in browser.

import { createAuthenticatedClient } from "@/lib/api-utils";
import { extractErrorMessage } from "@/lib/error-utils";
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
    } catch (error) {
        console.error("Platform Stats Error:", extractErrorMessage(error));
        return null;
    }
}

export async function fetchDashboardRecentReviews(): Promise<RecentReviewResponse[] | null> {
    try {
        const res = await analyticsClient.get<RecentReviewResponse[]>("/dashboard/recent-reviews");
        return res.data;
    } catch (error) {
        console.error("Recent Reviews Error:", extractErrorMessage(error));
        return null;
    }
}

export async function fetchDashboardLeaderboard(): Promise<LeaderboardEntryResponse[] | null> {
    try {
        const res = await analyticsClient.get<LeaderboardEntryResponse[]>("/dashboard/leaderboard");
        return res.data;
    } catch (error) {
        console.error("Leaderboard Error:", extractErrorMessage(error));
        return null;
    }
}

export async function fetchTeamsSummary(): Promise<TeamSummaryResponse[] | null> {
    try {
        const res = await analyticsClient.get<TeamSummaryResponse[]>("/dashboard/teams");
        return res.data;
    } catch (error) {
        console.error("Teams Summary Error:", extractErrorMessage(error));
        return null;
    }
}

export async function fetchRecognitionUsers(
    range: "week" | "month" | "quarter" | "year",
    page = 1,
    limit = 100,
): Promise<PaginatedUserRecognition | null> {
    try {
        const res = await analyticsClient.get<PaginatedUserRecognition>(
            `/dashboard/recognition/users?range=${range}&page=${page}&limit=${limit}`
        );
        return res.data;
    } catch (error) {
        console.error("Recognition Users Error:", extractErrorMessage(error));
        return null;
    }
}

export async function fetchRecognitionTeams(
    range: "week" | "month" | "quarter" | "year",
    page = 1,
    limit = 20,
): Promise<PaginatedTeamRecognition | null> {
    try {
        const res = await analyticsClient.get<PaginatedTeamRecognition>(
            `/dashboard/recognition/teams?range=${range}&page=${page}&limit=${limit}`
        );
        return res.data;
    } catch (error) {
        console.error("Recognition Teams Error:", extractErrorMessage(error));
        return null;
    }
}

export async function fetchRecognitionTrend(range: "3m" | "6m" | "1y"): Promise<RecognitionTrendResponse | null> {
    try {
        const res = await analyticsClient.get<RecognitionTrendResponse>(
            `/dashboard/recognition-trend?range=${range}`
        );
        return res.data;
    } catch (error) {
        console.error("Recognition Trend Error:", extractErrorMessage(error));
        return null;
    }
}

export async function fetchParticipation(): Promise<ParticipationResponse | null> {
    try {
        const res = await analyticsClient.get<ParticipationResponse>("/dashboard/participation");
        return res.data;
    } catch (error) {
        console.error("Participation Data Error:", extractErrorMessage(error));
        return null;
    }
}

export async function fetchTeamReport(departmentId: string): Promise<TeamReportResponse | null> {
    try {
        const res = await analyticsClient.get<TeamReportResponse>(`/dashboard/teams/${departmentId}`);
        return res.data;
    } catch (error) {
        console.error("Team Report Error:", extractErrorMessage(error));
        return null;
    }
}

// ── Aggregate fetch — for the main dashboard page ────────────────────────────

export interface DashboardData {
    platformStats:  PlatformStatsResponse | null;
    recentReviews:  RecentReviewResponse[] | null;
    leaderboard:    LeaderboardEntryResponse[] | null;
    teams:          TeamSummaryResponse[] | null;
}

export interface AdminDashboardData {
    participation: ParticipationResponse | null;
    recognitionTrend: RecognitionTrendResponse | null;
    recognitionUsers: PaginatedUserRecognition | null;
    recognitionTeams: PaginatedTeamRecognition | null;
    teams: TeamSummaryResponse[] | null;
}

export async function fetchAdminDashboardData(): Promise<AdminDashboardData> {
    const [participation, recognitionTrend, recognitionUsers, recognitionTeams, teams] = await Promise.allSettled([
        fetchParticipation(),
        fetchRecognitionTrend("6m"),
        fetchRecognitionUsers("month"),
        fetchRecognitionTeams("month"),
        fetchTeamsSummary(),
    ]);

    return {
        participation: participation.status === "fulfilled" ? participation.value : null,
        recognitionTrend: recognitionTrend.status === "fulfilled" ? recognitionTrend.value : null,
        recognitionUsers: recognitionUsers.status === "fulfilled" ? recognitionUsers.value : null,
        recognitionTeams: recognitionTeams.status === "fulfilled" ? recognitionTeams.value : null,
        teams: teams.status === "fulfilled" ? teams.value : null,
    };
}

export async function fetchAllDashboardData(): Promise<DashboardData> {
    try {
        const res = await analyticsClient.get<DashboardData>("/dashboard/all");
        return res.data;
    } catch {
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
