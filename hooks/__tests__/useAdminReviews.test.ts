import { act, renderHook, waitFor } from "@testing-library/react";
import { useAdminReviews } from "@/hooks/useAdminReviews";

jest.mock("@/lib/api-utils", () => {
  const mockEmployeeClient = { get: jest.fn() };
  const mockRecognitionClient = { get: jest.fn() };
  return {
    __esModule: true,
    createAuthenticatedClient: (baseUrl: string) =>
      baseUrl.includes("employees") ? mockEmployeeClient : mockRecognitionClient,
    __mockClients: { mockEmployeeClient, mockRecognitionClient },
  };
});

const { __mockClients } = jest.requireMock("@/lib/api-utils") as {
  __mockClients: {
    mockEmployeeClient: { get: jest.Mock };
    mockRecognitionClient: { get: jest.Mock };
  };
};

describe("useAdminReviews", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads employees and reviews, then computes managers/team/summary", async () => {
    const now = new Date();
    __mockClients.mockEmployeeClient.get.mockResolvedValueOnce({
      data: {
        data: [
          { employee_id: "m1", username: "Manager", manager_id: null },
          { employee_id: "e1", username: "Alice", manager_id: "m1" },
        ],
        pagination: { total_pages: 1 },
      },
    });
    __mockClients.mockRecognitionClient.get.mockResolvedValueOnce({
      data: {
        data: [{ review_id: "r1", receiver_id: "e1", raw_points: 20, review_at: now.toISOString() }],
        pagination: { total_pages: 1 },
      },
    });

    const { result } = renderHook(() => useAdminReviews());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.employees).toHaveLength(2);
    expect(result.current.reviews).toHaveLength(1);
    expect(result.current.managers.map((m) => m.employee_id)).toContain("m1");
    expect(result.current.getTeam("m1")).toHaveLength(1);
    expect(result.current.summary.totalReviews).toBe(1);
    expect(result.current.summary.totalPoints).toBe(20);
  });

  it("updates review list when month/year filters change", async () => {
    __mockClients.mockEmployeeClient.get.mockResolvedValueOnce({
      data: { data: [{ employee_id: "m1", username: "Manager", manager_id: null }], pagination: { total_pages: 1 } },
    });
    __mockClients.mockRecognitionClient.get.mockResolvedValueOnce({
      data: {
        data: [
          { review_id: "r1", receiver_id: "e1", raw_points: 10, review_at: "2026-01-05T00:00:00Z" },
          { review_id: "r2", receiver_id: "e1", raw_points: 10, review_at: "2026-02-05T00:00:00Z" },
        ],
        pagination: { total_pages: 1 },
      },
    });

    const { result } = renderHook(() => useAdminReviews());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setYear(2026);
      result.current.setMonth(0);
    });
    expect(result.current.reviews).toHaveLength(1);
  });
});

