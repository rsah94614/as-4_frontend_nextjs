// services/designation-service.ts
//
// Talks to Organization Service (port 8007) at:
//   GET  /v1/org/designations       → paginated list
//   GET  /v1/org/designations/:id   → detail
//   POST /v1/org/designations       → create
//   PUT  /v1/org/designations/:id   → update
//
// Uses orgApiClient which already has baseURL = http://localhost:8007/v1/org
// and Bearer token handling.

import orgApiClient from "./org-api-client";
import type { PaginationMeta } from "@/types/pagination";

// ─────────────────────────────────────────────
// Types (mirror schemas.py in Organization Service)
// ─────────────────────────────────────────────

export interface Designation {
    designation_id: string;
    designation_name: string;
    designation_code: string;
    level: number;
    is_active: boolean;
    created_at: string;
}

export interface DesignationDetail extends Designation {
    description: string | null;
    employee_count: number;
    updated_at: string | null;
}



export interface DesignationListResponse {
    data: Designation[];
    pagination: PaginationMeta;
}

export interface CreateDesignationPayload {
    designation_name: string;
    designation_code: string;
    level: number;
    description?: string;
}

export interface UpdateDesignationPayload {
    designation_name?: string;
    designation_code?: string;
    level?: number;
    description?: string;
    is_active?: boolean;
}

// ─────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────

export const designationService = {
    /**
     * GET /v1/org/designations
     */
    async list(params?: {
        page?: number;
        limit?: number;
        is_active?: boolean;
    }): Promise<DesignationListResponse> {
        const res = await orgApiClient.get<DesignationListResponse>("/designations", {
            params: {
                page: params?.page ?? 1,
                limit: params?.limit ?? 20,
                ...(params?.is_active != null ? { is_active: params.is_active } : {}),
            },
        });
        return res.data;
    },

    /**
     * GET /v1/org/designations/:id
     */
    async getById(designationId: string): Promise<DesignationDetail> {
        const res = await orgApiClient.get<DesignationDetail>(
            `/designations/${designationId}`
        );
        return res.data;
    },

    /**
     * POST /v1/org/designations
     */
    async create(payload: CreateDesignationPayload): Promise<Designation> {
        const res = await orgApiClient.post<Designation>("/designations", payload);
        return res.data;
    },

    /**
     * PUT /v1/org/designations/:id
     */
    async update(
        designationId: string,
        payload: UpdateDesignationPayload
    ): Promise<DesignationDetail> {
        const res = await orgApiClient.put<DesignationDetail>(
            `/designations/${designationId}`,
            payload
        );
        return res.data;
    },
};