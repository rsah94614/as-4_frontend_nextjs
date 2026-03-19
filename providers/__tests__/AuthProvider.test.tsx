import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { auth, login } from "@/services/auth-service";

jest.mock("@/services/auth-service", () => ({
  __esModule: true,
  auth: {
    isAuthenticated: jest.fn(),
    getRefreshToken: jest.fn(),
    refreshAccessToken: jest.fn(),
    getUser: jest.fn(),
    getAccessToken: jest.fn(),
    clearTokens: jest.fn(),
    logout: jest.fn(),
  },
  login: jest.fn(),
}));

const mockedAuth = auth as jest.Mocked<typeof auth>;
const mockedLogin = login as jest.MockedFunction<typeof login>;

function makeToken(payload: Record<string, unknown>) {
  const encoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  return `header.${encoded}.signature`;
}

function AuthProbe() {
  const { user, loading, isAuthenticated, loginUser, logoutUser } = useAuth();
  const [loginResult, setLoginResult] = useState("");

  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="authenticated">{String(isAuthenticated)}</div>
      <div data-testid="username">{user?.username ?? ""}</div>
      <div data-testid="roles">{user?.roles?.join(",") ?? ""}</div>
      <div data-testid="login-result">{loginResult}</div>
      <button
        onClick={async () => {
          const result = await loginUser("user@test.com", "Password1");
          setLoginResult(result ?? "ok");
        }}
      >
        login
      </button>
      <button onClick={() => logoutUser()}>logout</button>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAuth.isAuthenticated.mockReturnValue(false);
    mockedAuth.getRefreshToken.mockReturnValue(null);
    mockedAuth.refreshAccessToken.mockResolvedValue(false);
    mockedAuth.getUser.mockReturnValue(null);
    mockedAuth.getAccessToken.mockReturnValue(null);
    mockedAuth.clearTokens.mockImplementation(() => {});
    mockedAuth.logout.mockResolvedValue(undefined);
    mockedLogin.mockResolvedValue({ success: false, error: "Login failed" });
  });

  it("rehydrates user when access token is already valid", async () => {
    mockedAuth.isAuthenticated.mockReturnValue(true);
    mockedAuth.getUser.mockReturnValue({
      employee_id: "1",
      username: "alice",
      email: "alice@test.com",
      designation_id: null,
      department_id: null,
      roles: ["SUPER_ADMIN"],
    });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
    expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    expect(screen.getByTestId("username")).toHaveTextContent("alice");
    expect(screen.getByTestId("roles")).toHaveTextContent("SUPER_ADMIN");
    expect(mockedAuth.refreshAccessToken).not.toHaveBeenCalled();
  });

  it("falls back to JWT role claims when stored user has no roles", async () => {
    mockedAuth.isAuthenticated.mockReturnValue(true);
    mockedAuth.getUser.mockReturnValue({
      employee_id: "2",
      username: "bob",
      email: "bob@test.com",
      designation_id: null,
      department_id: null,
    } as any);
    mockedAuth.getAccessToken.mockReturnValue(makeToken({ role_codes: ["EMPLOYEE"] }));

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
    expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    expect(screen.getByTestId("roles")).toHaveTextContent("EMPLOYEE");
  });

  it("tries silent refresh when access token is expired and refresh token exists", async () => {
    mockedAuth.getRefreshToken.mockReturnValue("refresh-token");
    mockedAuth.refreshAccessToken.mockResolvedValue(true);
    mockedAuth.getUser.mockReturnValue({
      employee_id: "3",
      username: "carol",
      email: "carol@test.com",
      designation_id: null,
      department_id: null,
    } as any);
    mockedAuth.getAccessToken.mockReturnValue(makeToken({ role: "MANAGER" }));

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() => expect(mockedAuth.refreshAccessToken).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
    expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    expect(screen.getByTestId("roles")).toHaveTextContent("MANAGER");
  });

  it("returns backend error from loginUser when login fails", async () => {
    mockedLogin.mockResolvedValue({ success: false, error: "Invalid credentials" });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
    fireEvent.click(screen.getByRole("button", { name: "login" }));

    await waitFor(() => expect(screen.getByTestId("login-result")).toHaveTextContent("Invalid credentials"));
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
  });

  it("sets authenticated user after successful login", async () => {
    mockedLogin.mockResolvedValue({ success: true, data: {} as any });
    mockedAuth.getUser.mockReturnValue({
      employee_id: "4",
      username: "dana",
      email: "dana@test.com",
      designation_id: null,
      department_id: null,
    } as any);
    mockedAuth.getAccessToken.mockReturnValue(makeToken({ roles: ["HR_ADMIN"] }));

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
    fireEvent.click(screen.getByRole("button", { name: "login" }));

    await waitFor(() => expect(mockedLogin).toHaveBeenCalledWith("user@test.com", "Password1"));
    await waitFor(() => expect(screen.getByTestId("login-result")).toHaveTextContent("ok"));
    expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    expect(screen.getByTestId("username")).toHaveTextContent("dana");
    expect(screen.getByTestId("roles")).toHaveTextContent("HR_ADMIN");
  });

  it("clears local auth state and tokens when logging out", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    mockedAuth.isAuthenticated.mockReturnValue(true);
    mockedAuth.getUser.mockReturnValue({
      employee_id: "5",
      username: "eric",
      email: "eric@test.com",
      designation_id: null,
      department_id: null,
      roles: ["EMPLOYEE"],
    });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId("authenticated")).toHaveTextContent("true"));
    fireEvent.click(screen.getByRole("button", { name: "logout" }));

    await waitFor(() => expect(mockedAuth.clearTokens).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockedAuth.logout).toHaveBeenCalledTimes(1));
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("username")).toHaveTextContent("");
    consoleErrorSpy.mockRestore();
  });
});
