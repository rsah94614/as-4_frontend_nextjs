import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import DepartmentsPage from "@/app/(admin)/departments/page";
import { useDepartments } from "@/hooks/useDepartments";

jest.mock("@/hooks/useDepartments");

jest.mock("@/components/features/admin/departments/DepartmentStats", () => ({
  __esModule: true,
  DepartmentStats: ({ total, active, types }: any) => (
    <div data-testid="department-stats">
      total:{total}|active:{active}|types:{types}
    </div>
  ),
}));

jest.mock("@/components/features/admin/departments/DepartmentTable", () => ({
  __esModule: true,
  DepartmentTable: ({ departments, loading, pagination, onPageChange, onEdit }: any) => (
    <div data-testid="department-table">
      <div data-testid="table-loading">{String(loading)}</div>
      <div data-testid="table-count">{departments.length}</div>
      <div data-testid="table-page">{pagination?.current_page ?? "none"}</div>
      <button onClick={() => onPageChange(2)}>go-page-2</button>
      <button onClick={() => departments[0] && onEdit(departments[0])}>edit-first</button>
    </div>
  ),
}));

jest.mock("@/components/features/admin/departments/DepartmentModal", () => ({
  __esModule: true,
  DepartmentModal: ({ open, selectedDepartment, onClose, onSuccess, departmentTypes }: any) => (
    <div data-testid="department-modal">
      <div data-testid="modal-open">{String(open)}</div>
      <div data-testid="modal-selected">
        {selectedDepartment ? selectedDepartment.department_id : "none"}
      </div>
      <div data-testid="modal-types">{departmentTypes.length}</div>
      <button onClick={onClose}>close-modal</button>
      <button onClick={onSuccess}>modal-success</button>
    </div>
  ),
}));

const mockedUseDepartments = useDepartments as jest.Mock;

const baseDepartments = [
  {
    department_id: "d1",
    department_name: "Engineering",
    department_code: "ENG",
    department_type: { type_name: "Core", type_code: "CORE" },
    manager: { employee_id: "e1", username: "alice" },
    is_active: true,
    created_at: "2026-03-10T00:00:00.000Z",
  },
  {
    department_id: "d2",
    department_name: "HR",
    department_code: "HR",
    department_type: { type_name: "Support", type_code: "SUP" },
    manager: null,
    is_active: false,
    created_at: "2026-03-11T00:00:00.000Z",
  },
];

function makeHookReturn(overrides: Partial<any> = {}) {
  return {
    departments: baseDepartments,
    pagination: {
      current_page: 1,
      per_page: 5,
      total: 20,
      total_pages: 4,
      has_next: true,
      has_previous: false,
    },
    departmentTypes: [
      { department_type_id: "t1", type_name: "Core", type_code: "CORE" },
      { department_type_id: "t2", type_name: "Support", type_code: "SUP" },
    ],
    loading: false,
    error: null,
    setPage: jest.fn(),
    search: "",
    setSearch: jest.fn(),
    refresh: jest.fn(),
    ...overrides,
  };
}

