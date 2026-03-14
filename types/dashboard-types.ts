// ── Shared ────────────────────────────────────────────────────────────────────

export type Metric = {
    value: number;
    this_month: number;
    last_month: number;
};


// ── Platform stats ────────────────────────────────────────────────────────────

export type PlatformStatsResponse = {
    total_points: Metric;
    rewards_redeemed: Metric;
    reviews_received: Metric;
    active_users: Metric;
};


// ── Recent reviews ────────────────────────────────────────────────────────────

export interface RecentReview {
    review_id: string;
    reviewer_name: string;
    tags: string[];
    comment: string;
    review_at: string;
}

export type RecentReviewResponse = {
    review_id: string;
    reviewer_name: string;
    tags: string[];
    comment: string;
    review_at: string;
};


// ── Leaderboard ───────────────────────────────────────────────────────────────

export type LeaderboardEntryResponse = {
    rank: number;
    employee_id: string;
    username: string;
    department: string;
    total_earned_points: number;
};


// ── Admin — Recognition Overview ─────────────────────────────────────────────

export type UserRecognition = {
    employee_id: string;
    username: string;
    department: string;
    given: number;
    received: number;
};

export type TeamRecognition = {
    department_id: string;
    name: string;
    given: number;
    received: number;
    members: number;
};

export type PaginatedUserRecognition = {
    items: UserRecognition[];
    total: number;
    page: number;
    limit: number;
    pages: number;
};

export type PaginatedTeamRecognition = {
    items: TeamRecognition[];
    total: number;
    page: number;
    limit: number;
    pages: number;
};


// ── Admin — Recognition Trend ─────────────────────────────────────────────────

export type TrendPoint = {
    label: string;
    given: number;
    received: number;
};

export type RecognitionTrendResponse = {
    data: TrendPoint[];
};


// ── Admin — Participation ─────────────────────────────────────────────────────

export type ParticipationSlice = {
    name: string;
    value: number;
};

export type ParticipationStats = {
    total_employees: number;
    active_participants: number;
    non_participants: number;
    participation_rate: number;
    avg_reviews_per_employee: number;
    avg_reviews_last_month: number;
};

export type ParticipationDeptEntry = {
    department_id: string;
    name: string;
    rate: number;
    active: number;
    total: number;
};

export type ParticipationResponse = {
    pie: ParticipationSlice[];
    stats: ParticipationStats;
    by_department: ParticipationDeptEntry[];
};


// ── Admin — Team Reports ──────────────────────────────────────────────────────

export type TeamSummaryResponse = {
    department_id: string;
    department_name: string;
    total_members: number;
    total_points: number;
    avg_performance_score: number;
};

export type TeamMemberReportResponse = {
    employee_id: string;
    username: string;
    designation: string;
    total_earned_points: number;
    available_points: number;
    reviews_received: number;
    rewards_redeemed: number;
    reviews_this_month: number;
    points_this_month: number;
    performance_score: number;
};

export type TeamReportResponse = {
    department_id: string;
    department_name: string;
    total_members: number;
    total_points: number;
    total_reviews: number;
    total_rewards: number;
    avg_performance_score: number;
    members: TeamMemberReportResponse[];
};