import { act, renderHook, waitFor } from "@testing-library/react";
import { useRedeem } from "@/hooks/useRedeem";
import { auth } from "@/services/auth-service";
import { fetchCatalog, fetchCategories, fetchWallet } from "@/services/rewards-service";
import type { RewardItem } from "@/types/redeem-types";

jest.mock("@/services/auth-service", () => ({
  __esModule: true,
  auth: {
    getUser: jest.fn(),
  },
}));

jest.mock("@/services/rewards-service", () => ({
  __esModule: true,
  fetchCatalog: jest.fn(),
  fetchCategories: jest.fn(),
  fetchWallet: jest.fn(),
}));

const mockedAuth = auth as jest.Mocked<typeof auth>;
const mockedFetchCatalog = fetchCatalog as jest.MockedFunction<typeof fetchCatalog>;
const mockedFetchCategories = fetchCategories as jest.MockedFunction<typeof fetchCategories>;
const mockedFetchWallet = fetchWallet as jest.MockedFunction<typeof fetchWallet>;

function makeItem(overrides: Partial<RewardItem>): RewardItem {
  return {
    catalog_id: "cat-1",
    reward_name: "Coffee Gift",
    reward_code: "COFFEE",
    description: null,
    default_points: 100,
    min_points: 50,
    max_points: 200,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    stock_status: "In Stock",
    available_stock: 12,
    category: {
      category_id: "c-1",
      category_name: "General",
      category_code: "GENERAL",
    },
    ...overrides,
  };
}

describe("useRedeem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAuth.getUser.mockReturnValue({ employee_id: "emp-1" } as any);
    mockedFetchCatalog.mockResolvedValue({
      data: [makeItem({ catalog_id: "cat-1" })],
      pagination: {
        current_page: 1,
        per_page: 20,
        total: 1,
        total_pages: 1,
        has_next: false,
        has_previous: false,
      },
    });
    mockedFetchCategories.mockResolvedValue([
      { category_id: "c-1", category_name: "General", category_code: "GENERAL" },
    ]);
    mockedFetchWallet.mockResolvedValue({
      wallet_id: "w-1",
      employee_id: "emp-1",
      available_points: 500,
      redeemed_points: 100,
      total_earned_points: 600,
    });
  });

  it("loads initial catalog, categories, and wallet", async () => {
    const { result } = renderHook(() => useRedeem());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.items).toHaveLength(1);
    expect(result.current.categories).toHaveLength(1);
    expect(result.current.wallet?.wallet_id).toBe("w-1");
    expect(result.current.availablePoints).toBe(500);
    expect(mockedFetchCatalog).toHaveBeenCalledWith(1, 20);
    expect(mockedFetchWallet).toHaveBeenCalledWith("emp-1");
  });

  it("loads all pages on category filter and reuses cache on repeated category switches", async () => {
    mockedFetchCatalog
      .mockResolvedValueOnce({
        data: [makeItem({ catalog_id: "all-1", category: { category_id: "x", category_name: "X", category_code: "X" } })],
        pagination: { current_page: 1, per_page: 20, total: 3, total_pages: 1, has_next: false, has_previous: false },
      })
      .mockResolvedValueOnce({
        data: [makeItem({ catalog_id: "p1-1", category: { category_id: "c-2", category_name: "Voucher", category_code: "VOUCHER" }, reward_code: "VOUCHER-10" })],
        pagination: { current_page: 1, per_page: 20, total: 21, total_pages: 2, has_next: true, has_previous: false },
      })
      .mockResolvedValueOnce({
        data: [makeItem({ catalog_id: "p2-1", category: { category_id: "c-2", category_name: "Voucher", category_code: "VOUCHER" } })],
        pagination: { current_page: 2, per_page: 20, total: 21, total_pages: 2, has_next: false, has_previous: true },
      });

    const { result } = renderHook(() => useRedeem());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      result.current.setActiveCategory("c-2");
    });

    await waitFor(() => expect(result.current.categoryLoading).toBe(false));
    expect(result.current.filteredItems).toHaveLength(2);
    expect(mockedFetchCatalog).toHaveBeenCalledTimes(3);

    await act(async () => {
      result.current.setActiveCategory("ALL");
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      result.current.setActiveCategory("c-2");
    });
    await waitFor(() => expect(result.current.categoryLoading).toBe(false));

    expect(mockedFetchCatalog).toHaveBeenCalledTimes(4);
  });

  it("goes to requested page when in ALL category", async () => {
    mockedFetchCatalog
      .mockResolvedValueOnce({
        data: [makeItem({ catalog_id: "first" })],
        pagination: { current_page: 1, per_page: 20, total: 40, total_pages: 2, has_next: true, has_previous: false },
      })
      .mockResolvedValueOnce({
        data: [makeItem({ catalog_id: "second" })],
        pagination: { current_page: 2, per_page: 20, total: 40, total_pages: 2, has_next: false, has_previous: true },
      });

    const { result } = renderHook(() => useRedeem());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      result.current.goToPage(2);
    });

    await waitFor(() => expect(result.current.currentPage).toBe(2));
    expect(result.current.items[0]?.catalog_id).toBe("second");
    expect(mockedFetchCatalog).toHaveBeenLastCalledWith(2, 20);
  });

  it("updates wallet and stock after successful redemption", async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useRedeem());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const selected = result.current.items[0];
    act(() => {
      result.current.openRedeem(selected);
    });

    act(() => {
      result.current.handleSuccess(
        {
          history_id: "h-1",
          points: 100,
          granted_at: "2026-01-01T00:00:00Z",
          status: "ok",
          new_stock_level: selected.available_stock - 1,
        },
        100
      );
    });

    expect(result.current.wallet?.available_points).toBe(400);
    expect(result.current.wallet?.redeemed_points).toBe(200);
    expect(result.current.items[0].available_stock).toBe(selected.available_stock - 1);

    act(() => {
      result.current.closeDialog();
      jest.runAllTimers();
    });
    expect(result.current.dialogState).toBeNull();
    jest.useRealTimers();
  });

  it("surfaces auth error when user is missing", async () => {
    mockedAuth.getUser.mockReturnValue(null);
    const { result } = renderHook(() => useRedeem());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toMatch(/not authenticated/i);
    expect(result.current.items).toHaveLength(0);
  });
});
