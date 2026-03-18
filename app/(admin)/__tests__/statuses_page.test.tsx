import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import StatusesPage from "@/app/(admin)/statuses/page";
import { fetchStatuses, createStatus, updateStatus } from "@/services/org-service";

jest.mock("@/services/org-service", () => ({
  __esModule: true,
  fetchStatuses: jest.fn(),
  createStatus: jest.fn(),
  updateStatus: jest.fn(),
}));

jest.mock("@/components/features/admin/statuses/UIHelpers", () => ({
  __esModule: true,
  PageShell: ({ children }: any) => <div data-testid="page-shell">{children}</div>,
  PageHeader: ({ title, subtitle }: any) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  ),
  ContentWrapper: ({ children }: any) => <div data-testid="content-wrapper">{children}</div>,
  StatusStats: ({ stats }: any) => (
    <div data-testid="status-stats">
      {stats.map((s: any) => `${s.label}:${s.value}`).join("|")}
    </div>
  ),
  FlashBanner: ({ type, msg, onDismiss }: any) => (
    <div data-testid="flash-banner">
      <span>{type}</span>
      <span>{msg}</span>
      <button onClick={onDismiss}>dismiss-flash</button>
    </div>
  ),
}));

jest.mock("@/components/features/admin/statuses/StatusTable", () => ({
  __esModule: true,
  StatusTable: ({
    statuses,
    loading,
    filterType,
    editId,
    editForm,
    onEdit,
    onUpdate,
    onCancelEdit,
    onEditFormChange,
  }: any) => (
    <div data-testid="status-table">
      <div data-testid="table-loading">{String(loading)}</div>
      <div data-testid="table-count">{statuses.length}</div>
      <div data-testid="table-filter">{filterType || "all"}</div>
      <div data-testid="table-edit-id">{editId ?? "none"}</div>
      <div data-testid="table-edit-name">{editForm.status_name}</div>
      <button onClick={() => statuses[0] && onEdit(statuses[0])}>edit-first</button>
      <button onClick={() => onEditFormChange("status_name", "Updated Name")}>change-edit-name</button>
      <button onClick={() => onEditFormChange("status_name", "")}>clear-edit-name</button>
      <button onClick={() => onUpdate(editId || statuses[0]?.status_id)}>update-now</button>
      <button onClick={onCancelEdit}>cancel-edit</button>
    </div>
  ),
}));

jest.mock("@/components/features/admin/statuses/StatusModal", () => ({
  __esModule: true,
  StatusModal: ({ isOpen, onClose, onCreate }: any) => (
    <div data-testid="status-modal">
      <div data-testid="modal-open">{String(isOpen)}</div>
      <button onClick={onClose}>modal-close</button>
      <button
        onClick={() =>
          onCreate({
            status_code: "ACTIVE",
            status_name: "Active",
            description: "User active",
            entity_type: "EMPLOYEE",
          })
        }
      >
        modal-create-valid
      </button>
      <button
        onClick={() =>
          onCreate({
            status_code: "",
            status_name: "Active",
            description: "",
            entity_type: "EMPLOYEE",
          })
        }
      >
        modal-create-invalid-code
      </button>
      <button
        onClick={() =>
          onCreate({
            status_code: "ACTIVE",
            status_name: "",
            description: "",
            entity_type: "EMPLOYEE",
          })
        }
      >
        modal-create-invalid-name
      </button>
    </div>
  ),
}));

const mockedFetchStatuses = fetchStatuses as jest.Mock;
const mockedCreateStatus = createStatus as jest.Mock;
const mockedUpdateStatus = updateStatus as jest.Mock;

const statuses = [
  {
    status_id: "s1",
    status_code: "ACTIVE",
    status_name: "Active",
    description: "Active user",
    entity_type: "EMPLOYEE",
    created_at: "2026-03-01T00:00:00.000Z",
  },
  {
    status_id: "s2",
    status_code: "PENDING",
    status_name: "Pending",
    description: "Pending review",
    entity_type: "REVIEW",
    created_at: "2026-03-02T00:00:00.000Z",
  },
];

