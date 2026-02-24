/**
 * Analytics service — fetches the dashboard summary from the analytics API.
 *
 * Single entry-point: `fetchDashboardSummary()` returns all data needed by
 * the /dashboard page in one HTTP call.
 */

import { fetchWithAuth } from "@/services/auth-service";

const ANALYTICS_API =
    process.env.NEXT_PUBLIC_ANALYTICS_API_URL || "http://localhost:8007";

// ─── Response types ───────────────────────────────────────────────────────────

export interface MetricWithGrowth {
    value: number;
    growth_percent: number;
}

export interface PlatformStats {
    total_points: MetricWithGrowth;
    rewards_redeemed: MetricWithGrowth;
    reviews_received: MetricWithGrowth;
    active_users: MetricWithGrowth;
}

export interface EmployeeSummary {
    employee_id: string;
    username: string;
    designation: string;
    department: string;
}

export interface RecentReview {
    review_id: string;
    reviewer_name: string;
    rating: number;
    comment: string;
    review_at: string;
}

export interface LeaderboardEntry {
    rank: number;
    employee_id: string;
    username: string;
    department: string;
    total_earned_points: number;
}

export interface DashboardSummaryResponse {
    employee: EmployeeSummary;
    recent_reviews: RecentReview[];
    leaderboard: LeaderboardEntry[];
    platform_stats: PlatformStats;
}

// ─── Fetcher ──────────────────────────────────────────────────────────────────

export async function fetchDashboardSummary(): Promise<DashboardSummaryResponse | null> {
    try {
        const res = await fetchWithAuth(
            `${ANALYTICS_API}/v1/dashboard/summary`
        );
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}
