import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import AdminReviewsPage from "@/app/(admin)/reviews/page";
import { useAdminReviews } from "@/hooks/useAdminReviews";

jest.mock("@/hooks/useAdminReviews");

jest.mock("@/components/features/admin/reviews/TeamSection", () => ({
  __esModule: true,
  TeamSection: ({ manager, expanded, onToggle, members }: any) => (
    <div data-testid={`team-${manager.employee_id}`}>
      <div>{manager.username}</div>
      <div data-testid={`expanded-${manager.employee_id}`}>{String(expanded)}</div>
      <div data-testid={`members-${manager.employee_id}`}>{members.length}</div>
      <button onClick={onToggle}>toggle-{manager.employee_id}</button>
    </div>
  ),
}));

jest.mock("@/components/features/admin/reviews/UIHelpers", () => ({
  __esModule: true,
  CalendarStrip: ({ month, year, onChange }: any) => (
    <div data-testid="calendar-strip">
      <div data-testid="calendar-value">{`${month}-${year}`}</div>
      <button onClick={() => onChange(5, 2028)}>set-calendar</button>
    </div>
  ),
}));

const mockedUseAdminReviews = useAdminReviews as jest.Mock;

const managerA = { employee_id: "m1", username: "Alice Manager" };
const managerB = { employee_id: "m2", username: "Bob Lead" };

const memberMap: Record<string, any[]> = {
  m1: [{ employee_id: "u1", username: "Charlie" }],
  m2: [{ employee_id: "u2", username: "Delta" }],
};

function makeHookReturn(overrides: Partial<any> = {}) {
  return {
    employees: [],
    reviews: [],
    loading: false,
    error: null,
    month: 2,
    year: 2026,
    setMonth: jest.fn(),
    setYear: jest.fn(),
    managers: [managerA, managerB],
    getTeam: (id: string) => memberMap[id] ?? [],
    summary: { totalReviews: 7, totalPoints: 13.5 },
    refresh: jest.fn(),
    ...overrides,
  };
}

describe("AdminReviewsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders header, summary cards, and teams", () => {
    mockedUseAdminReviews.mockReturnValue(makeHookReturn());

    render(<AdminReviewsPage />);

    expect(screen.getByText("Recognition Admin")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("13.50")).toBeInTheDocument();
    expect(screen.getByTestId("team-m1")).toBeInTheDocument();
    expect(screen.getByTestId("team-m2")).toBeInTheDocument();
  });

  test("loading state is shown", () => {
    mockedUseAdminReviews.mockReturnValue(makeHookReturn({ loading: true }));

    render(<AdminReviewsPage />);

    expect(screen.getByText(/loading reviews/i)).toBeInTheDocument();
  });

  test("error state shows retry and calls refresh", async () => {
    const hook = makeHookReturn({ error: "API down" });
    mockedUseAdminReviews.mockReturnValue(hook);
    const user = userEvent.setup();

    render(<AdminReviewsPage />);

    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    expect(screen.getByText("API down")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /retry/i }));
    expect(hook.refresh).toHaveBeenCalledTimes(1);
  });

  test("search filters teams by manager name", async () => {
    mockedUseAdminReviews.mockReturnValue(makeHookReturn());
    const user = userEvent.setup();

    render(<AdminReviewsPage />);

    await user.type(screen.getByPlaceholderText(/search team or member/i), "alice");

    expect(screen.getByTestId("team-m1")).toBeInTheDocument();
    expect(screen.queryByTestId("team-m2")).not.toBeInTheDocument();
  });

  test("search filters teams by member name", async () => {
    mockedUseAdminReviews.mockReturnValue(makeHookReturn());
    const user = userEvent.setup();

    render(<AdminReviewsPage />);

    await user.type(screen.getByPlaceholderText(/search team or member/i), "delta");

    expect(screen.queryByTestId("team-m1")).not.toBeInTheDocument();
    expect(screen.getByTestId("team-m2")).toBeInTheDocument();
  });

  test("clear button resets search", async () => {
    mockedUseAdminReviews.mockReturnValue(makeHookReturn());
    const user = userEvent.setup();

    render(<AdminReviewsPage />);

    const input = screen.getByPlaceholderText(/search team or member/i);
    await user.type(input, "alice");
    expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /clear/i }));
    expect(input).toHaveValue("");
    expect(screen.getByTestId("team-m1")).toBeInTheDocument();
    expect(screen.getByTestId("team-m2")).toBeInTheDocument();
  });

  test("toggle team expands/collapses section", async () => {
    mockedUseAdminReviews.mockReturnValue(makeHookReturn());
    const user = userEvent.setup();

    render(<AdminReviewsPage />);

    expect(screen.getByTestId("expanded-m1")).toHaveTextContent("false");

    await user.click(screen.getByRole("button", { name: "toggle-m1" }));
    expect(screen.getByTestId("expanded-m1")).toHaveTextContent("true");

    await user.click(screen.getByRole("button", { name: "toggle-m1" }));
    expect(screen.getByTestId("expanded-m1")).toHaveTextContent("false");
  });

test("refresh toolbar button calls refresh", async () => {
  const hook = makeHookReturn();
  mockedUseAdminReviews.mockReturnValue(hook);
  const user = userEvent.setup();

  const { container } = render(<AdminReviewsPage />);

  const refreshIcon = container.querySelector(".lucide-refresh-cw");
  const refreshButton = refreshIcon?.closest("button");

  expect(refreshButton).toBeTruthy();
  await user.click(refreshButton as HTMLButtonElement);

  expect(hook.refresh).toHaveBeenCalledTimes(1);
});


  test("calendar change calls setMonth and setYear", async () => {
    const hook = makeHookReturn();
    mockedUseAdminReviews.mockReturnValue(hook);
    const user = userEvent.setup();

    render(<AdminReviewsPage />);

    await user.click(screen.getByRole("button", { name: "set-calendar" }));

    expect(hook.setMonth).toHaveBeenCalledWith(5);
    expect(hook.setYear).toHaveBeenCalledWith(2028);
  });

  test("empty state appears when no managers after filtering", async () => {
    mockedUseAdminReviews.mockReturnValue(makeHookReturn());
    const user = userEvent.setup();

    render(<AdminReviewsPage />);

    await user.type(screen.getByPlaceholderText(/search team or member/i), "zzzzz");

    expect(screen.getByText(/no teams found/i)).toBeInTheDocument();
    expect(screen.getByText(/no matches for your search/i)).toBeInTheDocument();
  });
});
