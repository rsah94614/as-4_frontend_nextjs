import { render, screen } from "@testing-library/react";
import DashboardCard from "@/components/features/dashboard/DashboardCard";
import { Trophy } from "lucide-react";

describe("DashboardCard", () => {
    const defaultProps = {
        label: "Total Points:",
        value: "1.5K",
        icon: Trophy,
        iconBgColor: "bg-yellow-200",
    };

    it("renders the label and value", () => {
        render(<DashboardCard {...defaultProps} />);
        expect(screen.getByText("Total Points:")).toBeInTheDocument();
        expect(screen.getByText("1.5K")).toBeInTheDocument();
    });

    it("renders the icon", () => {
        const { container } = render(<DashboardCard {...defaultProps} />);
        // Lucide icons render as SVG elements
        const svg = container.querySelector("svg");
        expect(svg).toBeInTheDocument();
    });

    it("shows change text when change prop is provided", () => {
        render(<DashboardCard {...defaultProps} change="+12%" />);
        expect(screen.getByText("+12% from last month")).toBeInTheDocument();
    });

    it("uses custom changeLabel when provided", () => {
        render(
            <DashboardCard {...defaultProps} change="+5%" changeLabel="this week" />
        );
        expect(screen.getByText("+5% this week")).toBeInTheDocument();
    });

    it("hides change text when change prop is not provided", () => {
        render(<DashboardCard {...defaultProps} />);
        expect(screen.queryByText(/from last month/)).not.toBeInTheDocument();
    });

    it("applies green styling for positive change", () => {
        render(<DashboardCard {...defaultProps} change="+12%" />);
        const changeEl = screen.getByText("+12% from last month");
        expect(changeEl).toHaveClass("text-green-600");
    });

    it("applies red styling for negative change", () => {
        render(<DashboardCard {...defaultProps} change="-5%" />);
        const changeEl = screen.getByText("-5% from last month");
        expect(changeEl).toHaveClass("text-red-500");
    });
});
