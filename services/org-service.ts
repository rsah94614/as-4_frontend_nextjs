// services/org-service.ts
// All requests routed through Next.js proxy — no direct microservice URLs in browser.

import { extractErrorMessage } from "@/lib/error-utils";
import { orgClient } from "@/services/api-clients";
import type { AuditLog, AuditLogsResponse } from "@/types/audit-types";
import type { PaginationMeta } from "@/types/pagination";
import type { Status, EntityType } from "@/types/status-types";



// ── Audit Logs ────────────────────────────────────────────────────────────────

export interface AuditLogParams {
    page?: number;
    limit?: number;
    table_name?: string;
    operation_type?: string;
    performed_by?: string;
    start_date?: string;
    end_date?: string;
}

export async function fetchAuditLogs(
    params: AuditLogParams,
): Promise<{ data: AuditLog[]; pagination: PaginationMeta }> {
    try {
        const res = await orgClient.get<AuditLogsResponse>("/audit-logs", { params });
        return { data: res.data.data ?? [], pagination: res.data.pagination };
    } catch (error) {
        throw new Error(extractErrorMessage(error, "Failed to load audit logs"));
    }
}

// ── Statuses ──────────────────────────────────────────────────────────────────

export async function fetchStatuses(entityType?: EntityType): Promise<Status[]> {
    try {
        const params: Record<string, string> = {};
        if (entityType) params.entity_type = entityType;
        const res = await orgClient.get<Status[]>("/statuses", { params });
        return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
        throw new Error(extractErrorMessage(error, "Failed to load statuses"));
    }
}

export interface CreateStatusPayload {
    status_code: string;
    status_name: string;
    description: string;
    entity_type: EntityType;
}

export async function createStatus(payload: CreateStatusPayload): Promise<Status> {
    try {
        const res = await orgClient.post<Status>("/statuses", payload);
        return res.data;
    } catch (error) {
        throw new Error(extractErrorMessage(error, "Failed to create status"));
    }
}

export interface UpdateStatusPayload {
    status_name: string;
    description: string;
}

export async function updateStatus(statusId: string, payload: UpdateStatusPayload): Promise<Status> {
    try {
        const res = await orgClient.put<Status>(`/statuses/${statusId}`, payload);
        return res.data;
    } catch (error) {
        throw new Error(extractErrorMessage(error, "Failed to update status"));
    }
}
