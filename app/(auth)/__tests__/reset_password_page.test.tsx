import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import ResetPasswordClient from "@/app/(auth)/reset-password/ResetPasswordClient";
import { useSearchParams, useRouter } from "next/navigation";
import { useResetPassword } from "@/app/(auth)/reset-password/useResetPassword";

jest.mock("next/navigation", () => ({
  __esModule: true,
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock("@/app/(auth)/reset-password/useResetPassword", () => ({
  __esModule: true,
  useResetPassword: jest.fn(),
}));

jest.mock("@/app/(auth)/reset-password/ResetPasswordForm", () => ({
  __esModule: true,
  default: ({ token }: any) => <div data-testid="reset-form">form-token:{String(token)}</div>,
}));

jest.mock("@/app/(auth)/reset-password/ResetPasswordSuccess", () => ({
  __esModule: true,
  default: () => <div data-testid="reset-success">success-view</div>,
}));

const mockedUseSearchParams = useSearchParams as jest.Mock;
const mockedUseRouter = useRouter as jest.Mock;
const mockedUseResetPassword = useResetPassword as jest.Mock;

describe("ResetPasswordClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({ push: jest.fn() });
    mockedUseSearchParams.mockReturnValue({
      get: (key: string) => (key === "token" ? "abc-token" : null),
    });
  });

  test("renders form when reset is not successful", () => {
    mockedUseResetPassword.mockReturnValue({
      state: {
        success: false,
        loading: false,
        newPassword: "",
        confirmPassword: "",
        errors: {},
        touched: {},
      },
      handlers: {},
    });

    render(<ResetPasswordClient />);

    expect(screen.getByTestId("reset-form")).toHaveTextContent("form-token:abc-token");
    expect(screen.queryByTestId("reset-success")).not.toBeInTheDocument();
  });

  test("renders success view when reset succeeds", () => {
    mockedUseResetPassword.mockReturnValue({
      state: {
        success: true,
        loading: false,
        newPassword: "",
        confirmPassword: "",
        errors: {},
        touched: {},
      },
      handlers: {},
    });

    render(<ResetPasswordClient />);

    expect(screen.getByTestId("reset-success")).toBeInTheDocument();
    expect(screen.queryByTestId("reset-form")).not.toBeInTheDocument();
  });

  test("passes null token to form when query token is missing", () => {
    mockedUseSearchParams.mockReturnValue({
      get: () => null,
    });

    mockedUseResetPassword.mockReturnValue({
      state: {
        success: false,
        loading: false,
        newPassword: "",
        confirmPassword: "",
        errors: {},
        touched: {},
      },
      handlers: {},
    });

    render(<ResetPasswordClient />);

    expect(screen.getByTestId("reset-form")).toHaveTextContent("form-token:null");
  });

  test("onSuccess callback redirects to /login after 3 seconds", () => {
    jest.useFakeTimers();

    const push = jest.fn();
    mockedUseRouter.mockReturnValue({ push });

    let capturedOnSuccess: (() => void) | null = null;

    mockedUseResetPassword.mockImplementation((_token: string | null, onSuccess: () => void) => {
      capturedOnSuccess = onSuccess;
      return {
        state: {
          success: false,
          loading: false,
          newPassword: "",
          confirmPassword: "",
          errors: {},
          touched: {},
        },
        handlers: {},
      };
    });

    render(<ResetPasswordClient />);

    expect(capturedOnSuccess).toBeTruthy();

    act(() => {
      capturedOnSuccess?.();
      jest.advanceTimersByTime(3000);
    });

    expect(push).toHaveBeenCalledWith("/login");
    jest.useRealTimers();
  });
});
