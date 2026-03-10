// services/department-service.ts
//
// Talks to Organization Service (port 8007) at:
//   GET  /v1/org/departments            → paginated list
//   GET  /v1/org/departments/:id        → detail
//   POST /v1/org/departments            → create
//   PUT  /v1/org/departments/:id        → update
//   GET  /v1/org/department-types       → all types (for dropdowns)
//
// Uses orgApiClient which already has baseURL = http://localhost:8007/v1/org
// and Bearer token handling.

import orgApiClient from "./org-api-client";
import {
    DepartmentType,
    Department,
    DepartmentDetail,
    DepartmentListResponse,
    CreateDepartmentPayload,
    UpdateDepartmentPayload
} from "@/types/department-types";

// ─────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────

export const departmentService = {
    /**
     * GET /v1/org/departments
     * Paginated list with optional search filter.
     */
    async list(params?: {
        page?: number;
        limit?: number;
        search?: string;
        is_active?: boolean;
    }): Promise<DepartmentListResponse> {
        const res = await orgApiClient.get<DepartmentListResponse>("/departments", {
            params: {
                page: params?.page ?? 1,
                limit: params?.limit ?? 20,
                ...(params?.search ? { search: params.search } : {}),
                ...(params?.is_active != null ? { is_active: params.is_active } : {}),
            },
        });
        return res.data;
    },

    /**
     * GET /v1/org/departments/:id
     */
    async getById(departmentId: string): Promise<DepartmentDetail> {
        const res = await orgApiClient.get<DepartmentDetail>(
            `/departments/${departmentId}`
        );
        return res.data;
    },

    /**
     * POST /v1/org/departments
     */
    async create(payload: CreateDepartmentPayload): Promise<Department> {
        const res = await orgApiClient.post<Department>("/departments", payload);
        return res.data;
    },

    /**
     * PUT /v1/org/departments/:id
     */
    async update(
        departmentId: string,
        payload: UpdateDepartmentPayload
    ): Promise<Department> {
        const res = await orgApiClient.put<Department>(
            `/departments/${departmentId}`,
            payload
        );
        return res.data;
    },

    /**
     * GET /v1/org/department-types
     * Fetches all department types for the create/edit dropdown.
     * Backend returns a plain array (list[DepartmentTypeResponse]).
     */
    async listTypes(): Promise<DepartmentType[]> {
        try {
            const res = await orgApiClient.get<
                { data: DepartmentType[] } | DepartmentType[]
            >("/department-types");
            // Handle both plain array and wrapped { data: [] } responses
            if (Array.isArray(res.data)) return res.data;
            if ("data" in res.data) return res.data.data;
            return [];
        } catch {
            return [];
        }
    },
};