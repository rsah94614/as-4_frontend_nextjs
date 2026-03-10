import type { PaginationMeta } from "./pagination";

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
