import { render, screen } from "@testing-library/react";
import SettingsPage from "../settings/page";

jest.mock("next/link", () => ({ children, href }: any) => <a href={href}>{children}</a>);

describe("SettingsPage", () => {
    it("renders settings categories accurately", () => {
        render(<SettingsPage />);

        expect(screen.getByText("Settings")).toBeInTheDocument();
        expect(screen.getByText("Profile")).toBeInTheDocument();
        expect(screen.getByText("Notifications")).toBeInTheDocument();
        expect(screen.getByText("Security")).toBeInTheDocument();
    });
});
