import { render, screen } from "@testing-library/react";
import DashboardLeaderboardCard from "@/components/features/dashboard/user/DashboardLeaderboardCard";

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
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText((1500).toLocaleString())).toBeInTheDocument();
  });

  it("renders updated rank when rank prop changes", () => {
    render(<DashboardLeaderboardCard {...defaultProps} rank={1} />);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("uses locale formatting for large points", () => {
    render(<DashboardLeaderboardCard {...defaultProps} points={1234567} />);
    expect(screen.getByText((1234567).toLocaleString())).toBeInTheDocument();
  });

  it("renders initials in avatar fallback", () => {
    render(<DashboardLeaderboardCard {...defaultProps} />);
    expect(screen.getByText("JS")).toBeInTheDocument();
  });
});
