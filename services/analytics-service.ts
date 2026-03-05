import { fetchWithAuth } from "@/services/auth-service";
import { PlatformStatsResponse, RecentReviewResponse, LeaderboardEntryResponse } from "@/types/dashboard-types";

const ANALYTICS_API =
    process.env.NEXT_PUBLIC_ANALYTICS_API_URL || "http://localhost:8007";



export async function fetchDashboardPlatformStats(): Promise<PlatformStatsResponse | null> {
    try {
        const res = await fetchWithAuth(
            `${ANALYTICS_API}/v1/dashboard/platform-stats`
        );
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

export async function fetchDashboardRecentReviews(): Promise<RecentReviewResponse[] | null> {
    try {
        const res = await fetchWithAuth(
            `${ANALYTICS_API}/v1/dashboard/recent-reviews`
        );
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

export async function fetchDashboardLeaderboard(): Promise<LeaderboardEntryResponse[] | null> {
    try {
        const res = await fetchWithAuth(
            `${ANALYTICS_API}/v1/dashboard/leaderboard`
        );
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}