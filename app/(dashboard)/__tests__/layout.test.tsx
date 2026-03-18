import { render, screen } from "@testing-library/react";
import DashboardLayout from "../layout";

// Mock child components to verify composition
jest.mock("@/components/layout/Sidebar", () => () => <div data-testid="sidebar">Sidebar</div>);
jest.mock("@/components/layout/Navbar", () => () => <div data-testid="navbar">Navbar</div>);
jest.mock("@/components/features/auth/ProtectedRoute", () => ({ children }: { children: React.ReactNode }) => <div data-testid="protected">{children}</div>);

describe("DashboardLayout", () => {
    it("renders its layout appropriately", () => {
        render(
            <DashboardLayout>
                <div data-testid="child">Test Child</div>
            </DashboardLayout>
        );

        expect(screen.getByTestId("protected")).toBeInTheDocument();
        expect(screen.getByTestId("sidebar")).toBeInTheDocument();
        expect(screen.getByTestId("navbar")).toBeInTheDocument();
        expect(screen.getByTestId("child")).toBeInTheDocument();
    });
});
