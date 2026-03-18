import { render, screen, waitFor } from "@testing-library/react";
import DashboardLeaderboardSection from "@/components/features/dashboard/user/DashboardLeaderboardSection";
import { fetchDashboardLeaderboard } from "@/services/analytics-service";

jest.mock("@/services/analytics-service", () => ({
  __esModule: true,
  fetchDashboardLeaderboard: jest.fn(),
}));

const mockedFetchDashboardLeaderboard =
  fetchDashboardLeaderboard as jest.MockedFunction<typeof fetchDashboardLeaderboard>;

describe("DashboardLeaderboardSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading skeletons first", () => {
    mockedFetchDashboardLeaderboard.mockReturnValue(new Promise(() => null) as any);
    const { container } = render(<DashboardLeaderboardSection />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it('shows empty state when API returns no entries', async () => {
    mockedFetchDashboardLeaderboard.mockResolvedValueOnce([] as any);
    render(<DashboardLeaderboardSection />);

    expect(await screen.findByText("No data yet")).toBeInTheDocument();
  });

  it("renders leaderboard entries from API", async () => {
    mockedFetchDashboardLeaderboard.mockResolvedValueOnce([
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
      {
        rank: 4,
        employee_id: "e4",
        username: "charlie",
        department: "QA",
        total_earned_points: 1200,
      },
    ] as any);

    render(<DashboardLeaderboardSection />);

    expect(await screen.findByText("alice.jones")).toBeInTheDocument();
    expect(screen.getByText("bob.smith")).toBeInTheDocument();
    expect(screen.getByText("charlie")).toBeInTheDocument();
    expect(screen.getByText("2,500 pts")).toBeInTheDocument();
    expect(screen.getByText("1,800 pts")).toBeInTheDocument();
    expect(screen.getByText("1,200")).toBeInTheDocument();

    await waitFor(() => {
      expect(mockedFetchDashboardLeaderboard).toHaveBeenCalledTimes(1);
    });
  });

  it("renders section heading", async () => {
    mockedFetchDashboardLeaderboard.mockResolvedValueOnce([] as any);
    render(<DashboardLeaderboardSection />);
    expect(screen.getByText("Leaderboard")).toBeInTheDocument();
    await screen.findByText("No data yet");
  });
});
