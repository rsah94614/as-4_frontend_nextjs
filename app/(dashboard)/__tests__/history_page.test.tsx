import { render, screen } from "@testing-library/react";
import HistoryPage from "../history/page";
import { useHistoryData } from "@/hooks/useHistoryData";

// Mock the custom hook
jest.mock("@/hooks/useHistoryData", () => ({
    useHistoryData: jest.fn(),
}));

// Mock its descendant feature components 
jest.mock("@/components/features/history/HistoryFilterBar", () => () => <div data-testid="history-filter-bar" />);
jest.mock("@/components/features/history/HistoryList", () => () => <div data-testid="history-list" />);
jest.mock("@/components/features/history/HistoryPagination", () => () => <div data-testid="history-pagination" />);
jest.mock("@/components/features/history/TransactionDetailModal", () => () => <div data-testid="transaction-detail-modal" />);

describe("HistoryPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the history page elements with functional data provided by the hook", () => {
        (useHistoryData as jest.Mock).mockReturnValue({
            selectedPeriod: "30_days",
            setSelectedPeriod: jest.fn(),
            selectedType: "all",
            setSelectedType: jest.fn(),
            clearFilters: jest.fn(),
            allHistory: [{}],
            filteredHistory: [{}],
            loading: false,
            error: null,
            retry: jest.fn(),
            page: 1,
            setPage: jest.fn(),
            totalPages: 10,
        });

        render(<HistoryPage />);

        expect(screen.getByText("History")).toBeInTheDocument();
        expect(screen.getByTestId("history-filter-bar")).toBeInTheDocument();
        expect(screen.getByTestId("history-list")).toBeInTheDocument();
        expect(screen.getByTestId("history-pagination")).toBeInTheDocument();
        expect(screen.getByTestId("transaction-detail-modal")).toBeInTheDocument();
    });

    it("does not render pagination when history data is in fetching state", () => {
        (useHistoryData as jest.Mock).mockReturnValue({
            selectedPeriod: "30_days",
            setSelectedPeriod: jest.fn(),
            selectedType: "all",
            setSelectedType: jest.fn(),
            clearFilters: jest.fn(),
            allHistory: [],
            filteredHistory: [],
            loading: true, // Data fetching simulated
            error: null,
            retry: jest.fn(),
            page: 1,
            setPage: jest.fn(),
            totalPages: 1,
        });

        render(<HistoryPage />);

        expect(screen.queryByTestId("history-pagination")).not.toBeInTheDocument();
    });
});
