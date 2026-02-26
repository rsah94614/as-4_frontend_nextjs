import { render, screen } from "@testing-library/react";
import DashboardRecognitionCard from "@/components/features/dashboard/DashboardRecognitionCard";

describe("DashboardRecognitionCard", () => {
    const defaultProps = {
        id: "rev-1",
        from: "Alice",
        fromInitials: "AL",
        to: "Bob",
        toInitials: "BO",
        message: "Great teamwork on the project!",
        points: 50,
        time: "2h ago",
        color: "bg-purple-500",
        image: null,
    };

    it("renders from name, to name, and message", () => {
        render(<DashboardRecognitionCard {...defaultProps} />);
        expect(screen.getByText("Alice")).toBeInTheDocument();
        expect(screen.getByText("Bob")).toBeInTheDocument();
        expect(
            screen.getByText("Great teamwork on the project!")
        ).toBeInTheDocument();
    });

    it("renders time", () => {
        render(<DashboardRecognitionCard {...defaultProps} />);
        expect(screen.getByText("2h ago")).toBeInTheDocument();
    });

    it("shows points badge when points > 0", () => {
        render(<DashboardRecognitionCard {...defaultProps} />);
        expect(screen.getByText("+50 pts")).toBeInTheDocument();
    });

    it("hides points badge when points is 0", () => {
        render(<DashboardRecognitionCard {...defaultProps} points={0} />);
        expect(screen.queryByText(/pts/)).not.toBeInTheDocument();
    });

    it("renders avatar initials", () => {
        render(<DashboardRecognitionCard {...defaultProps} />);
        expect(screen.getByText("AL")).toBeInTheDocument();
    });
});
