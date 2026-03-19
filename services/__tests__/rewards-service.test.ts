jest.mock("@/lib/api-utils", () => {
  const mockRewardsClient = { get: jest.fn(), post: jest.fn(), patch: jest.fn() };
  const mockWalletClient = { get: jest.fn() };
  return {
    __esModule: true,
    createAuthenticatedClient: (baseUrl: string) =>
      baseUrl.includes("/wallet") ? mockWalletClient : mockRewardsClient,
    __mockClients: { mockRewardsClient, mockWalletClient },
  };
});

import {
  fetchCatalog,
  fetchWallet,
  redeemReward,
  fetchAdminCatalog,
  createCategory,
  updateCategory,
} from "@/services/rewards-service";

const { __mockClients } = jest.requireMock("@/lib/api-utils") as {
  __mockClients: {
    mockRewardsClient: { get: jest.Mock; post: jest.Mock; patch: jest.Mock };
    mockWalletClient: { get: jest.Mock };
  };
};

describe("rewards-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches catalog and wallet with expected routes", async () => {
    __mockClients.mockRewardsClient.get.mockResolvedValueOnce({ data: { data: [], pagination: { total: 0 } } });
    __mockClients.mockWalletClient.get.mockResolvedValueOnce({ data: { wallet_id: "w1" } });

    await fetchCatalog(3, 12);
    await fetchWallet("emp-1");

    expect(__mockClients.mockRewardsClient.get).toHaveBeenCalledWith("/catalog?active_only=true&page=3&size=12");
    expect(__mockClients.mockWalletClient.get).toHaveBeenCalledWith("/employees/emp-1");
  });

  it("posts redeem payload and supports admin catalog params", async () => {
    __mockClients.mockRewardsClient.post.mockResolvedValueOnce({ data: { history_id: "h1" } });
    __mockClients.mockRewardsClient.get.mockResolvedValueOnce({ data: { data: [], pagination: { total: 0 } } });

    const redeem = await redeemReward("w1", "c1", 150, "Nice");
    await fetchAdminCatalog({ page: 2, size: 8, active_only: true });

    expect(__mockClients.mockRewardsClient.post).toHaveBeenCalledWith("/redeem", {
      wallet_id: "w1",
      catalog_id: "c1",
      points: 150,
      comment: "Nice",
    });
    expect(__mockClients.mockRewardsClient.get).toHaveBeenCalledWith("/catalog?active_only=true&page=2&size=8");
    expect(redeem).toEqual({ history_id: "h1" });
  });

  it("creates and updates category", async () => {
    __mockClients.mockRewardsClient.post.mockResolvedValueOnce({ data: { category_id: "cat1" } });
    __mockClients.mockRewardsClient.patch.mockResolvedValueOnce({ data: { category_id: "cat1", category_name: "Updated" } });

    const created = await createCategory({ category_name: "Vouchers", category_code: "VOUCHER" });
    const updated = await updateCategory("cat1", { category_name: "Updated", is_active: true });

    expect(created).toEqual({ category_id: "cat1" });
    expect(updated).toEqual({ category_id: "cat1", category_name: "Updated" });
  });
});