describe("StatusesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedFetchStatuses.mockResolvedValue(statuses);
  });

  test("loads statuses on mount and renders base UI", async () => {
    render(<StatusesPage />);

    expect(screen.getByRole("heading", { name: "Status Management" })).toBeInTheDocument();

   await waitFor(() => expect(mockedFetchStatuses).toHaveBeenCalledWith(undefined));
await waitFor(() =>
  expect(screen.getByTestId("table-loading")).toHaveTextContent("false")
);
expect(screen.getByTestId("table-count")).toHaveTextContent("2");

    expect(screen.getByTestId("status-stats")).toHaveTextContent("Total:2");
  });

  test("filter type triggers reload with selected entity type", async () => {
    const user = userEvent.setup();
    render(<StatusesPage />);

    await waitFor(() => expect(mockedFetchStatuses).toHaveBeenCalledTimes(1));
    await user.selectOptions(screen.getByRole("combobox"), "REVIEW");

    await waitFor(() => expect(mockedFetchStatuses).toHaveBeenCalledTimes(2));
    expect(mockedFetchStatuses).toHaveBeenLastCalledWith("REVIEW");
  });

  test("search filters statuses by name/code", async () => {
    const user = userEvent.setup();
    render(<StatusesPage />);

    await waitFor(() => expect(mockedFetchStatuses).toHaveBeenCalled());
    await user.type(screen.getByPlaceholderText(/search by name or code/i), "pend");

    expect(screen.getByTestId("table-count")).toHaveTextContent("1");
  });

  test("clear search resets filtered list", async () => {
    const user = userEvent.setup();
    render(<StatusesPage />);

    await waitFor(() => expect(mockedFetchStatuses).toHaveBeenCalled());
    const input = screen.getByPlaceholderText(/search by name or code/i);

    await user.type(input, "active");
    expect(screen.getByTestId("table-count")).toHaveTextContent("1");

    await user.click(screen.getByRole("button", { name: "" }));
    expect(input).toHaveValue("");
    expect(screen.getByTestId("table-count")).toHaveTextContent("2");
  });

  test("open create modal from toolbar", async () => {
    const user = userEvent.setup();
    render(<StatusesPage />);

    await waitFor(() => expect(mockedFetchStatuses).toHaveBeenCalled());
    expect(screen.getByTestId("modal-open")).toHaveTextContent("false");

    await user.click(screen.getByRole("button", { name: /add new status/i }));
    expect(screen.getByTestId("modal-open")).toHaveTextContent("true");
  });

  test("create validation errors (code/name) show flash", async () => {
    const user = userEvent.setup();
    render(<StatusesPage />);

    await waitFor(() => expect(mockedFetchStatuses).toHaveBeenCalled());

    await user.click(screen.getByRole("button", { name: "modal-create-invalid-code" }));
    expect(screen.getByTestId("flash-banner")).toHaveTextContent("Please enter a status code.");

    await user.click(screen.getByRole("button", { name: "modal-create-invalid-name" }));
    expect(screen.getByTestId("flash-banner")).toHaveTextContent("Please enter a status name.");
  });

  test("create success closes modal, flashes success, and reloads", async () => {
    const user = userEvent.setup();
    mockedCreateStatus.mockResolvedValueOnce({});
    render(<StatusesPage />);

    await waitFor(() => expect(mockedFetchStatuses).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole("button", { name: /add new status/i }));
    await user.click(screen.getByRole("button", { name: "modal-create-valid" }));

    await waitFor(() => expect(mockedCreateStatus).toHaveBeenCalled());
    expect(mockedCreateStatus).toHaveBeenCalledWith({
      status_code: "ACTIVE",
      status_name: "Active",
      description: "User active",
      entity_type: "EMPLOYEE",
    });

    expect(screen.getByTestId("flash-banner")).toHaveTextContent("Status created successfully.");
    await waitFor(() => expect(mockedFetchStatuses).toHaveBeenCalledTimes(2));
  });

  test("create failure shows error flash", async () => {
    const user = userEvent.setup();
    mockedCreateStatus.mockRejectedValueOnce(new Error("Duplicate status code"));
    render(<StatusesPage />);

    await waitFor(() => expect(mockedFetchStatuses).toHaveBeenCalled());
    await user.click(screen.getByRole("button", { name: "modal-create-valid" }));

    expect(await screen.findByTestId("flash-banner")).toHaveTextContent("Duplicate status code");
  });

  test("start edit, update success, and cancel edit", async () => {
    const user = userEvent.setup();
    mockedUpdateStatus.mockResolvedValueOnce({});
    render(<StatusesPage />);

    await waitFor(() => expect(mockedFetchStatuses).toHaveBeenCalled());

    await user.click(screen.getByRole("button", { name: "edit-first" }));
    expect(screen.getByTestId("table-edit-id")).toHaveTextContent("s1");
    expect(screen.getByTestId("table-edit-name")).toHaveTextContent("Active");

    await user.click(screen.getByRole("button", { name: "change-edit-name" }));
    await user.click(screen.getByRole("button", { name: "update-now" }));

    await waitFor(() => expect(mockedUpdateStatus).toHaveBeenCalledWith("s1", {
      status_name: "Updated Name",
      description: "Active user",
    }));

    expect(screen.getByTestId("flash-banner")).toHaveTextContent("Status updated successfully.");

    await user.click(screen.getByRole("button", { name: "cancel-edit" }));
    expect(screen.getByTestId("table-edit-id")).toHaveTextContent("none");
  });

  test("update validation: empty name blocks update", async () => {
    const user = userEvent.setup();
    render(<StatusesPage />);

    await waitFor(() => expect(mockedFetchStatuses).toHaveBeenCalled());
    await user.click(screen.getByRole("button", { name: "edit-first" }));
    await user.click(screen.getByRole("button", { name: "clear-edit-name" }));
    await user.click(screen.getByRole("button", { name: "update-now" }));

    expect(screen.getByTestId("flash-banner")).toHaveTextContent("Status name cannot be empty.");
    expect(mockedUpdateStatus).not.toHaveBeenCalled();
  });

  test("update failure shows error flash", async () => {
    const user = userEvent.setup();
    mockedUpdateStatus.mockRejectedValueOnce(new Error("Update failed"));
    render(<StatusesPage />);

    await waitFor(() => expect(mockedFetchStatuses).toHaveBeenCalled());
    await user.click(screen.getByRole("button", { name: "edit-first" }));
    await user.click(screen.getByRole("button", { name: "update-now" }));

    expect(await screen.findByTestId("flash-banner")).toHaveTextContent("Update failed");
  });
});
