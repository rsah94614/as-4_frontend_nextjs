import { act, renderHook, waitFor } from "@testing-library/react";
import { useTeams } from "@/hooks/useTeams";

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

describe("useTeams", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads data and computes managers, departments, and stats", async () => {
    const now = new Date().toISOString();
    __mockClients.mockEmployeeClient.get.mockResolvedValueOnce({
      data: {
        data: [
          { employee_id: "m1", username: "Mgr", manager_id: null, department_name: "Engineering" },
          { employee_id: "e1", username: "A", manager_id: "m1", department_name: "Engineering" },
        ],
        pagination: { total_pages: 1 },
      },
    });
    __mockClients.mockRecognitionClient.get.mockResolvedValueOnce({
      data: {
        data: [
          { review_id: "r1", receiver_id: "e1", reviewer_id: "m1", rating: 4, review_at: now },
          { review_id: "r2", receiver_id: "e1", reviewer_id: "m1", rating: 2, review_at: now },
        ],
        pagination: { total_pages: 1 },
      },
    });

    const { result } = renderHook(() => useTeams());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.managers.map((m) => m.employee_id)).toContain("m1");
    expect(result.current.getTeam("m1")).toHaveLength(1);
    expect(result.current.deptOptions).toContain("Engineering");
    expect(result.current.statsMap.e1.review_count).toBe(2);
    expect(result.current.statsMap.e1.avg_rating).toBe(3);
  });

  it("sets error when data fetch fails", async () => {
    __mockClients.mockEmployeeClient.get.mockRejectedValueOnce(new Error("failed"));
    const { result } = renderHook(() => useTeams());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toMatch(/failed/i);
  });

  it("filters stats by month and year", async () => {
    __mockClients.mockEmployeeClient.get.mockResolvedValueOnce({
      data: { data: [{ employee_id: "m1", username: "Mgr", manager_id: null }], pagination: { total_pages: 1 } },
    });
    __mockClients.mockRecognitionClient.get.mockResolvedValueOnce({
      data: {
        data: [
          { review_id: "r1", receiver_id: "e1", reviewer_id: "m1", rating: 5, review_at: "2026-01-10T00:00:00Z" },
          { review_id: "r2", receiver_id: "e1", reviewer_id: "m1", rating: 1, review_at: "2026-02-10T00:00:00Z" },
        ],
        pagination: { total_pages: 1 },
      },
    });

    const { result } = renderHook(() => useTeams());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setYear(2026);
      result.current.setMonth(0);
    });

    expect(result.current.statsMap.e1.review_count).toBe(1);
    expect(result.current.statsMap.e1.avg_rating).toBe(5);
  });
});

