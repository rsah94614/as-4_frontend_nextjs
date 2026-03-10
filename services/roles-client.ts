// services/roles-client.ts
// All requests routed through Next.js proxy — no direct microservice URLs in browser.
// Switched from raw fetch to axiosClient for connection reuse + interceptors.

import { createAuthenticatedClient } from "@/lib/api-utils";

const rolesAxios = createAuthenticatedClient("/api/proxy/roles");

async function request<T>(path: string, options: {
    method?: string;
    body?: unknown;
} = {}): Promise<T> {
    const res = await rolesAxios({
        url:    path,
        method: options.method || "GET",
        data:   options.body,
    });
    return res.data as T;
}

// ── Roles ──────────────────────────────────────────────────────────────────

export interface Role {
    role_id:      string;
    role_name:    string;
    role_code:    string;
    description?: string | null;
    created_at?:  string;
}

export interface CreateRolePayload {
    role_name:    string;
    role_code:    string;
    description?: string;
}

export const rolesApi = {
    listRoles:   (): Promise<Role[]>  => request(""),
    createRole:  (body: CreateRolePayload): Promise<Role> =>
        request("", { method: "POST", body }),
};

// ── Employee Roles ─────────────────────────────────────────────────────────

export interface EmployeeRole {
    employee_role_id: string;
    assigned_at:      string;
    is_active:        boolean;
    employee: { id: string; username: string; email: string };
    role:     { id: string; name: string; code: string };
}

export interface AssignRolePayload {
    employee_id: string;
    role_id:     string;
}

export const employeeRolesApi = {
    listEmployeeRoles: (): Promise<EmployeeRole[]> =>
        request("/employees"),
    assignRole: (body: AssignRolePayload): Promise<EmployeeRole> =>
        request("/assign", { method: "POST", body }),
    revokeRole: (body: AssignRolePayload): Promise<EmployeeRole> =>
        request("/revoke", { method: "POST", body }),
};

// ── Route Permissions ──────────────────────────────────────────────────────

export interface RoutePermission {
    route_key: string;
    roles: { role_id: string; role_code: string; role_name: string }[];
}

export interface RoutePermissionPayload {
    route_key: string;
    role_id:   string;
}

export const routePermissionsApi = {
    listRoutePermissions: (): Promise<RoutePermission[]> =>
        request("/route-permissions"),
    addRoutePermission: (body: RoutePermissionPayload): Promise<RoutePermission> =>
        request("/route-permissions", { method: "POST", body }),
    removeRoutePermission: (body: RoutePermissionPayload): Promise<RoutePermission> =>
        request("/route-permissions", { method: "PATCH", body }),
};