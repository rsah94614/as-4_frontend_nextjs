import { render, screen } from "@testing-library/react";
import DevLoggerProvider from "@/providers/DevLoggerProvider";

describe("DevLoggerProvider", () => {
  it("renders children unchanged", () => {
    render(
      <DevLoggerProvider>
        <div data-testid="child">child</div>
      </DevLoggerProvider>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("child")).toBeInTheDocument();
  });
});

