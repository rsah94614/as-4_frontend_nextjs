import { act, renderHook, waitFor } from "@testing-library/react";
import { useReviewCategories } from "@/hooks/useReviewCategories";

jest.mock("@/lib/api-utils", () => {
  const mockClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  };
  return {
    __esModule: true,
    createAuthenticatedClient: () => mockClient,
    __mockClient: mockClient,
  };
});

const { __mockClient: mockClient } = jest.requireMock("@/lib/api-utils") as {
  __mockClient: { get: jest.Mock; post: jest.Mock; put: jest.Mock };
};

describe("useReviewCategories", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient.get.mockResolvedValue({
      data: {
        data: [{ category_id: "r1", category_name: "Appreciation", category_code: "APP", multiplier: 1.2, is_active: true }],
      },
    });
    mockClient.post.mockResolvedValue({ data: { category_id: "r2" } });
    mockClient.put.mockResolvedValue({ data: { category_id: "r1", category_name: "Updated" } });
  });

  it("fetches categories with activeOnly filter", async () => {
    const { result } = renderHook(() => useReviewCategories(true));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.categories).toHaveLength(1);
    expect(mockClient.get).toHaveBeenCalledWith("/api/proxy/recognition/review-categories", {
      params: { page: "1", page_size: "100", active_only: "true" },
    });
  });

  it("creates and updates a category then refetches", async () => {
    const { result } = renderHook(() => useReviewCategories());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createCategory({
        category_code: "NEW",
        category_name: "New",
        multiplier: 1.1,
      } as any);
    });
    expect(mockClient.post).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.updateCategory("r1", { category_name: "Updated" });
    });
    expect(mockClient.put).toHaveBeenCalledWith(
      "/api/proxy/recognition/review-categories/r1",
      { category_name: "Updated" }
    );
    expect(mockClient.get).toHaveBeenCalledTimes(3);
  });
});

