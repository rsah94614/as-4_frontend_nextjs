// services/designation-service.ts
//
// All requests routed through Next.js proxy (/api/proxy/org/*)
// — no direct microservice URL exposed to the browser.

import { createAuthenticatedClient } from "@/lib/api-utils";

import {
    Designation,
    DesignationDetail,
    DesignationListResponse,
    CreateDesignationPayload,
    UpdateDesignationPayload
} from "@/types/designation-types";

// Create the proxied client pointing to your Next.js route
const orgClient = createAuthenticatedClient("/api/proxy/org");

// ─────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────

export const designationService = {
    /**
     * GET /api/proxy/org/designations
     */
    async list(params?: {
        page?: number;
        limit?: number;
        is_active?: boolean;
    }): Promise<DesignationListResponse> {
        const res = await orgClient.get<DesignationListResponse>("/designations", {
            params: {
                page: params?.page ?? 1,
                limit: params?.limit ?? 20,
                ...(params?.is_active != null ? { is_active: params.is_active } : {}),
            },
        });
        return res.data;
    },

    /**
     * GET /api/proxy/org/designations/:id
     */
    async getById(designationId: string): Promise<DesignationDetail> {
        const res = await orgClient.get<DesignationDetail>(
            `/designations/${designationId}`
        );
        return res.data;
    },

    /**
     * POST /api/proxy/org/designations
     */
    async create(payload: CreateDesignationPayload): Promise<Designation> {
        const res = await orgClient.post<Designation>("/designations", payload);
        return res.data;
    },

    /**
     * PUT /api/proxy/org/designations/:id
     */
    async update(
        designationId: string,
        payload: UpdateDesignationPayload
    ): Promise<DesignationDetail> {
        const res = await orgClient.put<DesignationDetail>(
            `/designations/${designationId}`,
            payload
        );
        return res.data;
    },
};