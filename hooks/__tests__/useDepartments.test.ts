import { act, renderHook, waitFor } from "@testing-library/react";
import { useDepartments } from "@/hooks/useDepartments";
import { departmentService } from "@/services/department-service";

jest.mock("@/services/department-service", () => ({
  __esModule: true,
  departmentService: {
    list: jest.fn(),
    listTypes: jest.fn(),
  },
}));

const mockedDepartmentService = departmentService as jest.Mocked<typeof departmentService>;

describe("useDepartments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedDepartmentService.listTypes.mockResolvedValue([
      { department_type_id: "t-1", type_name: "Engineering", is_active: true } as any,
    ]);
    mockedDepartmentService.list.mockResolvedValue({
      data: [{ department_id: "d-1", department_name: "Platform" }],
      pagination: { current_page: 1, per_page: 5, total: 1, total_pages: 1, has_next: false, has_previous: false },
    } as any);
  });

  it("loads department types and departments on mount", async () => {
    const { result } = renderHook(() => useDepartments());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.departments).toHaveLength(1);
    expect(result.current.departmentTypes).toHaveLength(1);
    expect(mockedDepartmentService.list).toHaveBeenCalledWith({ page: 1, limit: 5, search: undefined });
  });

  it("refetches with updated page and search", async () => {
    const { result } = renderHook(() => useDepartments());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      result.current.setSearch("plat");
      result.current.setPage(2);
    });

    await waitFor(() =>
      expect(mockedDepartmentService.list).toHaveBeenLastCalledWith({
        page: 2,
        limit: 5,
        search: "plat",
      })
    );
  });

  it("sets error when list request fails", async () => {
    mockedDepartmentService.list.mockRejectedValueOnce(new Error("failed"));
    const { result } = renderHook(() => useDepartments());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toMatch(/failed/i);
    expect(result.current.departments).toEqual([]);
  });
});

