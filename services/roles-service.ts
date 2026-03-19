// services/roles-service.ts
// All requests routed through the Next.js proxy — no direct microservice URLs
// in the browser.  The proxy strips /api/proxy/roles and forwards to the
// roles microservice, which receives the bare path (e.g. /list).

import { extractErrorMessage } from "@/lib/error-utils";
import { rolesClient } from "@/services/api-clients";



async function request<T>(
    path: string,
    options: { method?: string; body?: unknown } = {},
): Promise<T> {
    try {
        const res = await rolesClient({
            url:    path,
            method: options.method ?? "GET",
            data:   options.body,
        });
        return res.data as T;
    } catch (error) {
        throw new Error(extractErrorMessage(error, "Roles API request failed"));
    }
}

// ── Types ──────────────────────────────────────────────────────────────────

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

export interface RoutePermission {
    route_key: string;
    title:     string | null;
    roles:     { role_id: string; role_code: string; role_name: string }[];
}

export interface RoutePermissionPayload {
    route_key: string;
    role_id:   string;
    title?:    string;
}

export interface UpdateRouteTitlePayload {
    route_key: string;
    title:     string;
}

// ── Roles ───────────────────────────────────────────────────────────────────

export const rolesApi = {
    listRoles:  (): Promise<Role[]> =>
        request("/list"),
    createRole: (body: CreateRolePayload): Promise<Role> =>
        request("/create", { method: "POST", body }),
};

// ── Employee Roles ──────────────────────────────────────────────────────────

export const employeeRolesApi = {
    listEmployeeRoles: (): Promise<EmployeeRole[]> =>
        request("/employees"),
    assignRole: (body: AssignRolePayload): Promise<EmployeeRole> =>
        request("/assign", { method: "POST", body }),
    revokeRole: (body: AssignRolePayload): Promise<EmployeeRole> =>
        request("/revoke", { method: "POST", body }),
};

// ── Route Permissions ───────────────────────────────────────────────────────

export const routePermissionsApi = {
    listRoutePermissions: (): Promise<RoutePermission[]> =>
        request("/route-permissions"),

    addRoutePermission: (body: RoutePermissionPayload): Promise<RoutePermission> =>
        request("/route-permissions", { method: "POST", body }),

    removeRoutePermission: (body: RoutePermissionPayload): Promise<RoutePermission> =>
        request("/route-permissions", { method: "PATCH", body }),

    updateRouteTitle: (
        body: UpdateRouteTitlePayload,
    ): Promise<{ route_key: string; title: string; updated_rows: number }> =>
        request("/route-permissions/title", { method: "PATCH", body }),
};
