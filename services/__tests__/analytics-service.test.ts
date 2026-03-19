jest.mock("@/lib/api-utils", () => {
  const mockClient = { get: jest.fn() };
  return {
    __esModule: true,
    createAuthenticatedClient: () => mockClient,
    __mockClient: mockClient,
  };
});

import {
  fetchDashboardPlatformStats,
  fetchRecognitionUsers,
  fetchTeamReport,
} from "@/services/analytics-service";

const { __mockClient: mockClient } = jest.requireMock("@/lib/api-utils") as {
  __mockClient: { get: jest.Mock };
};

describe("analytics-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches platform stats", async () => {
    mockClient.get.mockResolvedValueOnce({ data: { total_points: { value: 100 } } });
    const data = await fetchDashboardPlatformStats();

    expect(mockClient.get).toHaveBeenCalledWith("/dashboard/platform-stats");
    expect(data).toEqual({ total_points: { value: 100 } });
  });

  it("builds recognition users query params", async () => {
    mockClient.get.mockResolvedValueOnce({ data: { items: [], total: 0, page: 2, limit: 15, pages: 0 } });
    await fetchRecognitionUsers("month", 2, 15);

    expect(mockClient.get).toHaveBeenCalledWith(
      "/dashboard/recognition/users?range=month&page=2&limit=15"
    );
  });

  it("returns null for team report on request error", async () => {
    mockClient.get.mockRejectedValueOnce(new Error("network"));
    const data = await fetchTeamReport("dep-1");

    expect(data).toBeNull();
  });
});

