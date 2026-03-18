import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import ReviewCategoriesPage from "@/app/(admin)/review-categories/page";
import { useReviewCategories } from "@/hooks/useReviewCategories";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children }: any) => <a href={href}>{children}</a>,
}));

jest.mock("@/hooks/useReviewCategories");

jest.mock("@/components/features/admin/review-categories/ReviewCategoryFilters", () => ({
  __esModule: true,
  ReviewCategoryFilters: ({ activeOnly, onFilterChange }: any) => (
    <div data-testid="filters">
      <div data-testid="active-filter">{String(activeOnly)}</div>
      <button onClick={() => onFilterChange(true)}>filter-active</button>
      <button onClick={() => onFilterChange(false)}>filter-inactive</button>
      <button onClick={() => onFilterChange(null)}>filter-all</button>
    </div>
  ),
}));

jest.mock("@/components/features/admin/review-categories/ReviewCategoryTable", () => ({
  __esModule: true,
  ReviewCategoryTable: ({
    categories,
    loading,
    editingId,
    editForm,
    onEdit,
    onToggleActive,
    onUpdate,
    onCancelEdit,
    onEditFormChange,
  }: any) => (
    <div data-testid="table">
      <div data-testid="table-loading">{String(loading)}</div>
      <div data-testid="table-count">{categories.length}</div>
      <div data-testid="table-editing">{editingId ?? "none"}</div>
      <div data-testid="table-edit-form-name">{editForm.category_name}</div>
      <button onClick={() => categories[0] && onEdit(categories[0])}>edit-first</button>
      <button onClick={() => categories[0] && onToggleActive(categories[0])}>toggle-first</button>
      <button onClick={() => onEditFormChange("category_name", "Updated Name")}>
        change-edit-name
      </button>
      <button onClick={() => onEditFormChange("multiplier", "0")}>change-edit-mult-bad</button>
      <button onClick={() => onUpdate(editingId || categories[0]?.category_id)}>update-now</button>
      <button onClick={onCancelEdit}>cancel-edit</button>
    </div>
  ),
}));

jest.mock("@/components/features/admin/review-categories/ReviewCategoryModal", () => ({
  __esModule: true,
  ReviewCategoryModals: ({ showCreate, onCloseCreate, onCreate }: any) => (
    <div data-testid="create-modal">
      <div data-testid="create-open">{String(showCreate)}</div>
      <button onClick={onCloseCreate}>close-create</button>
      <button
        onClick={() =>
          onCreate({
            category_code: "TEAMWORK",
            category_name: "Teamwork",
            multiplier: "1.4",
            description: "Collaboration",
          })
        }
      >
        create-valid
      </button>
      <button
        onClick={() =>
          onCreate({
            category_code: "",
            category_name: "Teamwork",
            multiplier: "1.4",
            description: "",
          })
        }
      >
        create-invalid-code
      </button>
      <button
        onClick={() =>
          onCreate({
            category_code: "TEAMWORK",
            category_name: "",
            multiplier: "1.4",
            description: "",
          })
        }
      >
        create-invalid-name
      </button>
      <button
        onClick={() =>
          onCreate({
            category_code: "TEAMWORK",
            category_name: "Teamwork",
            multiplier: "0",
            description: "",
          })
        }
      >
        create-invalid-mult
      </button>
    </div>
  ),
}));

const mockedUseReviewCategories = useReviewCategories as jest.Mock;

const categories = [
  {
    category_id: "c1",
    category_code: "TEAMWORK",
    category_name: "Teamwork",
    multiplier: 1.4,
    description: "Collaboration",
    is_active: true,
  },
  {
    category_id: "c2",
    category_code: "OWNERSHIP",
    category_name: "Ownership",
    multiplier: 1.2,
    description: "Accountability",
    is_active: false,
  },
];

function makeHookReturn(overrides: Partial<any> = {}) {
  return {
    categories,
    loading: false,
    error: null,
    createCategory: jest.fn(),
    updateCategory: jest.fn(),
    ...overrides,
  };
}

