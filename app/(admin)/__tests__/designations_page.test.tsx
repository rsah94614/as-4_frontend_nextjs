import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import DesignationsPage from "@/app/(admin)/designations/page";
import { useDesignations } from "@/hooks/useDesignations";

jest.mock("@/hooks/useDesignations");

jest.mock("@/components/features/admin/designations/DesignationStats", () => ({
  __esModule: true,
  DesignationStats: ({ total, active, avgLevel }: any) => (
    <div data-testid="designation-stats">
      total:{total}|active:{active}|avg:{String(avgLevel)}
    </div>
  ),
}));

jest.mock("@/components/features/admin/designations/DesignationTable", () => ({
  __esModule: true,
  DesignationTable: ({ designations, loading, pagination, onPageChange, onEdit }: any) => (
    <div data-testid="designation-table">
      <div data-testid="table-loading">{String(loading)}</div>
      <div data-testid="table-count">{designations.length}</div>
      <div data-testid="table-page">{pagination?.current_page ?? "none"}</div>
      <button onClick={() => onPageChange(2)}>go-page-2</button>
      <button onClick={() => designations[0] && onEdit(designations[0])}>edit-first</button>
    </div>
  ),
}));

jest.mock("@/components/features/admin/designations/DesignationModal", () => ({
  __esModule: true,
  DesignationModal: ({ open, selectedDesignation, onClose, onSuccess }: any) => (
    <div data-testid="designation-modal">
      <div data-testid="modal-open">{String(open)}</div>
      <div data-testid="modal-selected">
        {selectedDesignation ? selectedDesignation.designation_id : "none"}
      </div>
      <button onClick={onClose}>close-modal</button>
      <button onClick={onSuccess}>modal-success</button>
    </div>
  ),
}));

const mockedUseDesignations = useDesignations as jest.Mock;

const baseDesignations = [
  {
    designation_id: "z1",
    designation_name: "Engineer",
    designation_code: "ENG-1",
    level: 2,
    is_active: true,
    created_at: "2026-03-01T00:00:00.000Z",
  },
  {
    designation_id: "z2",
    designation_name: "Senior Engineer",
    designation_code: "ENG-2",
    level: 4,
    is_active: true,
    created_at: "2026-03-02T00:00:00.000Z",
  },
  {
    designation_id: "z3",
    designation_name: "HR Executive",
    designation_code: "HR-1",
    level: 1,
    is_active: false,
    created_at: "2026-03-03T00:00:00.000Z",
  },
];

function makeHookReturn(overrides: Partial<any> = {}) {
  return {
    designations: baseDesignations,
    pagination: {
      current_page: 1,
      per_page: 5,
      total: 30,
      total_pages: 6,
      has_next: true,
      has_previous: false,
    },
    loading: false,
    error: null,
    page: 1,
    setPage: jest.fn(),
    search: "",
    setSearch: jest.fn(),
    refresh: jest.fn(),
    ...overrides,
  };
}

