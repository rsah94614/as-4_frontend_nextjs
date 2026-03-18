import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

var mockEmpClient: any;
var mockOrgClient: any;
var mockShowToast = jest.fn();

jest.mock("@/lib/api-utils", () => ({
  __esModule: true,
  createAuthenticatedClient: jest.fn((base: string) => {
    if (!mockEmpClient) {
      mockEmpClient = {
        get: jest.fn(),
        put: jest.fn(),
        patch: jest.fn(),
      };
    }
    if (!mockOrgClient) {
      mockOrgClient = {
        get: jest.fn(),
      };
    }

    if (base === "/api/proxy/employees") return mockEmpClient;
    if (base === "/api/proxy/org") return mockOrgClient;
    return { get: jest.fn(), put: jest.fn(), patch: jest.fn() };
  }),
}));

jest.mock("@/components/features/admin/roles/UIHelpers", () => ({
  __esModule: true,
  useToast: jest.fn(() => ({ toasts: [], show: mockShowToast })),
  ToastContainer: () => <div data-testid="toast-container" />,
}));

jest.mock("@/services/auth-service", () => ({
  __esModule: true,
  auth: {
    getAccessToken: jest.fn(() => "fake-token"),
  },
}));

jest.mock("@/components/ui/dialog", () => ({
  __esModule: true,
  Dialog: ({ open, children }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h3>{children}</h3>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
}));

jest.mock("@radix-ui/react-visually-hidden", () => ({
  __esModule: true,
  Root: ({ children }: any) => <>{children}</>,
}));

import EmployeesPage from "@/app/(admin)/employees/page";

const employees = [
  {
    employee_id: "e1",
    username: "alice",
    email: "alice@company.com",
    designation_id: "dsg1",
    designation_name: "Engineer",
    department_id: "dep1",
    department_name: "Engineering",
    manager_id: "",
    manager_name: "",
    date_of_joining: "2024-01-15",
    date_of_birth: "1995-01-01",
    status_id: "s1",
    status_name: "Active",
    is_active: true,
    created_at: "2024-01-15T00:00:00.000Z",
  },
  {
    employee_id: "e2",
    username: "bob",
    email: "bob@company.com",
    designation_id: "dsg2",
    designation_name: "HR Executive",
    department_id: "dep2",
    department_name: "HR",
    manager_id: "e1",
    manager_name: "alice",
    date_of_joining: "2024-02-10",
    date_of_birth: "1993-02-02",
    status_id: "s2",
    status_name: "Inactive",
    is_active: false,
    created_at: "2024-02-10T00:00:00.000Z",
  },
];

const pagination = {
  current_page: 1,
  per_page: 20,
  total: 2,
  total_pages: 1,
  has_next: false,
  has_previous: false,
};

function seedSuccessApis() {
  mockOrgClient.get.mockImplementation((path: string) => {
    if (path === "/designations") {
      return Promise.resolve({
        data: [{ designation_id: "dsg1", designation_name: "Engineer" }],
      });
    }
    if (path === "/departments") {
      return Promise.resolve({
        data: [{ department_id: "dep1", department_name: "Engineering" }],
      });
    }
    return Promise.resolve({ data: [] });
  });

  mockEmpClient.get.mockResolvedValue({
    data: { data: employees, pagination },
  });
}

async function waitForEmployeeListLoaded() {
  await waitFor(() => expect(mockEmpClient.get).toHaveBeenCalled());
  await waitFor(() => {
    expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
  });
}

describe("EmployeesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    seedSuccessApis();
    (global.fetch as any) = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("renders shell and loads list data", async () => {
    render(<EmployeesPage />);

    expect(screen.getByText("Employee Management")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^employees$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /bulk import/i })).toBeInTheDocument();

    await waitForEmployeeListLoaded();

    expect(mockEmpClient.get).toHaveBeenCalledWith("/list", {
      params: { page: 1, limit: 20 },
    });
    expect(screen.getByTestId("toast-container")).toBeInTheDocument();
  });

  test("loads org metadata", async () => {
    render(<EmployeesPage />);

    await waitFor(() => expect(mockOrgClient.get).toHaveBeenCalled());
    expect(mockOrgClient.get).toHaveBeenCalledWith("/designations");
    expect(mockOrgClient.get).toHaveBeenCalledWith("/departments");
  });

  test("applies debounced search query", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(<EmployeesPage />);
    await waitForEmployeeListLoaded();

    await user.type(screen.getByPlaceholderText(/search name or email/i), "alice");

    act(() => {
      jest.advanceTimersByTime(450);
    });

    await waitFor(() => expect(mockEmpClient.get).toHaveBeenCalledTimes(2));

    const lastCall = mockEmpClient.get.mock.calls.at(-1);
    expect(lastCall?.[0]).toBe("/list");
    expect(lastCall?.[1]?.params).toEqual({
      page: 1,
      limit: 20,
      search: "alice",
    });
  });

  test("opens create dialog and validates required fields", async () => {
    const user = userEvent.setup();

    render(<EmployeesPage />);
    await waitForEmployeeListLoaded();

    await user.click(screen.getByRole("button", { name: /new employee/i }));
    expect(screen.getByText("Create New Employee")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /create employee/i }));
    expect(mockShowToast).toHaveBeenCalledWith(
      "All required fields must be filled",
      "error"
    );
  });

  test("creates employee successfully", async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    render(<EmployeesPage />);
    await waitForEmployeeListLoaded();

    await user.click(screen.getByRole("button", { name: /new employee/i }));

    await user.type(screen.getByLabelText(/username/i), "new.user");
    await user.type(screen.getByLabelText(/^email/i), "new.user@company.com");
    await user.type(screen.getByLabelText(/^password/i), "Passw0rd!");

    fireEvent.change(screen.getByLabelText(/designation/i), {
      target: { value: "dsg1" },
    });
    fireEvent.change(screen.getByLabelText(/department/i), {
      target: { value: "dep1" },
    });
    fireEvent.change(screen.getByLabelText(/date of joining/i), {
      target: { value: "2026-03-01" },
    });

    await user.click(screen.getByRole("button", { name: /create employee/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/proxy/auth/signup",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer fake-token",
        }),
      })
    );
    expect(mockShowToast).toHaveBeenCalledWith("Employee created successfully");
  });

  test("opens detail dialog and updates employee", async () => {
    const user = userEvent.setup();
    mockEmpClient.put.mockResolvedValue({});

    render(<EmployeesPage />);
    await waitForEmployeeListLoaded();

    const aliceRows = await screen.findAllByText("alice");
    await user.click(aliceRows[0]);

    expect(await screen.findByText("Employee Details")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^edit$/i }));

    const usernameInput = screen.getByLabelText(/^username/i);
    await user.clear(usernameInput);
    await user.type(usernameInput, "alice.updated");

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(mockEmpClient.put).toHaveBeenCalled());

    expect(mockEmpClient.put).toHaveBeenCalledWith(
      "/e1",
      expect.objectContaining({ username: "alice.updated" })
    );
    expect(mockShowToast).toHaveBeenCalledWith("Employee updated successfully");
  });

  test("deactivates employee", async () => {
    const user = userEvent.setup();
    mockEmpClient.patch.mockResolvedValue({});

    render(<EmployeesPage />);
    await waitForEmployeeListLoaded();

    const aliceRows = await screen.findAllByText("alice");
    await user.click(aliceRows[0]);

    await user.click(screen.getByRole("button", { name: /deactivate|off/i }));

    await waitFor(() => expect(mockEmpClient.patch).toHaveBeenCalledWith("/e1"));
    expect(mockShowToast).toHaveBeenCalledWith("Employee deactivated");
  });

  test("bulk import rejects invalid file and uploads csv", async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        total: 2,
        succeeded: 1,
        failed: 1,
        results: [
          { row: 1, username: "u1", email: "u1@x.com", status: "success", employee_id: "e10" },
          { row: 2, username: "u2", email: "u2@x.com", status: "error", error: "Invalid designation" },
        ],
      }),
    });

    render(<EmployeesPage />);

    await user.click(screen.getByRole("button", { name: /bulk import/i }));
    expect(screen.getByText("Bulk Import Employees")).toBeInTheDocument();

    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;

    const invalidFile = new File(["x"], "employees.txt", { type: "text/plain" });
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    expect(mockShowToast).toHaveBeenCalledWith(
      "Only .csv and .xlsx files are supported",
      "error"
    );

    const csvFile = new File(["username,email"], "employees.csv", { type: "text/csv" });
    fireEvent.change(fileInput, { target: { files: [csvFile] } });

    await user.click(screen.getByRole("button", { name: /import employees/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(await screen.findByText("Import Results")).toBeInTheDocument();
  });
});