type Metric = {
    value: number;
    this_month: number;
    last_month: number;
};

export type PlatformStatsResponse = {
    total_points: Metric;
    rewards_redeemed: Metric;
    reviews_received: Metric;
    active_users: Metric;
};

export type RecentReviewResponse = {
    review_id: string;
    reviewer_name: string;
    rating: number;
    comment: string;
    review_at: string;
};

export type LeaderboardEntryResponse = {
    rank: number;
    employee_id: string;
    username: string;
    department: string;
    total_earned_points: number;
};