describe("ReviewCategoriesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders header, counts, and table", () => {
    mockedUseReviewCategories.mockReturnValue(makeHookReturn());

    render(<ReviewCategoriesPage />);

    expect(
      screen.getByRole("heading", { name: "Review Categories" })
    ).toBeInTheDocument();
    expect(screen.getByText(/2 total/i)).toBeInTheDocument();
    expect(screen.getByText(/1 active/i)).toBeInTheDocument();
    expect(screen.getByText(/1 inactive/i)).toBeInTheDocument();
    expect(screen.getByTestId("table-count")).toHaveTextContent("2");
  });

  test("shows API error banner when hook has error", () => {
    mockedUseReviewCategories.mockReturnValue(
      makeHookReturn({ error: "Failed to load categories" })
    );

    render(<ReviewCategoriesPage />);

    expect(screen.getByText("Failed to load categories")).toBeInTheDocument();
  });

  test("filter changes trigger hook with new activeOnly value", async () => {
    mockedUseReviewCategories.mockImplementation((activeOnly: boolean | null) =>
      makeHookReturn({ categories: [], loading: false, error: null, activeOnly })
    );

    const user = userEvent.setup();
    render(<ReviewCategoriesPage />);

    expect(mockedUseReviewCategories).toHaveBeenLastCalledWith(null);

    await user.click(screen.getByRole("button", { name: "filter-active" }));
    expect(mockedUseReviewCategories).toHaveBeenLastCalledWith(true);

    await user.click(screen.getByRole("button", { name: "filter-inactive" }));
    expect(mockedUseReviewCategories).toHaveBeenLastCalledWith(false);

    await user.click(screen.getByRole("button", { name: "filter-all" }));
    expect(mockedUseReviewCategories).toHaveBeenLastCalledWith(null);
  });

  test("open create modal from toolbar", async () => {
    mockedUseReviewCategories.mockReturnValue(makeHookReturn());
    const user = userEvent.setup();

    render(<ReviewCategoriesPage />);

    expect(screen.getByTestId("create-open")).toHaveTextContent("false");
    await user.click(screen.getByRole("button", { name: /new category/i }));
    expect(screen.getByTestId("create-open")).toHaveTextContent("true");
  });

  test("create validation errors are shown", async () => {
    mockedUseReviewCategories.mockReturnValue(makeHookReturn());
    const user = userEvent.setup();

    render(<ReviewCategoriesPage />);

    await user.click(screen.getByRole("button", { name: "create-invalid-code" }));
    expect(screen.getByText(/please enter a category code/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "create-invalid-name" }));
    expect(screen.getByText(/please enter a category name/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "create-invalid-mult" }));
    expect(screen.getByText(/valid multiplier greater than 0/i)).toBeInTheDocument();
  });

  test("creates category successfully", async () => {
    const hook = makeHookReturn();
    hook.createCategory.mockResolvedValueOnce({});
    mockedUseReviewCategories.mockReturnValue(hook);
    const user = userEvent.setup();

    render(<ReviewCategoriesPage />);

    await user.click(screen.getByRole("button", { name: /new category/i }));
    await user.click(screen.getByRole("button", { name: "create-valid" }));

    await waitFor(() => expect(hook.createCategory).toHaveBeenCalled());

    expect(hook.createCategory).toHaveBeenCalledWith({
      category_code: "TEAMWORK",
      category_name: "Teamwork",
      multiplier: 1.4,
      description: "Collaboration",
    });

    expect(screen.getByText(/category created successfully/i)).toBeInTheDocument();
    expect(screen.getByTestId("create-open")).toHaveTextContent("false");
  });

  test("create error shows extracted error message", async () => {
    const hook = makeHookReturn();
    hook.createCategory.mockRejectedValueOnce(new Error("Duplicate category code"));
    mockedUseReviewCategories.mockReturnValue(hook);
    const user = userEvent.setup();

    render(<ReviewCategoriesPage />);

    await user.click(screen.getByRole("button", { name: "create-valid" }));

    expect(
      await screen.findByText(/duplicate category code/i)
    ).toBeInTheDocument();
  });

  test("start edit, update success, and cancel edit", async () => {
    const hook = makeHookReturn();
    hook.updateCategory.mockResolvedValueOnce({});
    mockedUseReviewCategories.mockReturnValue(hook);
    const user = userEvent.setup();

    render(<ReviewCategoriesPage />);

    await user.click(screen.getByRole("button", { name: "edit-first" }));
    expect(screen.getByTestId("table-editing")).toHaveTextContent("c1");
    expect(screen.getByTestId("table-edit-form-name")).toHaveTextContent("Teamwork");

    await user.click(screen.getByRole("button", { name: "change-edit-name" }));
    await user.click(screen.getByRole("button", { name: "update-now" }));

    await waitFor(() => expect(hook.updateCategory).toHaveBeenCalled());

    expect(hook.updateCategory).toHaveBeenCalledWith("c1", {
      category_code: "TEAMWORK",
      category_name: "Updated Name",
      multiplier: 1.4,
      description: "Collaboration",
      is_active: true,
    });

    expect(screen.getByText(/category updated successfully/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "cancel-edit" }));
    expect(screen.getByTestId("table-editing")).toHaveTextContent("none");
  });

  test("update validation for multiplier is enforced", async () => {
    const hook = makeHookReturn();
    mockedUseReviewCategories.mockReturnValue(hook);
    const user = userEvent.setup();

    render(<ReviewCategoriesPage />);

    await user.click(screen.getByRole("button", { name: "edit-first" }));
    await user.click(screen.getByRole("button", { name: "change-edit-mult-bad" }));
    await user.click(screen.getByRole("button", { name: "update-now" }));

    expect(
      screen.getByText(/valid multiplier greater than 0/i)
    ).toBeInTheDocument();
    expect(hook.updateCategory).not.toHaveBeenCalled();
  });

  test("toggle active updates state and shows success flash", async () => {
    const hook = makeHookReturn();
    hook.updateCategory.mockResolvedValueOnce({});
    mockedUseReviewCategories.mockReturnValue(hook);
    const user = userEvent.setup();

    render(<ReviewCategoriesPage />);

    await user.click(screen.getByRole("button", { name: "toggle-first" }));

    await waitFor(() => expect(hook.updateCategory).toHaveBeenCalled());

    expect(hook.updateCategory).toHaveBeenCalledWith("c1", { is_active: false });
    expect(screen.getByText(/deactivated successfully/i)).toBeInTheDocument();
  });
});
