import { render, screen } from "@testing-library/react";
import DashboardRecognitionSection from "@/components/features/dashboard/DashboardRecogntionSection";
import type { RecentReview } from "@/services/analytics-service";

const mockReviews: RecentReview[] = [
    {
        review_id: "r1",
        reviewer_name: "alice.jones",
        rating: 5,
        comment: "Excellent presentation!",
        review_at: new Date().toISOString(),
    },
    {
        review_id: "r2",
        reviewer_name: "bob_smith",
        rating: 3,
        comment: "Good effort overall.",
        review_at: new Date(Date.now() - 3600_000).toISOString(), // 1h ago
    },
];

describe("DashboardRecognitionSection", () => {
    it("shows loading skeletons when loading", () => {
        const { container } = render(
            <DashboardRecognitionSection reviews={[]} loading={true} />
        );
        const skeletons = container.querySelectorAll(".animate-pulse");
        expect(skeletons.length).toBe(5);
    });

    it('shows "No reviews yet." when reviews is empty and not loading', () => {
        render(<DashboardRecognitionSection reviews={[]} loading={false} />);
        expect(screen.getByText("No reviews yet.")).toBeInTheDocument();
    });

    it("renders recognition cards when reviews are provided", () => {
        render(
            <DashboardRecognitionSection reviews={mockReviews} loading={false} />
        );
        expect(screen.getByText("alice.jones")).toBeInTheDocument();
        expect(screen.getByText("bob_smith")).toBeInTheDocument();
        expect(screen.getByText("Excellent presentation!")).toBeInTheDocument();
        expect(screen.getByText("Good effort overall.")).toBeInTheDocument();
    });

    it("renders the section heading", () => {
        render(
            <DashboardRecognitionSection reviews={mockReviews} loading={false} />
        );
        expect(screen.getByText("Recent Reviews")).toBeInTheDocument();
    });

    it("does not show loading skeletons when not loading", () => {
        const { container } = render(
            <DashboardRecognitionSection reviews={mockReviews} loading={false} />
        );
        const skeletons = container.querySelectorAll(".animate-pulse");
        expect(skeletons.length).toBe(0);
    });
});
