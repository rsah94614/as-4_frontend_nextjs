// services/roles-api-client.ts

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

export interface Role {
  role_id: string;
  role_name: string;
  role_code: string;
  description?: string | null;
  created_at?: string;
}

export interface CreateRolePayload {
  role_name: string;
  role_code: string;
  description?: string;
}

export const rolesApi = {
  listRoles: (): Promise<Role[]> => fetchWithAuth("/v1/roles"),

  createRole: (body: CreateRolePayload): Promise<Role> =>
    fetchWithAuth("/v1/roles", { method: "POST", body: JSON.stringify(body) }),
};

// ── Employee Roles ─────────────────────────────────────────────────────────

export interface EmployeeRole {
  employee_role_id: string;
  assigned_at: string;
  is_active: boolean;
  employee: { id: string; username: string; email: string };
  role: { id: string; name: string; code: string };
}

export interface AssignRolePayload {
  employee_id: string;
  role_id: string;
}

export const employeeRolesApi = {
  listEmployeeRoles: (): Promise<EmployeeRole[]> =>
    fetchWithAuth("/v1/roles/employees"),

  assignRole: (body: AssignRolePayload): Promise<EmployeeRole> =>
    fetchWithAuth("/v1/roles/assign", { method: "POST", body: JSON.stringify(body) }),

  revokeRole: (body: AssignRolePayload): Promise<EmployeeRole> =>
    fetchWithAuth("/v1/roles/revoke", { method: "POST", body: JSON.stringify(body) }),
};

// ── Route Permissions ──────────────────────────────────────────────────────

export interface RoutePermission {
  route_key: string;
  roles: { role_id: string; role_code: string; role_name: string }[];
}

export interface RoutePermissionPayload {
  route_key: string;
  role_id: string;
}

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