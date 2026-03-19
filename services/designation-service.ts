// services/designation-service.ts
//
// Uses the direct organization microservice client from services/api-clients.ts.

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
     * GET /designations
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
     * GET /designations/:id
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
     * POST /designations
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
     * PUT /designations/:id
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
