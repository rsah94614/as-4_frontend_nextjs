// services/roles-api-client.ts
import type {
  Role,
  CreateRolePayload,
  EmployeeRole,
  AssignRolePayload,
  RoutePermission,
  RoutePermissionPayload,
} from "@/types";

const ROLES_BASE_URL = process.env.NEXT_PUBLIC_ROLES_API_URL || "http://localhost:8002";

async function fetchWithAuth(path: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const res = await fetch(`${ROLES_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }

  return res.json();
}

// ── Roles ──────────────────────────────────────────────────────────────────

export const rolesApi = {
  listRoles: (): Promise<Role[]> => fetchWithAuth("/v1/roles"),

  createRole: (body: CreateRolePayload): Promise<Role> =>
    fetchWithAuth("/v1/roles", { method: "POST", body: JSON.stringify(body) }),
};

// ── Employee Roles ─────────────────────────────────────────────────────────

export const employeeRolesApi = {
  listEmployeeRoles: (): Promise<EmployeeRole[]> =>
    fetchWithAuth("/v1/roles/employees"),

  assignRole: (body: AssignRolePayload): Promise<EmployeeRole> =>
    fetchWithAuth("/v1/roles/assign", { method: "POST", body: JSON.stringify(body) }),

  revokeRole: (body: AssignRolePayload): Promise<EmployeeRole> =>
    fetchWithAuth("/v1/roles/revoke", { method: "POST", body: JSON.stringify(body) }),
};

// ── Route Permissions ──────────────────────────────────────────────────────

export const routePermissionsApi = {
  listRoutePermissions: (): Promise<RoutePermission[]> =>
    fetchWithAuth("/v1/route-permissions"),

  addRoutePermission: (body: RoutePermissionPayload): Promise<RoutePermission> =>
    fetchWithAuth("/v1/route-permissions", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  removeRoutePermission: (body: RoutePermissionPayload): Promise<RoutePermission> =>
    fetchWithAuth("/v1/route-permissions", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};

export type {
  Role,
  CreateRolePayload,
  EmployeeRole,
  AssignRolePayload,
  RoutePermission,
  RoutePermissionPayload,
} from "@/types";
