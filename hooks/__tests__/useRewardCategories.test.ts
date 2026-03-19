import { act, renderHook, waitFor } from "@testing-library/react";
import { useRewardCategories } from "@/hooks/useRewardCategories";

jest.mock("@/lib/api-utils", () => {
  const mockClient = { get: jest.fn() };
  return {
    __esModule: true,
    createAuthenticatedClient: () => mockClient,
    __mockClient: mockClient,
  };
});

const { __mockClient: mockClient } = jest.requireMock("@/lib/api-utils") as {
  __mockClient: { get: jest.Mock };
};

describe("useRewardCategories", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient.get.mockResolvedValue({
      data: [
        { category_id: "c1", category_name: "Vouchers", category_code: "VOUCHER", is_active: true },
        { category_id: "c2", category_name: "Merch", category_code: "MERCH", is_active: false },
      ],
    });
  });

  it("loads and filters categories", async () => {
    const { result } = renderHook(() => useRewardCategories());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.categories).toHaveLength(2);
    expect(result.current.activeCount).toBe(1);

    act(() => {
      result.current.setFilterState("active");
    });
    expect(result.current.filtered).toHaveLength(1);

    act(() => {
      result.current.setSearch("merch");
      result.current.setFilterState("all");
    });
    expect(result.current.filtered).toHaveLength(1);
  });

  it("handles modal open/close and save refresh", async () => {
    const { result } = renderHook(() => useRewardCategories());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.openCreate();
    });
    expect(result.current.modal).toBe("create");

    act(() => {
      result.current.openEdit(result.current.categories[0]);
    });
    expect(result.current.modal).toBe("edit");
    expect(result.current.selected?.category_id).toBe("c1");

    await act(async () => {
      result.current.handleSaved();
    });
    await waitFor(() => expect(mockClient.get).toHaveBeenCalledTimes(2));
    expect(result.current.modal).toBeNull();
  });
});

