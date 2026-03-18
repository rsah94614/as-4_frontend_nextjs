import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import TeamReportPage from "@/app/(admin)/team-report/[id]/page";
import { useParams, useRouter } from "next/navigation";
import { fetchTeamReport } from "@/services/analytics-service";
import { extractErrorMessage } from "@/lib/error-utils";

jest.mock("next/navigation", () => ({
  __esModule: true,
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock("@/services/analytics-service", () => ({
  __esModule: true,
  fetchTeamReport: jest.fn(),
}));

jest.mock("@/lib/error-utils", () => ({
  __esModule: true,
  extractErrorMessage: jest.fn(),
}));

jest.mock("@/components/features/admin/team-report/AdminTeamDetailSection", () => ({
  __esModule: true,
  default: ({ report }: any) => (
    <div data-testid="team-detail">team:{report.department_name}</div>
  ),
  AdminTeamDetailSkeleton: () => <div data-testid="team-skeleton">loading</div>,
}));

const mockedUseParams = useParams as jest.Mock;
const mockedUseRouter = useRouter as jest.Mock;
const mockedFetchTeamReport = fetchTeamReport as jest.Mock;
const mockedExtractErrorMessage = extractErrorMessage as jest.Mock;

const report = {
  department_id: "d1",
  department_name: "Engineering",
  total_members: 2,
  total_points: 1200,
  total_reviews: 20,
  total_rewards: 5,
  avg_performance_score: 82,
  members: [],
};

describe("TeamReportPage [id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseParams.mockReturnValue({ id: "dept-1" });
    mockedUseRouter.mockReturnValue({ back: jest.fn() });
    mockedExtractErrorMessage.mockReturnValue("Formatted error");
  });

  test("shows skeleton first and then renders team detail on success", async () => {
    mockedFetchTeamReport.mockResolvedValueOnce(report);

    render(<TeamReportPage />);

    expect(screen.getByTestId("team-skeleton")).toBeInTheDocument();

    await waitFor(() => {
      expect(mockedFetchTeamReport).toHaveBeenCalledWith("dept-1");
    });

    expect(await screen.findByTestId("team-detail")).toHaveTextContent(
      "team:Engineering"
    );
  });

  test("shows fallback error when API returns null", async () => {
    mockedFetchTeamReport.mockResolvedValueOnce(null);

    render(<TeamReportPage />);

    await waitFor(() => {
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Could not load this team's report. Please try again.")
    ).toBeInTheDocument();
  });

  test("shows extracted error message when API throws", async () => {
    mockedFetchTeamReport.mockRejectedValueOnce(new Error("boom"));

    render(<TeamReportPage />);

    await waitFor(() => {
      expect(mockedExtractErrorMessage).toHaveBeenCalled();
    });

    expect(await screen.findByText("Formatted error")).toBeInTheDocument();
  });

  test("Go back button calls router.back()", async () => {
    mockedFetchTeamReport.mockResolvedValueOnce(null);
    const user = userEvent.setup();
    const back = jest.fn();
    mockedUseRouter.mockReturnValue({ back });

    render(<TeamReportPage />);

    const btn = await screen.findByRole("button", { name: /go back/i });
    await user.click(btn);

    expect(back).toHaveBeenCalledTimes(1);
  });

  test("does not fetch when id is missing", async () => {
    mockedUseParams.mockReturnValue({ id: undefined });

    render(<TeamReportPage />);

    await new Promise((r) => setTimeout(r, 0));
    expect(mockedFetchTeamReport).not.toHaveBeenCalled();
    expect(screen.getByTestId("team-skeleton")).toBeInTheDocument();
  });
});
