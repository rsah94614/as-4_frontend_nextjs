import { renderHook } from "@testing-library/react";
import { useReviewerWeight } from "@/hooks/useReviewerWeight";
import { getRolesFromToken } from "@/lib/role-utils";

jest.mock("@/lib/role-utils", () => ({
  __esModule: true,
  getRolesFromToken: jest.fn(),
}));

const mockedGetRolesFromToken = getRolesFromToken as jest.MockedFunction<typeof getRolesFromToken>;

describe("useReviewerWeight", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns manager weight for MANAGER role", () => {
    mockedGetRolesFromToken.mockReturnValue(["MANAGER"]);
    const { result } = renderHook(() => useReviewerWeight());

    expect(result.current.weight).toBe(1.3);
    expect(result.current.roleCode).toBe("MANAGER");
  });

  it("uses highest weight when multiple roles are present", () => {
    mockedGetRolesFromToken.mockReturnValue(["EMPLOYEE", "SUPER_ADMIN"]);
    const { result } = renderHook(() => useReviewerWeight());

    expect(result.current.weight).toBe(1.5);
    expect(result.current.roleCode).toBe("EMPLOYEE");
  });

  it("falls back to default weight when no roles are present", () => {
    mockedGetRolesFromToken.mockReturnValue([]);
    const { result } = renderHook(() => useReviewerWeight());

    expect(result.current.weight).toBe(1.0);
    expect(result.current.roleCode).toBeNull();
  });
});

