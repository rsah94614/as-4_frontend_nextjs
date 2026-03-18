import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import ForgotPasswordPage from "@/app/(auth)/forgot-password/page";
import { forgotPassword } from "@/services/auth-service";

jest.mock("@/services/auth-service", () => ({
  __esModule: true,
  forgotPassword: jest.fn(),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img {...props} alt={props.alt || "img"} />,
}));

const mockedForgotPassword = forgotPassword as jest.Mock;

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders forgot password form", () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send reset link/i })).toBeInTheDocument();
  });

  test("shows required email validation error", async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordPage />);

    await user.click(screen.getByRole("button", { name: /send reset link/i }));
    expect(screen.getByText(/email address is required/i)).toBeInTheDocument();
  });

  test("shows invalid email validation error", async () => {
  const user = userEvent.setup();
  render(<ForgotPasswordPage />);

  const emailInput = screen.getByPlaceholderText(/enter your email/i);

  await user.type(emailInput, "abc");
  await user.tab(); // sets touched=true on blur
  await user.type(emailInput, "d"); // triggers handleEmailChange with touched=true

  expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
});


  test("calls forgotPassword and shows success state", async () => {
    const user = userEvent.setup();
    mockedForgotPassword.mockResolvedValueOnce({ success: true });

    render(<ForgotPasswordPage />);

    await user.type(screen.getByPlaceholderText(/enter your email/i), "user@test.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    expect(mockedForgotPassword).toHaveBeenCalledWith("user@test.com");
    expect(await screen.findByText(/check your email/i)).toBeInTheDocument();
    expect(screen.getByText(/we've sent a password reset link/i)).toBeInTheDocument();
  });

  test("shows service error when forgotPassword returns failure", async () => {
    const user = userEvent.setup();
    mockedForgotPassword.mockResolvedValueOnce({
      success: false,
      error: "No account found",
    });

    render(<ForgotPasswordPage />);

    await user.type(screen.getByPlaceholderText(/enter your email/i), "user@test.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    expect(await screen.findByText(/no account found/i)).toBeInTheDocument();
  });

  test("shows network error when request throws", async () => {
    const user = userEvent.setup();
    mockedForgotPassword.mockRejectedValueOnce(new Error("network down"));

    render(<ForgotPasswordPage />);

    await user.type(screen.getByPlaceholderText(/enter your email/i), "user@test.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    expect(
      await screen.findByText(/network error\. please check your connection/i)
    ).toBeInTheDocument();
  });

  test("send another email resets success state", async () => {
    const user = userEvent.setup();
    mockedForgotPassword.mockResolvedValueOnce({ success: true });

    render(<ForgotPasswordPage />);

    await user.type(screen.getByPlaceholderText(/enter your email/i), "user@test.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));
    expect(await screen.findByText(/check your email/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /send another email/i }));

    expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your email/i)).toHaveValue("");
  });
});
