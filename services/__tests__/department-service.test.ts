jest.mock("@/lib/api-utils", () => {
  const mockClient = { get: jest.fn(), post: jest.fn(), put: jest.fn() };
  return {
    __esModule: true,
    createAuthenticatedClient: () => mockClient,
    __mockClient: mockClient,
  };
});

import { departmentService } from "@/services/department-service";

const { __mockClient: mockClient } = jest.requireMock("@/lib/api-utils") as {
  __mockClient: { get: jest.Mock; post: jest.Mock; put: jest.Mock };
};

describe("department-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lists departments with default pagination", async () => {
    mockClient.get.mockResolvedValueOnce({ data: { data: [], pagination: { total: 0 } } });
    await departmentService.list();

    expect(mockClient.get).toHaveBeenCalledWith("/departments", {
      params: { page: 1, limit: 20 },
    });
  });

  it("creates and updates department", async () => {
    mockClient.post.mockResolvedValueOnce({ data: { department_id: "d1" } });
    mockClient.put.mockResolvedValueOnce({ data: { department_id: "d1", department_name: "Eng" } });

    const created = await departmentService.create({
      department_name: "Engineering",
      department_code: "ENG",
      department_type_id: "t1",
    });
    const updated = await departmentService.update("d1", { department_name: "Eng" });

    expect(created).toEqual({ department_id: "d1" });
    expect(updated).toEqual({ department_id: "d1", department_name: "Eng" });
  });

  it("supports both listTypes response shapes", async () => {
    mockClient.get.mockResolvedValueOnce({ data: [{ department_type_id: "t1" }] });
    const plain = await departmentService.listTypes();

    mockClient.get.mockResolvedValueOnce({ data: { data: [{ department_type_id: "t2" }] } });
    const wrapped = await departmentService.listTypes();

    expect(plain).toEqual([{ department_type_id: "t1" }]);
    expect(wrapped).toEqual([{ department_type_id: "t2" }]);
  });
});

