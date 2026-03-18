import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import AuditLogsPage from "@/app/(admin)/audit-logs/page";
import { fetchAuditLogs } from "@/services/org-service";

jest.mock("@/services/org-service", () => ({
  __esModule: true,
  fetchAuditLogs: jest.fn(),
}));

jest.mock("@/components/features/admin/audit-logs/AuditTable", () => ({
  __esModule: true,
  AuditTable: ({
    logs,
    loading,
    pagination,
    hasActiveFilters,
    onPageChange,
    onViewDetails,
  }: any) => (
    <div>
      <div data-testid="audit-table">{loading ? "Loading..." : logs.length}</div>
      <div data-testid="table-total">{pagination?.total ?? 0}</div>
      <div data-testid="has-filters">{String(hasActiveFilters)}</div>
      <button onClick={() => onPageChange(2)}>Next Page</button>
      <button onClick={() => logs[0] && onViewDetails(logs[0])}>View Details</button>
    </div>
  ),
}));

jest.mock("@/components/features/admin/audit-logs/AuditDetailModal", () => ({
  __esModule: true,
  AuditDetailModal: ({ log, onClose }: any) =>
    log ? (
      <div data-testid="modal">
        Modal Open
        <button onClick={onClose}>Close</button>
      </div>
    ) : (
      <div data-testid="modal-closed">Closed</div>
    ),
}));

jest.mock("@/components/features/admin/audit-logs/AuditFilters", () => ({
  __esModule: true,
  AuditFilterPanel: ({ onApply, onClear }: any) => (
    <div data-testid="filter-panel">
      <button
        onClick={() =>
          onApply({
            tableName: "users",
            operationType: "INSERT",
            performedBy: "abc12345-0000-1111-2222-333333333333",
            startDate: "2024-01-01T00:00",
            endDate: "2024-01-02T00:00",
          })
        }
      >
        Apply Filters
      </button>
      <button onClick={onClear}>Clear Filters</button>
    </div>
  ),
}));

const mockedFetchAuditLogs = fetchAuditLogs as jest.MockedFunction<
  typeof fetchAuditLogs
>;

const logsResponse = {
  data: [
    {
      audit_id: "a1b2c3d4",
      table_name: "users",
      record_id: "r1",
      operation_type: "INSERT",
      old_values: null,
      new_values: { name: "John" },
      performed_by: "u1",
      performed_at: "2026-03-18T10:00:00.000Z",
      ip_address: "127.0.0.1",
    },
    {
      audit_id: "e5f6g7h8",
      table_name: "users",
      record_id: "r2",
      operation_type: "UPDATE",
      old_values: { name: "A" },
      new_values: { name: "B" },
      performed_by: "u2",
      performed_at: "2026-03-18T11:00:00.000Z",
      ip_address: "127.0.0.2",
    },
  ],
  pagination: {
    current_page: 1,
    per_page: 10,
    total: 2,
    total_pages: 1,
    has_next: false,
    has_previous: false,
  },
};

async function waitForLoadComplete() {
  await waitFor(() => expect(mockedFetchAuditLogs).toHaveBeenCalled());
  await waitFor(() =>
    expect(screen.getByTestId("audit-table")).not.toHaveTextContent("Loading...")
  );
}

