import { render, screen } from "@testing-library/react";
import DashboardLeaderboardSection from "@/components/features/dashboard/DashboardLeaderboardSection";
import type { LeaderboardEntry } from "@/services/analytics-service";

const mockEntries: LeaderboardEntry[] = [
    {
        rank: 1,
        employee_id: "e1",
        username: "alice.jones",
        department: "Engineering",
        total_earned_points: 2500,
    },
    {
        rank: 2,
        employee_id: "e2",
        username: "bob.smith",
        department: "Design",
        total_earned_points: 1800,
    },
];

describe("DashboardLeaderboardSection", () => {
    it("shows loading skeletons when loading", () => {
        const { container } = render(
            <DashboardLeaderboardSection entries={[]} loading={true} />
        );
        const skeletons = container.querySelectorAll(".animate-pulse");
        expect(skeletons.length).toBe(5);
    });

    it('shows "No data available" when entries is empty and not loading', () => {
        render(<DashboardLeaderboardSection entries={[]} loading={false} />);
        expect(screen.getByText("No data available.")).toBeInTheDocument();
    });

    it("renders leaderboard entries when provided", () => {
        render(
            <DashboardLeaderboardSection entries={mockEntries} loading={false} />
        );
        expect(screen.getByText("alice.jones")).toBeInTheDocument();
        expect(screen.getByText("bob.smith")).toBeInTheDocument();
        expect(screen.getByText("2,500 pts")).toBeInTheDocument();
        expect(screen.getByText("1,800 pts")).toBeInTheDocument();
    });

    it("renders the section heading", () => {
        render(
            <DashboardLeaderboardSection entries={mockEntries} loading={false} />
        );
        expect(screen.getByText("Leaderboard")).toBeInTheDocument();
    });

    it("does not show loading skeletons when not loading", () => {
        const { container } = render(
            <DashboardLeaderboardSection entries={mockEntries} loading={false} />
        );
        const skeletons = container.querySelectorAll(".animate-pulse");
        expect(skeletons.length).toBe(0);
    });
});
