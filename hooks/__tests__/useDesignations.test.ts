import { act, renderHook, waitFor } from "@testing-library/react";
import { useDesignations } from "@/hooks/useDesignations";
import { designationService } from "@/services/designation-service";

jest.mock("@/services/designation-service", () => ({
  __esModule: true,
  designationService: {
    list: jest.fn(),
  },
}));

const mockedDesignationService = designationService as jest.Mocked<typeof designationService>;

describe("useDesignations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedDesignationService.list.mockResolvedValue({
      data: [{ designation_id: "des-1", designation_name: "Engineer" }],
      pagination: { current_page: 1, per_page: 5, total: 1, total_pages: 1, has_next: false, has_previous: false },
    } as any);
  });

  it("loads designations on mount", async () => {
    const { result } = renderHook(() => useDesignations());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.designations).toHaveLength(1);
    expect(mockedDesignationService.list).toHaveBeenCalledWith({ page: 1, limit: 5 });
  });

  it("refetches when page changes", async () => {
    const { result } = renderHook(() => useDesignations());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      result.current.setPage(3);
    });

    await waitFor(() => expect(mockedDesignationService.list).toHaveBeenLastCalledWith({ page: 3, limit: 5 }));
  });

  it("sets error when request fails", async () => {
    mockedDesignationService.list.mockRejectedValueOnce(new Error("boom"));
    const { result } = renderHook(() => useDesignations());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toMatch(/boom/i);
  });
});

