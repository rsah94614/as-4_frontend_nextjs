import { PaginationMeta } from "./pagination";

export const OPERATION_TYPES = ["INSERT", "UPDATE", "DELETE"] as const;
export type OperationType = (typeof OPERATION_TYPES)[number];

export interface AuditLog {
    audit_id: string;
    table_name: string;
    record_id: string;
    operation_type: string;
    old_values: Record<string, unknown> | null;
    new_values: Record<string, unknown> | null;
    performed_by: string;
    performed_at: string;
    ip_address?: string;
    user_agent?: string;
    employee_name?: string;
    performed_by_name?: string;
}

export interface AuditLogsResponse {
    data: AuditLog[];
    pagination: PaginationMeta;
}

export interface AuditFilters {
    tableName: string;
    operationType: OperationType | "";
    performedBy: string;
    startDate: string;
    endDate: string;
}
