import type { PaginationMeta } from "./pagination";

export interface DepartmentType {
    department_type_id: string;
    type_name: string;
    type_code: string;
}

export interface DepartmentTypeNested {
    type_name: string;
    type_code: string;
}

export interface ManagerBrief {
    employee_id: string;
    username: string;
    email?: string;
}

export interface Department {
    department_id: string;
    department_name: string;
    department_code: string;
    department_type: DepartmentTypeNested | null;
    manager: ManagerBrief | null;
    is_active: boolean;
    created_at: string;
}

export interface DepartmentDetail extends Department {
    employee_count: number;
    updated_at: string | null;
}

export interface DepartmentListResponse {
    data: Department[];
    pagination: PaginationMeta;
}

export interface CreateDepartmentPayload {
    department_name: string;
    department_code: string;
    department_type_id: string;
    manager_id?: string;
}

export interface UpdateDepartmentPayload {
    department_name?: string;
    department_code?: string;
    department_type_id?: string;
    manager_id?: string;
    is_active?: boolean;
}
