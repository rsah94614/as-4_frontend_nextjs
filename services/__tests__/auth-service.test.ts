jest.mock("axios", () => {
  const mockAxios = { post: jest.fn() };
  return {
    __esModule: true,
    default: mockAxios,
    __mockAxios: mockAxios,
  };
});

jest.mock("@/services/api-client", () => {
  const mockAxiosClient = Object.assign(jest.fn(), { post: jest.fn() });
  return {
    __esModule: true,
    default: mockAxiosClient,
    __mockAxiosClient: mockAxiosClient,
  };
});

jest.mock("@/lib/error-utils", () => ({
  __esModule: true,
  createErrorResponse: jest.fn(() => ({ success: false, error: "mapped error" })),
  extractErrorMessage: jest.fn((e: unknown, fallback?: string) => {
    if (e instanceof Error) return e.message;
    return fallback ?? "error";
  }),
}));

import {
  auth,
  login,
  forgotPassword,
  resetPassword,
  fetchWithAuth,
} from "@/services/auth-service";

const { __mockAxios: mockAxios } = jest.requireMock("axios") as {
  __mockAxios: { post: jest.Mock };
};
const { __mockAxiosClient: mockAxiosClient } = jest.requireMock("@/services/api-client") as {
  __mockAxiosClient: jest.Mock & { post: jest.Mock };
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("auth-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("stores token data and computes auth state", () => {
    auth.setTokens("a1", "r1", { employee_id: "e1" }, 60);
    expect(auth.getAccessToken()).toBe("a1");
    expect(auth.getRefreshToken()).toBe("r1");
    expect(auth.getUser()).toEqual({ employee_id: "e1" });
    expect(auth.isAuthenticated()).toBe(true);
  });

  it("deduplicates concurrent refresh requests", async () => {
    localStorage.setItem("refresh_token", "r1");
    const d = deferred<{ data: { access_token: string; refresh_token: string; employee: {}; expires_in: number } }>();
    mockAxios.post.mockReturnValueOnce(d.promise);

    const p1 = auth.refreshAccessToken();
    const p2 = auth.refreshAccessToken();
    d.resolve({ data: { access_token: "a2", refresh_token: "r2", employee: {}, expires_in: 60 } });

    const [v1, v2] = await Promise.all([p1, p2]);
    expect(v1).toBe(true);
    expect(v2).toBe(true);
    expect(mockAxios.post).toHaveBeenCalledTimes(1);
    expect(auth.getAccessToken()).toBe("a2");
  });

  it("logs in and maps auth-related API helpers", async () => {
    mockAxiosClient.post
      .mockResolvedValueOnce({
        data: { access_token: "a3", refresh_token: "r3", employee: { employee_id: "e2" }, expires_in: 60 },
      })
      .mockResolvedValueOnce({ data: { ok: true } })
      .mockResolvedValueOnce({ data: { ok: true } });

    const loginRes = await login("u@test.com", "Pass1234");
    const forgotRes = await forgotPassword("u@test.com");
    const resetRes = await resetPassword("token", "Pass12345");

    expect(loginRes.success).toBe(true);
    expect(forgotRes.success).toBe(true);
    expect(resetRes.success).toBe(true);
    expect(auth.getRefreshToken()).toBe("r3");
  });

  it("maps axios errors in fetchWithAuth", async () => {
    mockAxiosClient.mockRejectedValueOnce({
      response: {
        status: 401,
        data: { detail: "Unauthorized" },
        headers: { "x-test": "1" },
      },
    });

    const res = await fetchWithAuth("/me");
    expect(res.ok).toBe(false);
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ detail: "Unauthorized" });
  });

  it("clears tokens on logout", async () => {
    localStorage.setItem("refresh_token", "r4");
    auth.setTokens("a4", "r4", { employee_id: "e4" }, 60);
    mockAxiosClient.post.mockResolvedValueOnce({ data: { ok: true } });

    await auth.logout();
    expect(mockAxiosClient.post).toHaveBeenCalledWith("/logout", { refresh_token: "r4" });
    expect(auth.getAccessToken()).toBeNull();
    expect(auth.getRefreshToken()).toBeNull();
  });
});