describe("DesignationsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders heading, stats, table, and modal shell", () => {
    mockedUseDesignations.mockReturnValue(makeHookReturn());

    render(<DesignationsPage />);

    expect(screen.getByText("Designations")).toBeInTheDocument();
    expect(screen.getByTestId("designation-stats")).toHaveTextContent(
      "total:30|active:2|avg:2.3"
    );
    expect(screen.getByTestId("table-count")).toHaveTextContent("3");
    expect(screen.getByTestId("modal-open")).toHaveTextContent("false");
    expect(screen.getByTestId("modal-selected")).toHaveTextContent("none");
  });

  test("falls back total count to designation length when pagination is null", () => {
    mockedUseDesignations.mockReturnValue(makeHookReturn({ pagination: null }));

    render(<DesignationsPage />);

    expect(screen.getByTestId("designation-stats")).toHaveTextContent("total:3|active:2|avg:2.3");
  });

  test("shows '-' avg level when designation list is empty", () => {
    mockedUseDesignations.mockReturnValue(
      makeHookReturn({ designations: [], pagination: null })
    );

    render(<DesignationsPage />);

    expect(screen.getByTestId("designation-stats")).toHaveTextContent("avg:-");
    expect(screen.getByTestId("table-count")).toHaveTextContent("0");
  });

  test("shows error banner when hook returns error", () => {
    mockedUseDesignations.mockReturnValue(
      makeHookReturn({ error: "Failed to load designations." })
    );

    render(<DesignationsPage />);

    expect(screen.getByText("Failed to load designations.")).toBeInTheDocument();
  });

  test("search button calls setSearch and resets page", async () => {
    const hook = makeHookReturn();
    mockedUseDesignations.mockReturnValue(hook);
    const user = userEvent.setup();

    render(<DesignationsPage />);

    await user.type(screen.getByPlaceholderText("Search by name or code..."), "eng");
    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(hook.setSearch).toHaveBeenCalledWith("eng");
    expect(hook.setPage).toHaveBeenCalledWith(1);
  });

  test("pressing Enter in search input triggers search", async () => {
    const hook = makeHookReturn();
    mockedUseDesignations.mockReturnValue(hook);
    const user = userEvent.setup();

    render(<DesignationsPage />);

    await user.type(screen.getByPlaceholderText("Search by name or code..."), "hr{enter}");

    expect(hook.setSearch).toHaveBeenCalledWith("hr");
    expect(hook.setPage).toHaveBeenCalledWith(1);
  });

  test("clear button appears when search is active and clears it", async () => {
    const hook = makeHookReturn({ search: "eng" });
    mockedUseDesignations.mockReturnValue(hook);
    const user = userEvent.setup();

    render(<DesignationsPage />);

    await user.click(screen.getByRole("button", { name: /clear/i }));

    expect(hook.setSearch).toHaveBeenCalledWith("");
    expect(hook.setPage).toHaveBeenCalledWith(1);
  });

  test("passes filtered list to table when search exists", () => {
    mockedUseDesignations.mockReturnValue(makeHookReturn({ search: "eng" }));

    render(<DesignationsPage />);

    expect(screen.getByTestId("table-count")).toHaveTextContent("2");
  });

  test("refresh button calls refresh callback", async () => {
    const hook = makeHookReturn();
    mockedUseDesignations.mockReturnValue(hook);
    const user = userEvent.setup();

    render(<DesignationsPage />);

    const buttons = screen.getAllByRole("button");
    await user.click(buttons[2]); // Add, Search, Refresh

    expect(hook.refresh).toHaveBeenCalledTimes(1);
  });

  test("table pagination callback calls setPage", async () => {
    const hook = makeHookReturn();
    mockedUseDesignations.mockReturnValue(hook);
    const user = userEvent.setup();

    render(<DesignationsPage />);

    await user.click(screen.getByRole("button", { name: "go-page-2" }));

    expect(hook.setPage).toHaveBeenCalledWith(2);
  });

  test("clicking Add Designation opens modal in create mode", async () => {
    mockedUseDesignations.mockReturnValue(makeHookReturn());
    const user = userEvent.setup();

    render(<DesignationsPage />);

    await user.click(screen.getByRole("button", { name: /add designation/i }));

    expect(screen.getByTestId("modal-open")).toHaveTextContent("true");
    expect(screen.getByTestId("modal-selected")).toHaveTextContent("none");
  });

  test("edit action opens modal in edit mode with selected designation", async () => {
    mockedUseDesignations.mockReturnValue(makeHookReturn());
    const user = userEvent.setup();

    render(<DesignationsPage />);

    await user.click(screen.getByRole("button", { name: "edit-first" }));

    expect(screen.getByTestId("modal-open")).toHaveTextContent("true");
    expect(screen.getByTestId("modal-selected")).toHaveTextContent("z1");
  });

  test("modal success calls refresh callback", async () => {
    const hook = makeHookReturn();
    mockedUseDesignations.mockReturnValue(hook);
    const user = userEvent.setup();

    render(<DesignationsPage />);

    await user.click(screen.getByRole("button", { name: "modal-success" }));

    expect(hook.refresh).toHaveBeenCalledTimes(1);
  });

  test("modal close sets open to false", async () => {
    mockedUseDesignations.mockReturnValue(makeHookReturn());
    const user = userEvent.setup();

    render(<DesignationsPage />);

    await user.click(screen.getByRole("button", { name: /add designation/i }));
    expect(screen.getByTestId("modal-open")).toHaveTextContent("true");

    await user.click(screen.getByRole("button", { name: "close-modal" }));
    expect(screen.getByTestId("modal-open")).toHaveTextContent("false");
  });
});
