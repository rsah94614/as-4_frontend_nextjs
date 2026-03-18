import { render, screen } from "@testing-library/react";
import NotificationsPage from "../notifications/page";

// Mocks the notifications hooks
jest.mock("@/hooks/useNotifications", () => ({
    useNotifications: () => ({
        notifications: [],
        loading: false,
        error: null,
        total: 0,
        unreadCount: 0,
        handleMarkRead: jest.fn(),
        handleMarkAllRead: jest.fn(),
        handleRefresh: jest.fn(),
    }),
}));

// Provide partial mocks for role-utils to handle CAN_POST_ANNOUNCEMENT checks
jest.mock("@/lib/role-utils", () => ({
    getRolesFromToken: () => ["EMPLOYEE"],
    ADMIN_ROLES: new Set(["SUPER_ADMIN", "HR_ADMIN"]),
}));

describe("NotificationsPage", () => {
    it("renders gracefully even with default un-configured hooks", () => {
        // The page structure might depend on roles, but as a base test it should not crash.
        render(<NotificationsPage />);
        // Just a basic sanity test that it builds correctly, as it's a very large component.
        expect(screen.getByText(/All caught up/i)).toBeInTheDocument();
    });
});
