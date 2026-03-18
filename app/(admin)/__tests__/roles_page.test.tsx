import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import RolesPage from "@/app/(admin)/roles/page";
import { useToast } from "@/components/features/admin/roles/UIHelpers";

jest.mock("@/components/features/admin/roles/UIHelpers", () => ({
  __esModule: true,
  useToast: jest.fn(),
  ToastContainer: ({ toasts }: any) => (
    <div data-testid="toast-container">toasts:{toasts?.length ?? 0}</div>
  ),
}));

jest.mock("@/components/features/admin/roles/RolesSection", () => ({
  __esModule: true,
  RolesSection: ({ toast }: any) => (
    <div data-testid="roles-section">
      <button onClick={() => toast("roles-toast")}>roles-toast</button>
    </div>
  ),
}));

jest.mock("@/components/features/admin/roles/AssignmentsSection", () => ({
  __esModule: true,
  AssignmentsSection: ({ toast }: any) => (
    <div data-testid="assignments-section">
      <button onClick={() => toast("assignments-toast")}>assignments-toast</button>
    </div>
  ),
}));

jest.mock("@/components/features/admin/roles/RoutePermissionsSection", () => ({
  __esModule: true,
  RoutePermissionsSection: ({ toast }: any) => (
    <div data-testid="permissions-section">
      <button onClick={() => toast("permissions-toast")}>permissions-toast</button>
    </div>
  ),
}));

const mockedUseToast = useToast as jest.Mock;

describe("RolesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseToast.mockReturnValue({
      toasts: [{ id: "1", message: "ok", type: "success" }],
      show: jest.fn(),
    });
  });

  test("renders header and default Roles tab", () => {
    render(<RolesPage />);

    expect(
      screen.getByRole("heading", { name: /roles & permissions/i })
    ).toBeInTheDocument();

    expect(screen.getByTestId("roles-section")).toBeInTheDocument();
    expect(screen.queryByTestId("assignments-section")).not.toBeInTheDocument();
    expect(screen.queryByTestId("permissions-section")).not.toBeInTheDocument();

    expect(screen.getByTestId("toast-container")).toHaveTextContent("toasts:1");
  });

  test("switches to Assignments tab", async () => {
    const user = userEvent.setup();
    render(<RolesPage />);

    await user.click(screen.getByRole("button", { name: /assignments/i }));

    expect(screen.queryByTestId("roles-section")).not.toBeInTheDocument();
    expect(screen.getByTestId("assignments-section")).toBeInTheDocument();
    expect(screen.queryByTestId("permissions-section")).not.toBeInTheDocument();
  });

  test("switches to Route Permissions tab", async () => {
    const user = userEvent.setup();
    render(<RolesPage />);

    await user.click(screen.getByRole("button", { name: /route permissions/i }));

    expect(screen.queryByTestId("roles-section")).not.toBeInTheDocument();
    expect(screen.queryByTestId("assignments-section")).not.toBeInTheDocument();
    expect(screen.getByTestId("permissions-section")).toBeInTheDocument();
  });

  test("passes toast callback to all sections", async () => {
    const user = userEvent.setup();
    const show = jest.fn();
    mockedUseToast.mockReturnValue({ toasts: [], show });

    render(<RolesPage />);

    await user.click(screen.getByRole("button", { name: "roles-toast" }));
    expect(show).toHaveBeenCalledWith("roles-toast");

    await user.click(screen.getByRole("button", { name: /assignments/i }));
    await user.click(screen.getByRole("button", { name: "assignments-toast" }));
    expect(show).toHaveBeenCalledWith("assignments-toast");

    await user.click(screen.getByRole("button", { name: /route permissions/i }));
    await user.click(screen.getByRole("button", { name: "permissions-toast" }));
    expect(show).toHaveBeenCalledWith("permissions-toast");
  });
});
