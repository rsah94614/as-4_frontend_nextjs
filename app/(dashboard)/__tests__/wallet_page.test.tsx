import { render, screen, waitFor } from "@testing-library/react";
import WalletPage from "../wallet/page";
import { auth } from "@/services/auth-service";

jest.mock("@/services/auth-service", () => ({
    auth: { getUser: jest.fn() },
}));

const mockGet = jest.fn();

// Mock our custom axios-compliant wrapper HTTP Client
jest.mock("@/lib/api-utils", () => ({
    createAuthenticatedClient: () => ({
        get: (...args: any[]) => mockGet(...args),
    }),
}));

// Mock Link from NextJS router
jest.mock("next/link", () => ({ children, href }: any) => <a href={href}>{children}</a>);

describe("WalletPage Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it("renders unauthenticated message when user is not logged in", async () => {
        (auth.getUser as jest.Mock).mockReturnValue(null);
        render(<WalletPage />);

        await waitFor(() => {
            expect(screen.getByText("Not authenticated. Please log in.")).toBeInTheDocument();
        });
    });

    it("renders wallet page successfully dispatching all layout sections", async () => {
        (auth.getUser as jest.Mock).mockReturnValue({ employee_id: "EMP1" });

        // Intercept client HTTP Calls to match component expected data payloads
        mockGet.mockImplementation((url: string) => {
            if (url.includes("/employees/")) {
                return Promise.resolve({
                    data: {
                        wallet_id: "W1",
                        available_points: 4000,
                        redeemed_points: 1000,
                        total_earned_points: 5000,
                    },
                });
            }
            if (url.includes("/points-summary")) {
                return Promise.resolve({
                    data: { points_this_month: 200, points_this_year: 5000 },
                });
            }
            if (url.includes("/transactions")) {
                return Promise.resolve({
                    data: { total: 0, transactions: [] },
                });
            }
            return Promise.resolve({ data: {} });
        });

        render(<WalletPage />);

        // Fast-forward useCountUp function timers
        jest.runAllTimers();

        await waitFor(() => {
            expect(screen.getByText("Points Balance")).toBeInTheDocument();
        });

        // Validates numerical formatted counter from useCountUp correctly applies
        expect(await screen.findByText("4,000")).toBeInTheDocument();
        expect(screen.getByText("Period Summary")).toBeInTheDocument();

        expect(mockGet).toHaveBeenCalledTimes(3);
    });

    it("renders error correctly when fail to fetch wallet", async () => {
        (auth.getUser as jest.Mock).mockReturnValue({ employee_id: "EMP1" });

        // Yield HTTP Network Rejection
        mockGet.mockRejectedValue(new Error("Network Error"));

        render(<WalletPage />);

        await waitFor(() => {
            expect(screen.getByText("Network Error")).toBeInTheDocument();
        });
    });
});
