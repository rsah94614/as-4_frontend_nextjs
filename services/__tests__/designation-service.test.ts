jest.mock("@/lib/api-utils", () => {
  const mockClient = { get: jest.fn(), post: jest.fn(), put: jest.fn() };
  return {
    __esModule: true,
    createAuthenticatedClient: () => mockClient,
    __mockClient: mockClient,
  };
});

import { designationService } from "@/services/designation-service";

const { __mockClient: mockClient } = jest.requireMock("@/lib/api-utils") as {
  __mockClient: { get: jest.Mock; post: jest.Mock; put: jest.Mock };
};

describe("designation-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lists designations with optional params", async () => {
    mockClient.get.mockResolvedValueOnce({ data: { data: [], pagination: { total: 0 } } });
    await designationService.list({ page: 2, limit: 10, is_active: true });

    expect(mockClient.get).toHaveBeenCalledWith("/designations", {
      params: { page: 2, limit: 10, is_active: true },
    });
  });

  it("gets and updates designation", async () => {
    mockClient.get.mockResolvedValueOnce({ data: { designation_id: "x1" } });
    mockClient.put.mockResolvedValueOnce({ data: { designation_id: "x1", designation_name: "Lead" } });

    const one = await designationService.getById("x1");
    const updated = await designationService.update("x1", { designation_name: "Lead", level: 4 } as any);

    expect(one).toEqual({ designation_id: "x1" });
    expect(updated).toEqual({ designation_id: "x1", designation_name: "Lead" });
  });
});

