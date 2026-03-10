import type { PaginationMeta } from "./pagination";

export const AUDIT_OPERATION_TYPES = ["INSERT", "UPDATE", "DELETE"] as const;
export type OperationType = (typeof AUDIT_OPERATION_TYPES)[number];

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
}

export type AuditPagination = PaginationMeta;

export const STATUS_ENTITY_TYPES = [
  "EMPLOYEE",
  "REVIEW",
  "TRANSACTION",
  "REWARD",
] as const;
export type StatusEntityType = (typeof STATUS_ENTITY_TYPES)[number];

export interface AdminStatus {
  status_id: string;
  status_code: string;
  status_name: string;
  description?: string;
  entity_type: string;
  created_at: string;
  updated_at?: string;
}

export const SEASONAL_QUARTERS = [1, 2, 3, 4] as const;
export type Quarter = (typeof SEASONAL_QUARTERS)[number];

export interface SeasonalMultiplier {
  seasonal_multiplier_id: string;
  quarter: Quarter;
  label: string;
  multiplier: string;
  effective_from?: string;
  effective_to?: string;
  created_at: string;
}

export type TeamSortOption = "score" | "points" | "members" | "name";
