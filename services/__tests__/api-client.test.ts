jest.mock("@/lib/api-utils", () => ({
  __esModule: true,
  createAuthenticatedClient: jest.fn(() => ({ id: "auth-client" })),
}));

import axiosClient from "@/services/api-client";
import { createAuthenticatedClient } from "@/lib/api-utils";

describe("api-client", () => {
  it("creates auth proxy client with expected base URL", () => {
    expect(createAuthenticatedClient).toHaveBeenCalledWith("/api/proxy/auth");
    expect(axiosClient).toEqual({ id: "auth-client" });
  });
});

