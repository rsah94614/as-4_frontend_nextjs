import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import RewardsPage from "@/app/(admin)/rewards/page";
import { fetchAdminCatalog, fetchAdminCategories } from "@/services/rewards-service";

jest.mock("@/services/rewards-service", () => ({
  __esModule: true,
  fetchAdminCatalog: jest.fn(),
  fetchAdminCategories: jest.fn(),
}));

jest.mock("@/components/features/admin/rewards/RewardGrid", () => ({
  __esModule: true,
  RewardGrid: ({
    items,
    loading,
    error,
    page,
    onRetry,
    onEdit,
    onRestock,
    onCreateNew,
    setPage,
  }: any) => (
    <div data-testid="reward-grid">
      <div data-testid="grid-loading">{String(loading)}</div>
      <div data-testid="grid-error">{error || "none"}</div>
      <div data-testid="grid-count">{items.length}</div>
      <div data-testid="grid-page">{page}</div>
      <button onClick={onRetry}>grid-retry</button>
      <button onClick={onCreateNew}>grid-create</button>
      <button onClick={() => items[0] && onEdit(items[0])}>grid-edit-first</button>
      <button onClick={() => items[0] && onRestock(items[0])}>grid-restock-first</button>
      <button onClick={() => setPage(2)}>grid-set-page-2</button>
    </div>
  ),
}));

jest.mock("@/components/features/admin/rewards/RewardModal", () => ({
  __esModule: true,
  RewardModal: (props: any) => {
    const { isOpen, item, categories, onClose, onSave } = props;
    const mode = "item" in props ? "edit" : "create";
    return (
      <div data-testid={`reward-modal-${mode}`}>
        <div data-testid={`reward-modal-open-${mode}`}>{String(isOpen)}</div>
        <div data-testid={`reward-modal-item-${mode}`}>{item?.catalog_id ?? "none"}</div>
        <div data-testid={`reward-modal-cats-${mode}`}>{categories.length}</div>
        <button onClick={onClose}>reward-modal-close-{mode}</button>
        <button onClick={onSave}>reward-modal-save-{mode}</button>
      </div>
    );
  },
}));

jest.mock("@/components/features/admin/rewards/RestockModal", () => ({
  __esModule: true,
  RestockModal: ({ isOpen, item, onClose, onSave }: any) => (
    <div data-testid="restock-modal">
      <div data-testid="restock-open">{String(isOpen)}</div>
      <div data-testid="restock-item">{item?.catalog_id ?? "none"}</div>
      <button onClick={onClose}>restock-close</button>
      <button onClick={onSave}>restock-save</button>
    </div>
  ),
}));

const mockedFetchAdminCatalog = fetchAdminCatalog as jest.Mock;
const mockedFetchAdminCategories = fetchAdminCategories as jest.Mock;

const categories = [
  {
    category_id: "cat1",
    category_name: "Gift Cards",
    category_code: "CAT-GIFT",
    is_active: true,
    created_at: "2026-03-01T00:00:00.000Z",
  },
];

const items = [
  {
    catalog_id: "r1",
    reward_name: "Amazon Voucher",
    reward_code: "AMZ-50",
    description: "Gift card",
    default_points: 100,
    min_points: 100,
    max_points: 100,
    is_active: true,
    created_at: "2026-03-10T00:00:00.000Z",
    stock_status: "IN_STOCK",
    available_stock: 10,
    category: {
      category_id: "cat1",
      category_name: "Gift Cards",
      category_code: "CAT-GIFT",
    },
  },
  {
    catalog_id: "r2",
    reward_name: "Company Tee",
    reward_code: "TEE-01",
    description: "Merch",
    default_points: 80,
    min_points: 80,
    max_points: 80,
    is_active: false,
    created_at: "2026-03-11T00:00:00.000Z",
    stock_status: "LOW",
    available_stock: 2,
    category: {
      category_id: "cat1",
      category_name: "Gift Cards",
      category_code: "CAT-GIFT",
    },
  },
];

const pagination = {
  current_page: 1,
  per_page: 12,
  total: 2,
  total_pages: 1,
  has_next: false,
  has_previous: false,
};

