// services/designation-service.ts
//
// All requests routed through Next.js proxy (/api/proxy/org/*)
// — no direct microservice URL exposed to the browser.

import { extractErrorMessage } from "@/lib/error-utils";
import { orgClient } from "@/services/api-clients";

import {
    Designation,
    DesignationDetail,
    DesignationListResponse,
    CreateDesignationPayload,
    UpdateDesignationPayload
} from "@/types/designation-types";


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
        try {
            const res = await orgClient.get<DesignationListResponse>("/designations", {
                params: {
                    page: params?.page ?? 1,
                    limit: params?.limit ?? 20,
                    ...(params?.is_active != null ? { is_active: params.is_active } : {}),
                },
            });
            return res.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error, "Failed to list designations"));
        }
    },

    /**
     * GET /api/proxy/org/designations/:id
     */
    async getById(designationId: string): Promise<DesignationDetail> {
        try {
            const res = await orgClient.get<DesignationDetail>(
                `/designations/${designationId}`
            );
            return res.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error, "Failed to get designation"));
        }
    },

    /**
     * POST /api/proxy/org/designations
     */
    async create(payload: CreateDesignationPayload): Promise<Designation> {
        try {
            const res = await orgClient.post<Designation>("/designations", payload);
            return res.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error, "Failed to create designation"));
        }
    },

    /**
     * PUT /api/proxy/org/designations/:id
     */
    async update(
        designationId: string,
        payload: UpdateDesignationPayload
    ): Promise<DesignationDetail> {
        try {
            const res = await orgClient.put<DesignationDetail>(
                `/designations/${designationId}`,
                payload
            );
            return res.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error, "Failed to update designation"));
        }
    },
};