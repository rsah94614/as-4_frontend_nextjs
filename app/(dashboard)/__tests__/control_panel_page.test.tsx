import { render, screen, waitFor } from "@testing-library/react";
import ControlPanelHub from "../control-panel/page";
import { auth } from "@/services/auth-service";
import { isAdminUser } from "@/lib/role-utils";
import { useRouter } from "next/navigation";

jest.mock("@/services/auth-service", () => ({
    auth: { getUser: jest.fn() },
}));

jest.mock("@/lib/role-utils", () => ({
    isAdminUser: jest.fn(),
    ADMIN_ROLES: new Set(["SUPER_ADMIN", "HR_ADMIN"]),
}));

jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}));

jest.mock("next/link", () => ({ children, href }: any) => <a href={href}>{children}</a>);

describe("ControlPanelHub", () => {
    const mockReplace = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
    });

    it("redirects to login if user is not authenticated", () => {
        (auth.getUser as jest.Mock).mockReturnValue(null);
        render(<ControlPanelHub />);
        expect(mockReplace).toHaveBeenCalledWith("/login");
    });

    it("shows restricted access message if user is not admin", () => {
        (auth.getUser as jest.Mock).mockReturnValue({ employee_id: "1" });
        (isAdminUser as jest.Mock).mockReturnValue(false);

        render(<ControlPanelHub />);

        expect(screen.getByText("Access Restricted")).toBeInTheDocument();
    });

    it("renders control panel options when user is admin", () => {
        (auth.getUser as jest.Mock).mockReturnValue({ employee_id: "1" });
        (isAdminUser as jest.Mock).mockReturnValue(true);

        render(<ControlPanelHub />);

        expect(screen.getByText("System administration & configuration")).toBeInTheDocument();
        expect(screen.getByText("10 modules")).toBeInTheDocument(); // length of categories
        expect(screen.getByText("Audit Logs")).toBeInTheDocument();
        expect(screen.getByText("Departments")).toBeInTheDocument();
    });
});
