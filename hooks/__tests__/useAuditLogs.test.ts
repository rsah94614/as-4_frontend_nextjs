import { act, renderHook, waitFor } from "@testing-library/react";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { fetchAuditLogs } from "@/services/org-service";

jest.mock("@/services/org-service", () => ({
  __esModule: true,
  fetchAuditLogs: jest.fn(),
}));

const mockedFetchAuditLogs = fetchAuditLogs as jest.MockedFunction<typeof fetchAuditLogs>;

describe("useAuditLogs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedFetchAuditLogs.mockResolvedValue({
      data: [
        {
          audit_id: "a1",
          table_name: "employees",
          record_id: "1",
          operation_type: "UPDATE",
          old_values: null,
          new_values: null,
          performed_by: "admin",
          performed_at: "2026-01-01T00:00:00Z",
        },
      ],
      pagination: { current_page: 1, per_page: 50, total: 1, total_pages: 1, has_next: false, has_previous: false },
    });
  });

  it("loads logs on mount", async () => {
    const { result } = renderHook(() => useAuditLogs());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.logs).toHaveLength(1);
    expect(mockedFetchAuditLogs).toHaveBeenCalledWith({ page: 1, limit: 50 });
  });

  it("applies filters and resets page", async () => {
    const { result } = renderHook(() => useAuditLogs());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      result.current.setPage(3);
    });

    await act(async () => {
      result.current.applyFilters({
        tableName: "employees",
        operationType: "UPDATE",
        performedBy: "admin",
        startDate: "2026-01-01",
        endDate: "2026-01-31",
      });
    });

    await waitFor(() => expect(result.current.page).toBe(1));
    await waitFor(() =>
      expect(mockedFetchAuditLogs).toHaveBeenLastCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 50,
          table_name: "employees",
          operation_type: "UPDATE",
          performed_by: "admin",
        })
      )
    );
  });

  it("maps 401 to session-expired message", async () => {
    mockedFetchAuditLogs.mockRejectedValueOnce({ response: { status: 401 } });
    const { result } = renderHook(() => useAuditLogs());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toMatch(/session has expired/i);
    expect(result.current.logs).toEqual([]);
  });
});

