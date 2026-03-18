import { render, screen } from "@testing-library/react";
import DashboardRecognitionCard from "@/components/features/dashboard/user/DashboardRecognitionCard";

describe("DashboardRecognitionCard", () => {
  const defaultProps = {
    id: "rev-1",
    from: "Alice",
    fromInitials: "AL",
    to: "you",
    toInitials: "",
    message: "Great teamwork on the project!",
    tags: ["Teamwork", "Ownership"],
    time: "2h ago",
    color: "bg-purple-500",
    image: null,
  };

  it("renders from name and message", () => {
    render(<DashboardRecognitionCard {...defaultProps} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText(/Great teamwork on the project!/i)).toBeInTheDocument();
  });

  it("renders time", () => {
    render(<DashboardRecognitionCard {...defaultProps} />);
    expect(screen.getByText("2h ago")).toBeInTheDocument();
  });

  it("renders tags", () => {
    render(<DashboardRecognitionCard {...defaultProps} />);
    expect(screen.getByText("Teamwork")).toBeInTheDocument();
    expect(screen.getByText("Ownership")).toBeInTheDocument();
  });

  it("hides tags block when tags array is empty", () => {
    render(<DashboardRecognitionCard {...defaultProps} tags={[]} />);
    expect(screen.queryByText("Teamwork")).not.toBeInTheDocument();
  });

  it("renders avatar initials", () => {
    render(<DashboardRecognitionCard {...defaultProps} />);
    expect(screen.getByText("AL")).toBeInTheDocument();
  });
});
