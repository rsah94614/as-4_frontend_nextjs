import { render, screen, waitFor } from "@testing-library/react";
import DashboardPage from "@/app/(dashboard)/dashboard/page";
import { fetchDashboardSummary } from "@/services/analytics-service";
import type { DashboardSummaryResponse } from "@/services/analytics-service";

// ─── Mock the analytics service ─────────────────────────────────────────────

jest.mock("@/services/analytics-service", () => ({
    fetchDashboardSummary: jest.fn(),
}));

const mockedFetch = fetchDashboardSummary as jest.MockedFunction<
    typeof fetchDashboardSummary
>;

// ─── Test data ──────────────────────────────────────────────────────────────

const mockData: DashboardSummaryResponse = {
    employee: {
        employee_id: "e1",
        username: "test.user",
        designation: "Engineer",
        department: "Engineering",
    },
    platform_stats: {
        total_points: { value: 25000, growth_percent: 12 },
        rewards_redeemed: { value: 150, growth_percent: -3 },
        reviews_received: { value: 500, growth_percent: 8 },
        active_users: { value: 42, growth_percent: 0 },
    },
    recent_reviews: [
        {
            review_id: "r1",
            reviewer_name: "alice.jones",
            rating: 5,
            comment: "Great work!",
            review_at: new Date().toISOString(),
        },
    ],
    leaderboard: [
        {
            rank: 1,
            employee_id: "e1",
            username: "top.performer",
            department: "Sales",
            total_earned_points: 5000,
        },
    ],
};

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("DashboardPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders stat cards with fetched data", async () => {
        mockedFetch.mockResolvedValue(mockData);

        render(<DashboardPage />);

        // Wait for data to load — findByText polls until element appears
        expect(await screen.findByText("25.0K")).toBeInTheDocument();

        expect(screen.getByText("Total Points:")).toBeInTheDocument();
        expect(screen.getByText("Rewards Redeemed:")).toBeInTheDocument();
        expect(screen.getByText("150")).toBeInTheDocument();
        expect(screen.getByText("Reviews Received:")).toBeInTheDocument();
        expect(screen.getByText("500")).toBeInTheDocument();
        expect(screen.getByText("Active Users:")).toBeInTheDocument();
        expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("renders growth percentages on stat cards", async () => {
        mockedFetch.mockResolvedValue(mockData);

        render(<DashboardPage />);

        await waitFor(() => {
            expect(screen.getByText(/\+12%/)).toBeInTheDocument();
        });

        expect(screen.getByText(/-3%/)).toBeInTheDocument();
        expect(screen.getByText(/\+8%/)).toBeInTheDocument();
        expect(screen.getByText(/\+0%/)).toBeInTheDocument();
    });

    it("renders leaderboard and recognition sections", async () => {
        mockedFetch.mockResolvedValue(mockData);

        render(<DashboardPage />);

        // Wait for async data to render — use findByText which polls
        expect(await screen.findByText("Leaderboard")).toBeInTheDocument();
        expect(await screen.findByText("top.performer")).toBeInTheDocument();
        expect(screen.getByText("Recent Reviews")).toBeInTheDocument();
        expect(screen.getByText("Great work!")).toBeInTheDocument();
    });

    it("handles null API response gracefully", async () => {
        mockedFetch.mockResolvedValue(null);

        render(<DashboardPage />);

        // Wait for the fetch to resolve and component to re-render
        expect(await screen.findByText("No data available.")).toBeInTheDocument();
        expect(screen.getByText("No reviews yet.")).toBeInTheDocument();

        // Should display dash placeholders for all stat values
        const dashes = screen.getAllByText("—");
        expect(dashes.length).toBe(4);
    });

    it("calls fetchDashboardSummary on mount", async () => {
        mockedFetch.mockResolvedValue(mockData);

        render(<DashboardPage />);

        await waitFor(() => {
            expect(mockedFetch).toHaveBeenCalledTimes(1);
        });
    });
});