describe("RewardsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedFetchAdminCategories.mockResolvedValue(categories);
    mockedFetchAdminCatalog.mockResolvedValue({ data: items, pagination });
  });

  test("loads catalog and categories on mount", async () => {
    render(<RewardsPage />);

    await waitFor(() => expect(mockedFetchAdminCategories).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockedFetchAdminCatalog).toHaveBeenCalledTimes(1));

    expect(mockedFetchAdminCatalog).toHaveBeenCalledWith({
      page: 1,
      size: 12,
      active_only: undefined,
    });

    expect(screen.getByTestId("grid-count")).toHaveTextContent("2");
    expect(screen.getByText("2 items")).toBeInTheDocument();
  });

  test("search filters items in grid", async () => {
    const user = userEvent.setup();
    render(<RewardsPage />);

    await waitFor(() => expect(mockedFetchAdminCatalog).toHaveBeenCalled());

    await user.type(screen.getByPlaceholderText(/search by name or code/i), "amazon");
    expect(screen.getByTestId("grid-count")).toHaveTextContent("1");

    await user.click(screen.getByRole("button", { name: "" })); // clear icon
    expect(screen.getByTestId("grid-count")).toHaveTextContent("2");
  });

  test("filter change reloads data with active_only for active", async () => {
    const user = userEvent.setup();
    render(<RewardsPage />);

    await waitFor(() => expect(mockedFetchAdminCatalog).toHaveBeenCalledTimes(1));

    await user.selectOptions(screen.getByRole("combobox"), "active");

    await waitFor(() => expect(mockedFetchAdminCatalog).toHaveBeenCalledTimes(2));
    expect(mockedFetchAdminCatalog).toHaveBeenLastCalledWith({
      page: 1,
      size: 12,
      active_only: true,
    });
  });

  test("page change from grid reloads catalog", async () => {
    const user = userEvent.setup();
    render(<RewardsPage />);

    await waitFor(() => expect(mockedFetchAdminCatalog).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole("button", { name: "grid-set-page-2" }));

    await waitFor(() => expect(mockedFetchAdminCatalog).toHaveBeenCalledTimes(2));
    expect(mockedFetchAdminCatalog).toHaveBeenLastCalledWith({
      page: 2,
      size: 12,
      active_only: undefined,
    });
  });

  test("open create modal from toolbar and grid", async () => {
    const user = userEvent.setup();
    render(<RewardsPage />);

    await waitFor(() => expect(mockedFetchAdminCatalog).toHaveBeenCalled());

    expect(screen.getByTestId("reward-modal-open-create")).toHaveTextContent("false");

    await user.click(screen.getByRole("button", { name: /add reward/i }));
    expect(screen.getByTestId("reward-modal-open-create")).toHaveTextContent("true");

    await user.click(screen.getByRole("button", { name: "reward-modal-close-create" }));
    expect(screen.getByTestId("reward-modal-open-create")).toHaveTextContent("false");

    await user.click(screen.getByRole("button", { name: "grid-create" }));
    expect(screen.getByTestId("reward-modal-open-create")).toHaveTextContent("true");
  });

  test("open edit and restock modals from grid actions", async () => {
    const user = userEvent.setup();
    render(<RewardsPage />);

    await waitFor(() => expect(mockedFetchAdminCatalog).toHaveBeenCalled());

    await user.click(screen.getByRole("button", { name: "grid-edit-first" }));
    expect(screen.getByTestId("reward-modal-open-edit")).toHaveTextContent("true");
    expect(screen.getByTestId("reward-modal-item-edit")).toHaveTextContent("r1");

    await user.click(screen.getByRole("button", { name: "reward-modal-close-edit" }));
    expect(screen.getByTestId("reward-modal-open-edit")).toHaveTextContent("false");

    await user.click(screen.getByRole("button", { name: "grid-restock-first" }));
    expect(screen.getByTestId("restock-open")).toHaveTextContent("true");
    expect(screen.getByTestId("restock-item")).toHaveTextContent("r1");
  });

  test("save handlers close modal and reload data", async () => {
    const user = userEvent.setup();
    render(<RewardsPage />);

    await waitFor(() => expect(mockedFetchAdminCatalog).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole("button", { name: /add reward/i }));
    await user.click(screen.getByRole("button", { name: "reward-modal-save-create" }));

    await waitFor(() => expect(mockedFetchAdminCatalog).toHaveBeenCalledTimes(2));
    expect(screen.getByTestId("reward-modal-open-create")).toHaveTextContent("false");
  });

  test("error from load is passed to grid and retry works", async () => {
    mockedFetchAdminCatalog.mockRejectedValueOnce(new Error("Catalog API failed"));
    const user = userEvent.setup();

    render(<RewardsPage />);

    await waitFor(() => {
      expect(screen.getByTestId("grid-error")).toHaveTextContent("Catalog API failed");
    });

    await user.click(screen.getByRole("button", { name: "grid-retry" }));
    await waitFor(() => expect(mockedFetchAdminCatalog).toHaveBeenCalledTimes(2));
  });
});
