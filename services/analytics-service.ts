import { extractErrorMessage } from "@/lib/error-utils";
import { analyticsClient } from "@/services/api-clients";
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

// ── Individual fetchers (used by pages that need only one panel) ──────────────

/**
 * Aggregates all dashboard data in parallel.
 * Replaces the server-side proxy aggregate.
 */
export async function fetchDashboardAggregate() {
    const [platformStats, recentReviews, leaderboard, teams] = await Promise.all([
        fetchDashboardPlatformStats(),
        fetchDashboardRecentReviews(),
        fetchDashboardLeaderboard(),
        fetchTeamsSummary(),
    ]);

    return { platformStats, recentReviews, leaderboard, teams };
}

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

