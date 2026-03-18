import { render, screen } from "@testing-library/react";
import DashboardPage from "../dashboard/page";
import { isAdminUser } from "@/lib/role-utils";
import React from "react";

// Mock role utilities
jest.mock("@/lib/role-utils", () => ({
    isAdminUser: jest.fn(),
}));

// Mock deep layout components 
jest.mock("@/components/layout/AdminDashboard", () => () => <div data-testid="admin-dashboard">Admin Dashboard</div>);
jest.mock("@/components/layout/UserDashboard", () => () => <div data-testid="user-dashboard">User Dashboard</div>);

describe("DashboardPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders AdminDashboard when the user has admin role privileges", async () => {
        (isAdminUser as jest.Mock).mockReturnValue(true);

        render(<DashboardPage />);

        // We await findByTestId because it checks the promise resolving null initially
        const adminDashboard = await screen.findByTestId("admin-dashboard");
        expect(adminDashboard).toBeInTheDocument();
    });

    it("renders UserDashboard when the user is not an admin", async () => {
        (isAdminUser as jest.Mock).mockReturnValue(false);

        render(<DashboardPage />);

        const userDashboard = await screen.findByTestId("user-dashboard");
        expect(userDashboard).toBeInTheDocument();
    });
});
