import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import LoginPage from "@/app/(auth)/login/page";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: jest.fn(),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img {...props} alt={props.alt || "img"} />,
}));

jest.mock("@/providers/AuthProvider", () => ({
  __esModule: true,
  useAuth: jest.fn(),
}));

const mockedUseAuth = useAuth as jest.Mock;
const mockedUseRouter = useRouter as jest.Mock;

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({ push: jest.fn() });
    mockedUseAuth.mockReturnValue({
      loginUser: jest.fn(),
      isAuthenticated: false,
      loading: false,
    });
  });

  test("renders login form", () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("shows email validation error", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: /login/i }));
    expect(screen.getByText(/email address is required/i)).toBeInTheDocument();
  });

  test("shows password validation error", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText(/enter your email/i), "user@test.com");
    await user.type(screen.getByPlaceholderText(/enter password/i), "short");
    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(screen.getByText(/at least 8 characters required/i)).toBeInTheDocument();
  });

  test("calls loginUser with valid credentials", async () => {
    const user = userEvent.setup();
    const loginUser = jest.fn().mockResolvedValue(null);
    const push = jest.fn();

    mockedUseRouter.mockReturnValue({ push });
    mockedUseAuth.mockReturnValue({
      loginUser,
      isAuthenticated: false,
      loading: false,
    });

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText(/enter your email/i), "user@test.com");
    await user.type(screen.getByPlaceholderText(/enter password/i), "Password1");
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => expect(loginUser).toHaveBeenCalledWith("user@test.com", "Password1"));
    expect(push).toHaveBeenCalledWith("/dashboard");
  });

  test("shows backend error when login fails", async () => {
    const user = userEvent.setup();
    const loginUser = jest.fn().mockResolvedValue("Invalid credentials");

    mockedUseAuth.mockReturnValue({
      loginUser,
      isAuthenticated: false,
      loading: false,
    });

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText(/enter your email/i), "user@test.com");
    await user.type(screen.getByPlaceholderText(/enter password/i), "Password1");
    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });

  test("redirects when already authenticated", async () => {
    const push = jest.fn();

    mockedUseRouter.mockReturnValue({ push });
    mockedUseAuth.mockReturnValue({
      loginUser: jest.fn(),
      isAuthenticated: true,
      loading: false,
    });

    render(<LoginPage />);

    await waitFor(() => expect(push).toHaveBeenCalledWith("/dashboard"));
  });

  test("shows loading spinner when auth state loading", () => {
    mockedUseAuth.mockReturnValue({
      loginUser: jest.fn(),
      isAuthenticated: false,
      loading: true,
    });

    render(<LoginPage />);
    expect(
  document.querySelector(".min-h-screen.flex.items-center.justify-center")
).toBeInTheDocument();

  });
});
