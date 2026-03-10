import orgApiClient from "./org-api-client";
import type {
  Designation,
  DesignationDetail,
  DesignationListResponse,
  CreateDesignationPayload,
  UpdateDesignationPayload,
} from "@/types";

export const designationService = {
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

  async getById(designationId: string): Promise<DesignationDetail> {
    const res = await orgApiClient.get<DesignationDetail>(
      `/designations/${designationId}`
    );
    return res.data;
  },

  async create(payload: CreateDesignationPayload): Promise<Designation> {
    const res = await orgApiClient.post<Designation>("/designations", payload);
    return res.data;
  },

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

export type {
  Designation,
  DesignationDetail,
  DesignationListResponse,
  CreateDesignationPayload,
  UpdateDesignationPayload,
} from "@/types";
