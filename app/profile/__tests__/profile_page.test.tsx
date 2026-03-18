import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ProfilePage from "../page";
import { useAuth } from "@/providers/AuthProvider";
import { employeeService } from "@/services/employee-service";
import { useRouter } from "next/navigation";

// Mock the router
const mockBack = jest.fn();
jest.mock("next/navigation", () => ({
    useRouter: () => ({ back: mockBack }),
}));

// Mock useAuth
jest.mock("@/providers/AuthProvider", () => ({
    useAuth: jest.fn(),
}));

// Mock the employee service
jest.mock("@/services/employee-service", () => ({
    employeeService: {
        getEmployee: jest.fn(),
    },
}));

// Mock the child components to simplify testing
jest.mock("@/components/features/auth/ProtectedRoute", () => ({ children }: { children: React.ReactNode }) => <div data-testid="protected-route">{children}</div>);
jest.mock("@/components/features/profile/ProfileSkeleton", () => () => <div data-testid="profile-skeleton">Loading...</div>);
jest.mock("@/components/features/profile/ProfileHeader", () => () => <div data-testid="profile-header">Header</div>);
jest.mock("@/components/features/profile/ProfileStats", () => () => <div data-testid="profile-stats">Stats</div>);
jest.mock("@/components/features/profile/ProfileSections", () => () => <div data-testid="profile-sections">Sections</div>);

describe("ProfilePage Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders skeleton loader when authentication is still loading", () => {
        (useAuth as jest.Mock).mockReturnValue({
            user: null,
            isAuthenticated: false,
            loading: true,
        });

        render(<ProfilePage />);
        expect(screen.getByTestId("profile-skeleton")).toBeInTheDocument();
    });

    it("fetches and renders profile successfully for an authenticated user", async () => {
        (useAuth as jest.Mock).mockReturnValue({
            user: { employee_id: "EMP123" },
            isAuthenticated: true,
            loading: false,
        });

        const mockEmployeeData = {
            employee_id: "EMP123",
            first_name: "John",
            last_name: "Doe",
            roles: ["EMPLOYEE"],
            wallet: { balance: 100 },
        };
        (employeeService.getEmployee as jest.Mock).mockResolvedValue(mockEmployeeData);

        render(<ProfilePage />);

        // Should initially show skeleton while fetching profile
        expect(screen.getByTestId("profile-skeleton")).toBeInTheDocument();

        // Target state assertion
        await waitFor(() => {
            expect(screen.queryByTestId("profile-skeleton")).not.toBeInTheDocument();
        });

        expect(screen.getByTestId("profile-header")).toBeInTheDocument();
        expect(screen.getByTestId("profile-stats")).toBeInTheDocument();
        expect(screen.getByTestId("profile-sections")).toBeInTheDocument();
        expect(employeeService.getEmployee).toHaveBeenCalledWith("EMP123");
    });

    it("handles fetch error gracefully and shows error state", async () => {
        (useAuth as jest.Mock).mockReturnValue({
            user: { employee_id: "EMP123" },
            isAuthenticated: true,
            loading: false,
        });

        (employeeService.getEmployee as jest.Mock).mockRejectedValue(new Error("Database error"));

        render(<ProfilePage />);

        await waitFor(() => {
            expect(screen.getByText("Failed to load profile")).toBeInTheDocument();
        });
        expect(screen.getByText("Database error")).toBeInTheDocument();

        // Tests the Try Again button
        const retryBtn = screen.getByRole("button", { name: "Try Again" });
        fireEvent.click(retryBtn);
        expect(employeeService.getEmployee).toHaveBeenCalledTimes(2);
    });

    it("calls router.back when the 'Back to Dashboard' button is clicked", async () => {
        (useAuth as jest.Mock).mockReturnValue({
            user: { employee_id: "EMP123" },
            isAuthenticated: true,
            loading: false,
        });

        (employeeService.getEmployee as jest.Mock).mockResolvedValue({
            employee_id: "EMP123",
            roles: [],
        });

        render(<ProfilePage />);

        await waitFor(() => {
            expect(screen.getByText("Back to Dashboard")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Back to Dashboard"));
        expect(mockBack).toHaveBeenCalledTimes(1);
    });
});
