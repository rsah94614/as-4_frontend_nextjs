import orgApiClient from "./org-api-client";
import type {
  DepartmentType,
  Department,
  DepartmentDetail,
  DepartmentListResponse,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
} from "@/types";

export const departmentService = {
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

  async getById(departmentId: string): Promise<DepartmentDetail> {
    const res = await orgApiClient.get<DepartmentDetail>(
      `/departments/${departmentId}`
    );
    return res.data;
  },

  async create(payload: CreateDepartmentPayload): Promise<Department> {
    const res = await orgApiClient.post<Department>("/departments", payload);
    return res.data;
  },

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

  async listTypes(): Promise<DepartmentType[]> {
    try {
      const res = await orgApiClient.get<{ data: DepartmentType[] } | DepartmentType[]>(
        "/department-types"
      );
      if (Array.isArray(res.data)) return res.data;
      if ("data" in res.data) return res.data.data;
      return [];
    } catch {
      return [];
    }
  },
};

export type {
  DepartmentType,
  Department,
  DepartmentDetail,
  DepartmentListResponse,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
} from "@/types";
