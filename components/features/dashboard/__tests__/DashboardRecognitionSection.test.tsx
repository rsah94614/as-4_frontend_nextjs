import { render, screen, waitFor } from "@testing-library/react";
import DashboardRecognitionSection from "@/components/features/dashboard/user/DashboardRecognitionSection";
import { fetchDashboardRecentReviews } from "@/services/analytics-service";

jest.mock("@/services/analytics-service", () => ({
  __esModule: true,
  fetchDashboardRecentReviews: jest.fn(),
}));

const mockedFetchDashboardRecentReviews =
  fetchDashboardRecentReviews as jest.MockedFunction<
    typeof fetchDashboardRecentReviews
  >;

describe("DashboardRecognitionSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading skeletons first", () => {
    mockedFetchDashboardRecentReviews.mockReturnValue(new Promise(() => null) as any);
    const { container } = render(<DashboardRecognitionSection />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("shows empty state when API returns no reviews", async () => {
    mockedFetchDashboardRecentReviews.mockResolvedValueOnce([] as any);
    render(<DashboardRecognitionSection />);

    expect(await screen.findByText("No reviews yet")).toBeInTheDocument();
  });

  it("renders review cards from API", async () => {
    mockedFetchDashboardRecentReviews.mockResolvedValueOnce([
      {
        review_id: "r1",
        reviewer_name: "alice.jones",
        rating: 5,
        comment: "Excellent presentation!",
        review_at: new Date().toISOString(),
        tags: ["Delivery"],
      },
      {
        review_id: "r2",
        reviewer_name: "bob_smith",
        rating: 3,
        comment: "Good effort overall.",
        review_at: new Date(Date.now() - 3600_000).toISOString(),
        tags: ["Teamwork"],
      },
    ] as any);

    render(<DashboardRecognitionSection />);

    expect(await screen.findByText("alice.jones")).toBeInTheDocument();
    expect(screen.getByText("bob_smith")).toBeInTheDocument();
    expect(screen.getByText(/Excellent presentation!/i)).toBeInTheDocument();
    expect(screen.getByText(/Good effort overall\./i)).toBeInTheDocument();
    expect(screen.getByText("2 reviews")).toBeInTheDocument();

    await waitFor(() => {
      expect(mockedFetchDashboardRecentReviews).toHaveBeenCalledTimes(1);
    });
  });

  it("renders section heading", async () => {
    mockedFetchDashboardRecentReviews.mockResolvedValueOnce([] as any);
    render(<DashboardRecognitionSection />);
    expect(screen.getByText("Recent Reviews")).toBeInTheDocument();
    await screen.findByText("No reviews yet");
  });
});