describe("DepartmentsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders heading, stats, table, and modal shell", () => {
    mockedUseDepartments.mockReturnValue(makeHookReturn());

    render(<DepartmentsPage />);

    expect(screen.getByText("Departments")).toBeInTheDocument();
    expect(screen.getByTestId("department-stats")).toHaveTextContent(
      "total:20|active:1|types:2"
    );
    expect(screen.getByTestId("table-loading")).toHaveTextContent("false");
    expect(screen.getByTestId("table-count")).toHaveTextContent("2");
    expect(screen.getByTestId("modal-open")).toHaveTextContent("false");
    expect(screen.getByTestId("modal-selected")).toHaveTextContent("none");
  });

  test("falls back stats total to departments length when pagination is null", () => {
    mockedUseDepartments.mockReturnValue(makeHookReturn({ pagination: null }));

    render(<DepartmentsPage />);

    expect(screen.getByTestId("department-stats")).toHaveTextContent("total:2|active:1|types:2");
  });

  test("shows error banner when hook returns error", () => {
    mockedUseDepartments.mockReturnValue(
      makeHookReturn({ error: "Failed to load departments." })
    );

    render(<DepartmentsPage />);

    expect(screen.getByText("Failed to load departments.")).toBeInTheDocument();
  });

  test("search button calls setSearch with input value and resets page", async () => {
    const hook = makeHookReturn();
    mockedUseDepartments.mockReturnValue(hook);
    const user = userEvent.setup();

    render(<DepartmentsPage />);

    await user.type(screen.getByPlaceholderText("Search by name or code..."), "ENG");
    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(hook.setSearch).toHaveBeenCalledWith("ENG");
    expect(hook.setPage).toHaveBeenCalledWith(1);
  });

  test("pressing Enter in search input triggers search", async () => {
    const hook = makeHookReturn();
    mockedUseDepartments.mockReturnValue(hook);
    const user = userEvent.setup();

    render(<DepartmentsPage />);

    const input = screen.getByPlaceholderText("Search by name or code...");
    await user.type(input, "HR{enter}");

    expect(hook.setSearch).toHaveBeenCalledWith("HR");
    expect(hook.setPage).toHaveBeenCalledWith(1);
  });

  test("clear button appears when search is active and clears search", async () => {
    const hook = makeHookReturn({ search: "ENG" });
    mockedUseDepartments.mockReturnValue(hook);
    const user = userEvent.setup();

    render(<DepartmentsPage />);

    expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /clear/i }));

    expect(hook.setSearch).toHaveBeenCalledWith("");
    expect(hook.setPage).toHaveBeenCalledWith(1);
  });

  test("refresh button calls refresh from hook", async () => {
    const hook = makeHookReturn();
    mockedUseDepartments.mockReturnValue(hook);
    const user = userEvent.setup();

    render(<DepartmentsPage />);

    await user.click(screen.getByTitle("Refresh"));

    expect(hook.refresh).toHaveBeenCalledTimes(1);
  });

  test("table pagination callback calls setPage", async () => {
    const hook = makeHookReturn();
    mockedUseDepartments.mockReturnValue(hook);
    const user = userEvent.setup();

    render(<DepartmentsPage />);

    await user.click(screen.getByRole("button", { name: "go-page-2" }));

    expect(hook.setPage).toHaveBeenCalledWith(2);
  });

  test("clicking Add Department opens modal in create mode", async () => {
    mockedUseDepartments.mockReturnValue(makeHookReturn());
    const user = userEvent.setup();

    render(<DepartmentsPage />);

    await user.click(screen.getByRole("button", { name: /add department/i }));

    expect(screen.getByTestId("modal-open")).toHaveTextContent("true");
    expect(screen.getByTestId("modal-selected")).toHaveTextContent("none");
  });

  test("edit action opens modal with selected department", async () => {
    mockedUseDepartments.mockReturnValue(makeHookReturn());
    const user = userEvent.setup();

    render(<DepartmentsPage />);

    await user.click(screen.getByRole("button", { name: "edit-first" }));

    expect(screen.getByTestId("modal-open")).toHaveTextContent("true");
    expect(screen.getByTestId("modal-selected")).toHaveTextContent("d1");
  });

  test("modal success triggers refresh callback", async () => {
    const hook = makeHookReturn();
    mockedUseDepartments.mockReturnValue(hook);
    const user = userEvent.setup();

    render(<DepartmentsPage />);

    await user.click(screen.getByRole("button", { name: "modal-success" }));

    expect(hook.refresh).toHaveBeenCalledTimes(1);
  });

  test("modal close toggles modal back to closed", async () => {
    mockedUseDepartments.mockReturnValue(makeHookReturn());
    const user = userEvent.setup();

    render(<DepartmentsPage />);

    await user.click(screen.getByRole("button", { name: /add department/i }));
    expect(screen.getByTestId("modal-open")).toHaveTextContent("true");

    await user.click(screen.getByRole("button", { name: "close-modal" }));
    expect(screen.getByTestId("modal-open")).toHaveTextContent("false");
  });
});
