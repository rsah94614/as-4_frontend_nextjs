import { render, screen, fireEvent } from "@testing-library/react";
import DevLoggerPage from "../page";
import { useLoggerStore } from "@/lib/logger-store";
import { useRouter } from "next/navigation";

// Mock SuperdevGuard so it doesn't try to redirect during tests
jest.mock("@/components/features/SuperdevGuard", () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <div data-testid="superdev-guard">{children}</div>,
}));

// Mock Next router
const mockBack = jest.fn();
jest.mock("next/navigation", () => ({
    useRouter: () => ({
        back: mockBack,
    }),
}));

// Mock the Zustand store hook
jest.mock("@/lib/logger-store", () => ({
    useLoggerStore: jest.fn(),
}));

describe("DevLoggerPage", () => {
    let mockState: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockState = {
            logs: [],
            filters: { method: "ALL", status: "ALL", hideNotifications: false, urlSearch: "" },
            setFilter: jest.fn(),
            clearLogs: jest.fn(),
            getFilteredLogs: jest.fn().mockReturnValue([]),
        };

        (useLoggerStore as unknown as jest.Mock).mockImplementation((selector: any) => selector(mockState));
    });

    it("renders the page and empty state when there are no logs", () => {
        render(<DevLoggerPage />);

        expect(screen.getByTestId("superdev-guard")).toBeInTheDocument();
        expect(screen.getByText("Developer Logger")).toBeInTheDocument();
        expect(screen.getByText("No API logs yet")).toBeInTheDocument();
    });

    it("renders log cards when filtered logs are present", () => {
        const mockLog = {
            id: "log1",
            method: "GET",
            status: 200,
            url: "https://api.example.com/test",
            timestamp: new Date().getTime(),
            duration: 150,
            requestHeaders: {},
            requestBody: null,
            requestParams: {},
            responseHeaders: {},
            responseData: { success: true },
            error: null,
        };

        mockState.logs = [mockLog];
        mockState.getFilteredLogs.mockReturnValue([mockLog]);

        render(<DevLoggerPage />);

        expect(screen.getAllByText("GET").length).toBeGreaterThan(0);
        expect(screen.getByText("200")).toBeInTheDocument();
        expect(screen.getByText("/test")).toBeInTheDocument();
        expect(screen.getByText("1 / 1 logs")).toBeInTheDocument();
    });

    it("can trigger log clear", () => {
        const mockLog = {
            id: "log1",
            method: "GET",
            status: 200,
            url: "https://api.example.com",
            timestamp: new Date().getTime(),
            duration: 100,
            requestHeaders: {},
            requestBody: null,
            requestParams: {},
            responseHeaders: {},
            responseData: {},
            error: null,
        };

        mockState.logs = [mockLog];
        mockState.getFilteredLogs.mockReturnValue([mockLog]);

        render(<DevLoggerPage />);

        const clearBtn = screen.getByText("Clear All");
        expect(clearBtn).not.toBeDisabled();

        fireEvent.click(clearBtn);
        expect(mockState.clearLogs).toHaveBeenCalledTimes(1);
    });

    it("calls router.back when the close button is clicked", () => {
        render(<DevLoggerPage />);

        const closeBtn = screen.getByTitle("Go back");
        fireEvent.click(closeBtn);

        expect(mockBack).toHaveBeenCalledTimes(1);
    });
});
