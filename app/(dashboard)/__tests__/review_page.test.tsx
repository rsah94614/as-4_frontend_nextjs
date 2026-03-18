import { render, screen } from "@testing-library/react";
import ReviewPage from "../review/page";
import { useReviewPage } from "@/hooks/useReviewPage";
import { useReviewerWeight } from "@/hooks/useReviewerWeight";

jest.mock("@/hooks/useReviewPage", () => ({
    useReviewPage: jest.fn(),
}));

jest.mock("@/hooks/useReviewerWeight", () => ({
    useReviewerWeight: jest.fn(),
}));

jest.mock("@/components/features/review/ReviewComposeForm", () => () => <div data-testid="compose-form">Compose Form</div>);
jest.mock("@/components/features/review/ReviewListSection", () => () => <div data-testid="list-section">List Section</div>);
jest.mock("@/components/features/review/ReviewToast", () => () => <div data-testid="toast-msg">Toast</div>);
jest.mock("@/components/features/review/ReviewPageSkeleton", () => () => <div data-testid="skeleton">Skeleton</div>);

describe("ReviewPage", () => {
    beforeEach(() => {
        (useReviewerWeight as jest.Mock).mockReturnValue({ weight: 1.0 });
    });

    it("renders the skeleton when loading", () => {
        (useReviewPage as jest.Mock).mockReturnValue({
            loadingData: true,
            categories: [],
            reviewedThisMonth: new Set(),
        });
        render(<ReviewPage />);
        expect(screen.getByTestId("skeleton")).toBeInTheDocument();
    });

    it("renders forms and lists when data is loaded", () => {
        (useReviewPage as jest.Mock).mockReturnValue({
            loadingData: false,
            categories: [{ category_id: "1", name: "Teamwork" }],
            reviewedThisMonth: new Set(),
            filteredReviews: [],
        });
        render(<ReviewPage />);

        expect(screen.getByTestId("compose-form")).toBeInTheDocument();
        expect(screen.getByTestId("list-section")).toBeInTheDocument();
    });

    it("renders a toast when a toast prop is passed", () => {
        (useReviewPage as jest.Mock).mockReturnValue({
            loadingData: false,
            categories: [{ category_id: "1", name: "Teamwork" }],
            reviewedThisMonth: new Set(),
            filteredReviews: [],
            toast: { msg: "Success", kind: "success" },
            setToast: jest.fn(),
        });
        render(<ReviewPage />);

        expect(screen.getByTestId("toast-msg")).toBeInTheDocument();
    });
});
