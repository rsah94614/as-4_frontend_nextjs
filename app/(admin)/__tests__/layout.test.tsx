import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminLayout from "@/app/(admin)/layout";

jest.mock("@/components/features/auth/ProtectedRoute", () => ({
  __esModule: true,
  default: ({
    children,
    adminOnly,
  }: {
    children: React.ReactNode;
    adminOnly?: boolean;
  }) => (
    <div data-testid="protected-route" data-admin-only={String(!!adminOnly)}>
      {children}
    </div>
  ),
}));

jest.mock("@/components/layout/Sidebar", () => ({
  __esModule: true,
  default: ({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) => (
    <div>
      <div data-testid="sidebar-state">{isOpen ? "open" : "closed"}</div>
      <button onClick={onClose}>close-sidebar</button>
    </div>
  ),
}));

jest.mock("@/components/layout/Navbar", () => ({
  __esModule: true,
  default: ({ onMenuClick }: { onMenuClick: () => void }) => (
    <button onClick={onMenuClick}>open-menu</button>
  ),
}));

describe("AdminLayout", () => {
  it("renders children", () => {
    render(
      <AdminLayout>
        <div>Admin Content</div>
      </AdminLayout>
    );

    expect(screen.getByText("Admin Content")).toBeInTheDocument();
  });

  it("wraps content with ProtectedRoute and passes adminOnly", () => {
    render(
      <AdminLayout>
        <div>Admin Content</div>
      </AdminLayout>
    );

    const wrapper = screen.getByTestId("protected-route");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveAttribute("data-admin-only", "true");
  });

  it("starts with sidebar closed", () => {
    render(
      <AdminLayout>
        <div>Admin Content</div>
      </AdminLayout>
    );

    expect(screen.getByTestId("sidebar-state")).toHaveTextContent("closed");
  });

  it("opens sidebar when menu button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <AdminLayout>
        <div>Admin Content</div>
      </AdminLayout>
    );

    await user.click(screen.getByRole("button", { name: "open-menu" }));

    expect(screen.getByTestId("sidebar-state")).toHaveTextContent("open");
  });

  it("closes sidebar when close button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <AdminLayout>
        <div>Admin Content</div>
      </AdminLayout>
    );

    await user.click(screen.getByRole("button", { name: "open-menu" }));
    expect(screen.getByTestId("sidebar-state")).toHaveTextContent("open");

    await user.click(screen.getByRole("button", { name: "close-sidebar" }));
    expect(screen.getByTestId("sidebar-state")).toHaveTextContent("closed");
  });
});
