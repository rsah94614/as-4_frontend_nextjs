jest.mock("@/lib/api-utils", () => {
  const mockClient = jest.fn();
  return {
    __esModule: true,
    createAuthenticatedClient: () => mockClient,
    __mockClient: mockClient,
  };
});

import { rolesApi, employeeRolesApi, routePermissionsApi } from "@/services/roles-service";

const { __mockClient: mockClient } = jest.requireMock("@/lib/api-utils") as {
  __mockClient: jest.Mock;
};

describe("roles-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls list and create role endpoints", async () => {
    mockClient.mockResolvedValueOnce({ data: [{ role_id: "r1" }] });
    const listed = await rolesApi.listRoles();

    mockClient.mockResolvedValueOnce({ data: { role_id: "r2" } });
    const created = await rolesApi.createRole({
      role_name: "HR Admin",
      role_code: "HR_ADMIN",
      description: "desc",
    });

    expect(mockClient).toHaveBeenNthCalledWith(1, { url: "/list", method: "GET", data: undefined });
    expect(mockClient).toHaveBeenNthCalledWith(2, {
      url: "/create",
      method: "POST",
      data: { role_name: "HR Admin", role_code: "HR_ADMIN", description: "desc" },
    });
    expect(listed).toEqual([{ role_id: "r1" }]);
    expect(created).toEqual({ role_id: "r2" });
  });

  it("calls employee-role and route-permission endpoints", async () => {
    mockClient
      .mockResolvedValueOnce({ data: [{ employee_role_id: "er1" }] })
      .mockResolvedValueOnce({ data: { employee_role_id: "er2" } })
      .mockResolvedValueOnce({ data: [{ route_key: "admin.roles" }] });

    const employees = await employeeRolesApi.listEmployeeRoles();
    const assigned = await employeeRolesApi.assignRole({ employee_id: "e1", role_id: "r1" });
    const routes = await routePermissionsApi.listRoutePermissions();

    expect(employees).toEqual([{ employee_role_id: "er1" }]);
    expect(assigned).toEqual({ employee_role_id: "er2" });
    expect(routes).toEqual([{ route_key: "admin.roles" }]);
  });
});

