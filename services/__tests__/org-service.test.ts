jest.mock("@/lib/api-utils", () => {
  const mockClient = { get: jest.fn(), post: jest.fn(), put: jest.fn() };
  return {
    __esModule: true,
    createAuthenticatedClient: () => mockClient,
    __mockClient: mockClient,
  };
});

import {
  fetchAuditLogs,
  fetchStatuses,
  createStatus,
  updateStatus,
} from "@/services/org-service";

const { __mockClient: mockClient } = jest.requireMock("@/lib/api-utils") as {
  __mockClient: { get: jest.Mock; post: jest.Mock; put: jest.Mock };
};

describe("org-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches audit logs and unwraps payload", async () => {
    mockClient.get.mockResolvedValueOnce({
      data: {
        data: [{ audit_id: "a1" }],
        pagination: { current_page: 1 },
      },
    });
    const out = await fetchAuditLogs({ page: 1, limit: 50 });

    expect(mockClient.get).toHaveBeenCalledWith("/audit-logs", { params: { page: 1, limit: 50 } });
    expect(out.data).toEqual([{ audit_id: "a1" }]);
  });

  it("returns empty array when statuses response is not an array", async () => {
    mockClient.get.mockResolvedValueOnce({ data: { bad: true } });
    const out = await fetchStatuses("EMPLOYEE");

    expect(mockClient.get).toHaveBeenCalledWith("/statuses", { params: { entity_type: "EMPLOYEE" } });
    expect(out).toEqual([]);
  });

  it("creates and updates statuses", async () => {
    mockClient.post.mockResolvedValueOnce({ data: { status_id: "s1" } });
    mockClient.put.mockResolvedValueOnce({ data: { status_id: "s1", status_name: "Updated" } });

    const created = await createStatus({
      status_code: "ACTIVE",
      status_name: "Active",
      description: "desc",
      entity_type: "EMPLOYEE",
    });
    const updated = await updateStatus("s1", { status_name: "Updated", description: "desc2" });

    expect(created).toEqual({ status_id: "s1" });
    expect(updated).toEqual({ status_id: "s1", status_name: "Updated" });
  });
});

