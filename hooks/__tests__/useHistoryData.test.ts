import { act, renderHook, waitFor } from "@testing-library/react";
import { useHistoryData } from "@/hooks/useHistoryData";
import { auth } from "@/services/auth-service";

jest.mock("@/lib/api-utils", () => {
  const mockRewardsClient = { get: jest.fn() };
  const mockWalletClient = { get: jest.fn() };
  return {
    __esModule: true,
    createAuthenticatedClient: (baseUrl: string) =>
      baseUrl.includes("rewards") ? mockRewardsClient : mockWalletClient,
    __mockClients: { mockRewardsClient, mockWalletClient },
  };
});

jest.mock("@/services/auth-service", () => ({
  __esModule: true,
  auth: {
    getUser: jest.fn(),
  },
}));

const mockedAuth = auth as jest.Mocked<typeof auth>;
const { __mockClients } = jest.requireMock("@/lib/api-utils") as {
  __mockClients: {
    mockRewardsClient: { get: jest.Mock };
    mockWalletClient: { get: jest.Mock };
  };
};

describe("useHistoryData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAuth.getUser.mockReturnValue({ employee_id: "emp-1" } as any);
  });

  it("merges redemption and points history, then computes totals", async () => {
    __mockClients.mockRewardsClient.get.mockResolvedValueOnce({
      data: {
        data: [
          {
            history_id: "h1",
            points: 100,
            granted_at: "2026-01-02T00:00:00Z",
            reward_catalog: { reward_name: "Amazon Voucher", reward_code: "REW-AMZ-100" },
          },
        ],
        total_items: 1,
      },
    });
    __mockClients.mockWalletClient.get
      .mockResolvedValueOnce({ data: { wallet_id: "w-1" } })
      .mockResolvedValueOnce({
        data: {
          transactions: [
            {
              transaction_id: "t1",
              amount: 20,
              description: "Points earned",
              transaction_at: "2026-01-03T00:00:00Z",
              transaction_type: { is_credit: true },
            },
            {
              transaction_id: "t2",
              amount: 30,
              description: "Debit",
              transaction_at: "2026-01-01T00:00:00Z",
              transaction_type: { is_credit: false },
            },
          ],
        },
      });

    const { result } = renderHook(() => useHistoryData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.allHistory).toHaveLength(2);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.filteredHistory[0].history_id).toBe("t1");
    expect(result.current.totalPages).toBe(1);
  });

  it("applies period and type filters", async () => {
    __mockClients.mockRewardsClient.get.mockResolvedValueOnce({
      data: {
        data: [
          {
            history_id: "h1",
            points: 100,
            granted_at: "2026-01-02T00:00:00Z",
            reward_catalog: { reward_name: "Amazon Voucher", reward_code: "REW-AMZ-100" },
          },
        ],
        total_items: 1,
      },
    });
    __mockClients.mockWalletClient.get
      .mockResolvedValueOnce({ data: { wallet_id: "w-1" } })
      .mockResolvedValueOnce({
        data: {
          transactions: [
            {
              transaction_id: "t1",
              amount: 20,
              description: "Points earned",
              transaction_at: "2026-01-03T00:00:00Z",
              transaction_type: { is_credit: true },
            },
          ],
        },
      });

    const { result } = renderHook(() => useHistoryData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setSelectedPeriod("Redeem History");
    });
    expect(result.current.filteredHistory).toHaveLength(1);

    act(() => {
      result.current.setSelectedType("Gift Cards");
    });
    expect(result.current.filteredHistory).toHaveLength(1);

    act(() => {
      result.current.setSelectedPeriod("Points History");
    });
    expect(result.current.filteredHistory).toHaveLength(0);
  });

  it("sets error when reward history request fails", async () => {
    __mockClients.mockRewardsClient.get.mockRejectedValueOnce(new Error("request failed"));
    const { result } = renderHook(() => useHistoryData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toMatch(/request failed/i);
  });
});