describe("AuditLogsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders and fetches logs successfully", async () => {
    mockedFetchAuditLogs.mockResolvedValueOnce(logsResponse as any);

    render(<AuditLogsPage />);
    await waitForLoadComplete();

    expect(screen.getByText("Audit Logs")).toBeInTheDocument();
    expect(screen.getByTestId("audit-table")).toHaveTextContent("2");
    expect(mockedFetchAuditLogs).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });

  test("handles API error correctly", async () => {
    mockedFetchAuditLogs.mockRejectedValueOnce(new Error("API Error"));

    render(<AuditLogsPage />);

    expect(await screen.findByText("API Error")).toBeInTheDocument();
  });

  test("refresh button triggers fetch", async () => {
    mockedFetchAuditLogs.mockResolvedValue(logsResponse as any);
    const user = userEvent.setup();

    render(<AuditLogsPage />);
    await waitForLoadComplete();

    await user.click(screen.getByTitle("Refresh"));

    await waitFor(() => expect(mockedFetchAuditLogs).toHaveBeenCalledTimes(2));
  });

  test("toggles filter panel", async () => {
    mockedFetchAuditLogs.mockResolvedValue(logsResponse as any);
    const user = userEvent.setup();

    render(<AuditLogsPage />);
    await waitForLoadComplete();

    await user.click(screen.getByRole("button", { name: /filter/i }));
    expect(screen.getByTestId("filter-panel")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /hide filters/i }));
    expect(screen.queryByTestId("filter-panel")).not.toBeInTheDocument();
  });

  test("applies filters and updates API params", async () => {
    mockedFetchAuditLogs.mockResolvedValue(logsResponse as any);
    const user = userEvent.setup();

    render(<AuditLogsPage />);
    await waitForLoadComplete();

    await user.click(screen.getByRole("button", { name: /filter/i }));
    await user.click(screen.getByRole("button", { name: /apply filters/i }));

    await waitFor(() => expect(mockedFetchAuditLogs).toHaveBeenCalledTimes(2));

    const lastCall = mockedFetchAuditLogs.mock.calls.at(-1);
    expect(lastCall?.[0]).toMatchObject({
      page: 1,
      limit: 10,
      table_name: "users",
      operation_type: "INSERT",
      performed_by: "abc12345-0000-1111-2222-333333333333",
    });

    expect(screen.getByText(/active filters/i)).toBeInTheDocument();
  });

  test("clears filters and refetches default params", async () => {
    mockedFetchAuditLogs.mockResolvedValue(logsResponse as any);
    const user = userEvent.setup();

    render(<AuditLogsPage />);
    await waitForLoadComplete();

    await user.click(screen.getByRole("button", { name: /filter/i }));
    await user.click(screen.getByRole("button", { name: /apply filters/i }));
    await waitFor(() => expect(mockedFetchAuditLogs).toHaveBeenCalledTimes(2));

    await user.click(screen.getByRole("button", { name: /clear all/i }));

    await waitFor(() => expect(mockedFetchAuditLogs).toHaveBeenCalledTimes(3));
    const lastCall = mockedFetchAuditLogs.mock.calls.at(-1);
    expect(lastCall?.[0]).toEqual({ page: 1, limit: 10 });
  });

  test("pagination triggers page change", async () => {
    mockedFetchAuditLogs.mockResolvedValue(logsResponse as any);
    const user = userEvent.setup();

    render(<AuditLogsPage />);
    await waitForLoadComplete();

    await user.click(screen.getByRole("button", { name: /next page/i }));

    await waitFor(() => expect(mockedFetchAuditLogs).toHaveBeenCalledTimes(2));
    const lastCall = mockedFetchAuditLogs.mock.calls.at(-1);
    expect(lastCall?.[0]).toEqual({ page: 2, limit: 10 });
  });

  test("opens and closes modal", async () => {
    mockedFetchAuditLogs.mockResolvedValue(logsResponse as any);
    const user = userEvent.setup();

    render(<AuditLogsPage />);
    await waitForLoadComplete();

    await user.click(screen.getByRole("button", { name: /view details/i }));
    expect(screen.getByTestId("modal")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /close/i }));
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  test("handles empty data", async () => {
    mockedFetchAuditLogs.mockResolvedValueOnce({
      data: [],
      pagination: {
        current_page: 1,
        per_page: 10,
        total: 0,
        total_pages: 0,
        has_next: false,
        has_previous: false,
      },
    } as any);

    render(<AuditLogsPage />);
    await waitForLoadComplete();

    expect(screen.getByTestId("audit-table")).toHaveTextContent("0");
    expect(screen.getByTestId("table-total")).toHaveTextContent("0");
  });

  test("date filters are converted to ISO format", async () => {
    mockedFetchAuditLogs.mockResolvedValue(logsResponse as any);
    const user = userEvent.setup();

    render(<AuditLogsPage />);
    await waitForLoadComplete();

    await user.click(screen.getByRole("button", { name: /filter/i }));
    await user.click(screen.getByRole("button", { name: /apply filters/i }));

    await waitFor(() => expect(mockedFetchAuditLogs).toHaveBeenCalledTimes(2));

    const lastCall = mockedFetchAuditLogs.mock.calls.at(-1);
    const params = lastCall?.[0] as Record<string, string>;
    expect(params.start_date).toContain("T");
    expect(params.end_date).toContain("T");
  });
});
