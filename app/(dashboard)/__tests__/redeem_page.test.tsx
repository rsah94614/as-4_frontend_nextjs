import { render, screen } from "@testing-library/react";
import RedeemPage from "../redeem/page";
import { useRedeem } from "@/hooks/useRedeem";

// Mock custom hook
jest.mock("@/hooks/useRedeem", () => ({
    useRedeem: jest.fn(),
}));

// Mock child components bypassing next/dynamic
jest.mock("@/components/features/redeem/WalletBanner", () => () => <div data-testid="wallet-banner" />);
jest.mock("@/components/features/redeem/RewardCard", () => () => <div data-testid="reward-card" />);
jest.mock("next/dynamic", () => () => {
    const DynamicDialog = () => <div data-testid="redeem-dialog" />;
    return DynamicDialog;
});

describe("RedeemPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders an error message when error exists", () => {
        (useRedeem as jest.Mock).mockReturnValue({
            error: "Failed to fetch redeem items",
            loading: false,
        });

        render(<RedeemPage />);
        expect(screen.getByText("Failed to fetch redeem items")).toBeInTheDocument();
    });

    it("renders a skeleton fallback layout while data is fetching", () => {
        (useRedeem as jest.Mock).mockReturnValue({
            error: null,
            loading: true,
        });

        const { container } = render(<RedeemPage />);
        expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    });

    it("renders the main storefront elements mapped off valid fetches", () => {
        (useRedeem as jest.Mock).mockReturnValue({
            error: null,
            loading: false,
            wallet: { available_points: 1500 },
            categories: [{ category_id: "CAT1", category_name: "Electronics" }],
            productItems: [{ catalog_id: "P1", default_points: 500 }],
            activeCategory: "ALL",
            setActiveCategory: jest.fn(),
            openRedeem: jest.fn(),
            dialogOpen: false,
            closeDialog: jest.fn(),
            handleSuccess: jest.fn(),
            pagination: { total_pages: 1, total: 1, has_previous: false, has_next: false },
            currentPage: 1,
            goToPage: jest.fn(),
            availablePoints: 1500,
        });

        render(<RedeemPage />);

        expect(screen.getByTestId("wallet-banner")).toBeInTheDocument();

        // Validates if mapped categories are successfully surfaced
        expect(screen.getByText("Electronics")).toBeInTheDocument();

        expect(screen.getByText("Products")).toBeInTheDocument();
        expect(screen.getByText("1 items")).toBeInTheDocument();

        expect(screen.getByTestId("reward-card")).toBeInTheDocument();
        expect(screen.getByTestId("redeem-dialog")).toBeInTheDocument();
    });
});
