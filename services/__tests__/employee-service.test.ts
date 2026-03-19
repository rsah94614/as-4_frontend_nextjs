jest.mock("@/lib/api-utils", () => {
  const mockClient = { get: jest.fn() };
  const mockRequireUserId = jest.fn();
  return {
    __esModule: true,
    createAuthenticatedClient: () => mockClient,
    requireAuthenticatedUserId: mockRequireUserId,
    __mockApi: { mockClient, mockRequireUserId },
  };
});

import {
  employeeService,
  getTeamMembersForUI,
  detailToTeamMember,
  listItemToTeamMember,
} from "@/services/employee-service";

const { __mockApi } = jest.requireMock("@/lib/api-utils") as {
  __mockApi: {
    mockClient: { get: jest.Mock };
    mockRequireUserId: jest.Mock;
  };
};

describe("employee-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("gets one employee and lists employees", async () => {
    __mockApi.mockClient.get
      .mockResolvedValueOnce({ data: { employee_id: "e1" } })
      .mockResolvedValueOnce({ data: { data: [], pagination: { total: 0 } } });

    const one = await employeeService.getEmployee("e1");
    await employeeService.listEmployees({ manager_id: "m1", limit: 100, is_active: true });

    expect(__mockApi.mockClient.get).toHaveBeenNthCalledWith(1, "/e1");
    expect(__mockApi.mockClient.get).toHaveBeenNthCalledWith(
      2,
      "/list?limit=100&manager_id=m1&is_active=true"
    );
    expect(one).toEqual({ employee_id: "e1" });
  });

  it("maps employee types into team-member shape", () => {
    expect(
      detailToTeamMember({
        employee_id: "e1",
        username: "Alice",
        email: "a@test.com",
        is_active: true,
        date_of_joining: "",
        created_at: "",
        designation: { designation_name: "Engineer" } as any,
      })
    ).toEqual({ id: "e1", name: "Alice", email: "a@test.com", designation: "Engineer" });

    expect(
      listItemToTeamMember({
        employee_id: "e2",
        username: "Bob",
        email: "b@test.com",
        designation_name: "Manager",
        is_active: true,
        date_of_joining: "",
        created_at: "",
      })
    ).toEqual({ id: "e2", name: "Bob", email: "b@test.com", designation: "Manager" });
  });

  it("builds team members for manager flow", async () => {
    __mockApi.mockRequireUserId.mockReturnValue("me-1");
    jest.spyOn(employeeService, "getEmployee")
      .mockResolvedValueOnce({
        employee_id: "me-1",
        username: "Me",
        email: "me@test.com",
        is_active: true,
        date_of_joining: "",
        created_at: "",
        manager: { employee_id: "mgr-1", username: "Mgr", email: "mgr@test.com" },
      } as any)
      .mockResolvedValueOnce({
        employee_id: "mgr-1",
        username: "Manager",
        email: "mgr@test.com",
        is_active: true,
        date_of_joining: "",
        created_at: "",
      } as any);
    jest.spyOn(employeeService, "listEmployees").mockResolvedValueOnce({
      data: [
        { employee_id: "me-1", username: "Me", email: "me@test.com", is_active: true, date_of_joining: "", created_at: "" },
        { employee_id: "u2", username: "Colleague", email: "c@test.com", is_active: true, date_of_joining: "", created_at: "" },
      ],
      pagination: {},
    });

    const out = await getTeamMembersForUI();
    expect(out.loggedInUser.id).toBe("me-1");
    expect(out.teamLeader?.id).toBe("mgr-1");
    expect(out.teamMembers.map((m) => m.id)).toEqual(["u2"]);
  });
});

