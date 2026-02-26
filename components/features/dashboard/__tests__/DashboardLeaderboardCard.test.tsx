import { render, screen } from "@testing-library/react";
import DashboardLeaderboardCard from "@/components/features/dashboard/DashboardLeaderboardCard";

describe("DashboardLeaderboardCard", () => {
    const defaultProps = {
        rank: 2,
        name: "Jane Smith",
        initials: "JS",
        points: 1500,
        color: "bg-purple-500",
        image: null,
    };

    it("renders rank, name, and points", () => {
        render(<DashboardLeaderboardCard {...defaultProps} />);
        expect(screen.getByText("#2")).toBeInTheDocument();
        expect(screen.getByText("Jane Smith")).toBeInTheDocument();
        expect(screen.getByText("1,500 pts")).toBeInTheDocument();
    });

    it("shows crown icon for rank 1", () => {
        const { container } = render(
            <DashboardLeaderboardCard {...defaultProps} rank={1} />
        );
        // Crown renders as an SVG with the lucide-crown class or similar
        const svgs = container.querySelectorAll("svg");
        // rank 1 gets an extra crown SVG icon
        expect(svgs.length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText("#1")).toBeInTheDocument();
    });

    it("does not show crown icon for rank > 1", () => {
        const { container } = render(
            <DashboardLeaderboardCard {...defaultProps} rank={3} />
        );
        // Only the avatar fallback should be present, no crown
        // Count SVG elements — rank > 1 should have none (no Crown icon)
        const svgs = container.querySelectorAll("svg");
        expect(svgs.length).toBe(0);
    });

    it("renders initials in avatar fallback", () => {
        render(<DashboardLeaderboardCard {...defaultProps} />);
        expect(screen.getByText("JS")).toBeInTheDocument();
    });
});
