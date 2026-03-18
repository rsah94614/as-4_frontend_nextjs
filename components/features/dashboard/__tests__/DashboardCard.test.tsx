import { render, screen } from "@testing-library/react";
import DashboardCard from "@/components/features/dashboard/user/DashboardCard";
import { Trophy } from "lucide-react";

describe("DashboardCard", () => {
  const defaultProps = {
    label: "Total Points",
    icon: Trophy,
    gradient: "from-blue-600 to-blue-500",
  };

  it("renders label", () => {
    render(<DashboardCard {...defaultProps} />);
    expect(screen.getByText("Total Points")).toBeInTheDocument();
  });

  it("renders formatted value from stat", () => {
    render(
      <DashboardCard
        {...defaultProps}
        stat={{ value: 1500, this_month: 120, last_month: 100 }}
      />
    );
    expect(screen.getByText("1.5K")).toBeInTheDocument();
  });

  it("renders trend when month comparison exists", () => {
    render(
      <DashboardCard
        {...defaultProps}
        stat={{ value: 10, this_month: 120, last_month: 100 }}
      />
    );
    expect(screen.getByText("+20%")).toBeInTheDocument();
  });

  it("renders loading skeleton state", () => {
    const { container } = render(<DashboardCard {...defaultProps} loading />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("does not render trend when stats are missing", () => {
    render(<DashboardCard {...defaultProps} stat={{ value: 25 } as any} />);
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });
});
