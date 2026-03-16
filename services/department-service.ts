// services/department-service.ts
//
// All requests routed through Next.js proxy (/api/proxy/org/*)
// — no direct microservice URL exposed to the browser.

import { createAuthenticatedClient } from "@/lib/api-utils";
import { extractErrorMessage } from "@/lib/error-utils";
import {
    DepartmentType,
    Department,
    DepartmentDetail,
    DepartmentListResponse,
    CreateDepartmentPayload,
    UpdateDepartmentPayload
} from "@/types/department-types";

// Create the proxied client pointing to your Next.js route
const orgClient = createAuthenticatedClient("/api/proxy/org");

// ─────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────

export const departmentService = {
    /**
     * GET /api/proxy/org/departments
     * Paginated list with optional search filter.
     */
    async list(params?: {
        page?: number;
        limit?: number;
        search?: string;
        is_active?: boolean;
    }): Promise<DepartmentListResponse> {
        try {
            const res = await orgClient.get<DepartmentListResponse>("/departments", {
                params: {
                    page: params?.page ?? 1,
                    limit: params?.limit ?? 20,
                    ...(params?.search ? { search: params.search } : {}),
                    ...(params?.is_active != null ? { is_active: params.is_active } : {}),
                },
            });
            return res.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error, "Failed to list departments"));
        }
    },

    /**
     * GET /api/proxy/org/departments/:id
     */
    async getById(departmentId: string): Promise<DepartmentDetail> {
        try {
            const res = await orgClient.get<DepartmentDetail>(
                `/departments/${departmentId}`
            );
            return res.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error, "Failed to get department"));
        }
    },

    /**
     * POST /api/proxy/org/departments
     */
    async create(payload: CreateDepartmentPayload): Promise<Department> {
        try {
            const res = await orgClient.post<Department>("/departments", payload);
            return res.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error, "Failed to create department"));
        }
    },

    /**
     * PUT /api/proxy/org/departments/:id
     */
    async update(
        departmentId: string,
        payload: UpdateDepartmentPayload
    ): Promise<Department> {
        try {
            const res = await orgClient.put<Department>(
                `/departments/${departmentId}`,
                payload
            );
            return res.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error, "Failed to update department"));
        }
    },

    /**
     * GET /api/proxy/org/department-types
     * Fetches all department types for the create/edit dropdown.
     */
    async listTypes(): Promise<DepartmentType[]> {
        try {
            const res = await orgClient.get<
                { data: DepartmentType[] } | DepartmentType[]
            >("/department-types");
            // Handle both plain array and wrapped { data: [] } responses
            if (Array.isArray(res.data)) return res.data;
            if ("data" in res.data) return res.data.data;
            return [];
        } catch (error) {
            console.error("Failed to load department types", extractErrorMessage(error));
            return [];
        }
    },
};