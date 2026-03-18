import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import CategoriesPage from "@/app/(admin)/reward-categories/page";
import { useRewardCategories } from "@/hooks/useRewardCategories";

jest.mock("@/hooks/useRewardCategories");

jest.mock("@/components/features/admin/rewards/UIHelpers", () => ({
  __esModule: true,
  RewardStats: ({ total, active, inactive }: any) => (
    <div data-testid="reward-stats">
      total:{total}|active:{active}|inactive:{inactive}
    </div>
  ),
}));

jest.mock("@/components/features/admin/rewards/CategoryTable", () => ({
  __esModule: true,
  CategoryTable: ({ categories, loading, filterState, onEdit, openCreate }: any) => (
    <div data-testid="category-table">
      <div data-testid="table-loading">{String(loading)}</div>
      <div data-testid="table-count">{categories.length}</div>
      <div data-testid="table-filter">{filterState}</div>
      <button onClick={openCreate}>table-open-create</button>
      <button onClick={() => categories[0] && onEdit(categories[0])}>table-edit-first</button>
    </div>
  ),
}));

jest.mock("@/components/features/admin/rewards/CategoryModal", () => ({
  __esModule: true,
  CategoryModal: ({ isOpen, category, onClose, onSave }: any) => (
    <div data-testid="category-modal">
      <div data-testid="modal-open">{String(isOpen)}</div>
      <div data-testid="modal-category">{category?.category_id ?? "none"}</div>
      <button onClick={onClose}>modal-close</button>
      <button onClick={onSave}>modal-save</button>
    </div>
  ),
}));

const mockedUseRewardCategories = useRewardCategories as jest.Mock;

const categories = [
  {
    category_id: "c1",
    category_name: "Gift Cards",
    category_code: "CAT-GIFT",
    description: "Gift card category",
    is_active: true,
    created_at: "2026-03-01T00:00:00.000Z",
  },
  {
    category_id: "c2",
    category_name: "Merch",
    category_code: "CAT-MERCH",
    description: "Merch category",
    is_active: false,
    created_at: "2026-03-02T00:00:00.000Z",
  },
];

function makeHookReturn(overrides: Partial<any> = {}) {
  return {
    categories,
    filtered: categories,
    loading: false,
    error: null,
    search: "",
    setSearch: jest.fn(),
    filterState: "all",
    setFilterState: jest.fn(),
    activeCount: 1,
    modal: null,
    selected: undefined,
    openCreate: jest.fn(),
    openEdit: jest.fn(),
    closeModal: jest.fn(),
    handleSaved: jest.fn(),
    refresh: jest.fn(),
    ...overrides,
  };
}

describe("CategoriesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders header, stats, and table", () => {
    mockedUseRewardCategories.mockReturnValue(makeHookReturn());

    render(<CategoriesPage />);

    expect(
      screen.getByRole("heading", { name: "Reward Categories" })
    ).toBeInTheDocument();

    expect(screen.getByTestId("reward-stats")).toHaveTextContent(
      "total:2|active:1|inactive:1"
    );
    expect(screen.getByTestId("table-count")).toHaveTextContent("2");
    expect(screen.getByTestId("table-filter")).toHaveTextContent("all");
  });

  test("hides stats when loading", () => {
    mockedUseRewardCategories.mockReturnValue(makeHookReturn({ loading: true }));

    render(<CategoriesPage />);

    expect(screen.queryByTestId("reward-stats")).not.toBeInTheDocument();
    expect(screen.getByTestId("table-loading")).toHaveTextContent("true");
  });

  test("shows error banner and retry calls refresh", async () => {
    const hook = makeHookReturn({ error: "Failed to load categories" });
    mockedUseRewardCategories.mockReturnValue(hook);
    const user = userEvent.setup();

    render(<CategoriesPage />);

    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText("Failed to load categories")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /retry/i }));
    expect(hook.refresh).toHaveBeenCalledTimes(1);
  });

  test("search input calls setSearch", async () => {
    const hook = makeHookReturn();
    mockedUseRewardCategories.mockReturnValue(hook);
    const user = userEvent.setup();

    render(<CategoriesPage />);

    await user.type(
      screen.getByPlaceholderText(/search by name or code/i),
      "gift"
    );

    expect(hook.setSearch).toHaveBeenCalledWith("g");
    expect(hook.setSearch).toHaveBeenCalledWith("i");
    expect(hook.setSearch).toHaveBeenCalledWith("f");
    expect(hook.setSearch).toHaveBeenCalledWith("t");
  });

  test("clear button appears when search exists and clears", async () => {
    const hook = makeHookReturn({ search: "gift" });
    mockedUseRewardCategories.mockReturnValue(hook);
    const user = userEvent.setup();

    render(<CategoriesPage />);

    await user.click(screen.getByRole("button", { name: "" })); // clear icon button
    expect(hook.setSearch).toHaveBeenCalledWith("");
  });

  test("status filter select calls setFilterState", async () => {
    const hook = makeHookReturn();
    mockedUseRewardCategories.mockReturnValue(hook);
    const user = userEvent.setup();

    render(<CategoriesPage />);

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "inactive");

    expect(hook.setFilterState).toHaveBeenCalledWith("inactive");
  });

  test("Add Category button calls openCreate", async () => {
    const hook = makeHookReturn();
    mockedUseRewardCategories.mockReturnValue(hook);
    const user = userEvent.setup();

    render(<CategoriesPage />);

    await user.click(screen.getByRole("button", { name: /add category/i }));
    expect(hook.openCreate).toHaveBeenCalledTimes(1);
  });

  test("table callbacks call openCreate and openEdit", async () => {
    const hook = makeHookReturn();
    mockedUseRewardCategories.mockReturnValue(hook);
    const user = userEvent.setup();

    render(<CategoriesPage />);

    await user.click(screen.getByRole("button", { name: "table-open-create" }));
    expect(hook.openCreate).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "table-edit-first" }));
    expect(hook.openEdit).toHaveBeenCalledWith(categories[0]);
  });

  test("renders modal when modal state exists and wires close/save", async () => {
    const hook = makeHookReturn({
      modal: "edit",
      selected: categories[1],
    });
    mockedUseRewardCategories.mockReturnValue(hook);
    const user = userEvent.setup();

    render(<CategoriesPage />);

    expect(screen.getByTestId("category-modal")).toBeInTheDocument();
    expect(screen.getByTestId("modal-open")).toHaveTextContent("true");
    expect(screen.getByTestId("modal-category")).toHaveTextContent("c2");

    await user.click(screen.getByRole("button", { name: "modal-close" }));
    expect(hook.closeModal).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "modal-save" }));
    expect(hook.handleSaved).toHaveBeenCalledTimes(1);
  });
});
