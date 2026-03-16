"use client";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuditLog } from "@/types/audit-types";
import { PaginationMeta } from "@/types/pagination";

interface AuditTableProps {
    logs: AuditLog[];
    loading: boolean;
    pagination: PaginationMeta | null;
    onPageChange: (page: number) => void;
    onViewDetails: (log: AuditLog) => void;
    hasActiveFilters: boolean;
}

const OP_STYLES: Record<string, { label: string; bg: string; color: string }> = {
    INSERT: { label: "Added", bg: "#1a4ab5", color: "#fff" },
    UPDATE: { label: "Updated", bg: "#14a882", color: "#fff" },
    DELETE: { label: "Deleted", bg: "#e8192c", color: "#fff" },
};

export function OperationBadge({ op, tableName }: { op: string; tableName?: string }) {
    const style = OP_STYLES[op] ?? { label: op, bg: "#6b7280", color: "#fff" };
    const tableLabel = tableName
        ? tableName.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()).replace(/s$/, "")
        : "";
    return (
        <span
            className="inline-flex items-center px-3 py-1 rounded text-xs font-semibold whitespace-nowrap"
            style={{ backgroundColor: style.bg, color: style.color }}
        >
            {style.label}
            {tableLabel ? ` ${tableLabel}` : ""}
        </span>
    );
}

function UserAvatar({ name }: { name: string }) {
    const initials = name
        .split(" ")
        .map(w => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    return (
        <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ backgroundColor: "#1a4ab5" }}
        >
            {initials}
        </div>
    );
}

function shortId(id: string) {
    return "LOG" + id.slice(0, 4).toUpperCase();
}

function formatDateTime(value: string) {
    return `${new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    })} ${new Date(value).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    })}`;
}

function getEmployeeName(log: AuditLog) {
    const withNames = log as AuditLog & { employee_name?: string; performed_by_name?: string };
    return withNames.employee_name || withNames.performed_by_name || "Admin";
}

export function AuditTable({
    logs,
    loading,
    pagination,
    onPageChange,
    onViewDetails,
    hasActiveFilters,
}: AuditTableProps) {
    return (
        <div className="space-y-0">
            {loading ? (
                <div className="py-20 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" style={{ color: "#1a4ab5" }} />
                </div>
            ) : logs.length === 0 ? (
                <div className="py-20 text-center text-sm" style={{ color: "#9ca3af" }}>
                    {hasActiveFilters ? "No logs match your filters." : "No audit logs recorded yet."}
                </div>
            ) : (
                <>
                    <div className="space-y-3 p-3 xl:hidden overflow-x-hidden">
                        {logs.map(log => {
                            const employeeName = getEmployeeName(log);
                            return (
                                <div
                                    key={log.audit_id}
                                    className="rounded-lg border border-slate-200 p-4 space-y-3 w-full max-w-full overflow-hidden cursor-pointer"
                                    style={{ backgroundColor: "#ffffff" }}
                                    onClick={() => onViewDetails(log)}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <span className="font-mono text-xs font-semibold" style={{ color: "#374151" }}>
                                            {shortId(log.audit_id)}
                                        </span>
                                        <OperationBadge op={log.operation_type} tableName={log.table_name} />
                                    </div>

                                    <div className="flex items-center gap-2 min-w-0">
                                        <UserAvatar name={employeeName} />
                                        <span className="min-w-0 break-words font-medium text-sm" style={{ color: "#111827" }}>
                                            {employeeName}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 text-xs">
                                        <div>
                                            <p className="mb-1" style={{ color: "#6b7280" }}>
                                                Module
                                            </p>
                                            <p className="break-words" style={{ color: "#374151" }}>
                                                {log.table_name.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="mb-1" style={{ color: "#6b7280" }}>
                                                Timestamp
                                            </p>
                                            <p style={{ color: "#374151" }}>{formatDateTime(log.performed_at)}</p>
                                        </div>
                                        <div>
                                            <p className="mb-1" style={{ color: "#6b7280" }}>
                                                IP Address
                                            </p>
                                            <p className="font-mono break-all" style={{ color: "#374151" }}>
                                                {log.ip_address ?? "-"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="hidden xl:block overflow-x-auto">
                        <table className="w-full min-w-[980px] text-sm">
                            <thead>
                                <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                                    {["Log ID", "User", "Action", "Table", "Timestamp", "IP Address"].map(col => (
                                        <th
                                            key={col}
                                            className="text-left py-3 px-4 font-semibold text-sm"
                                            style={{ color: "#374151" }}
                                        >
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log, idx) => {
                                    const employeeName = getEmployeeName(log);
                                    return (
                                        <tr
                                            key={log.audit_id}
                                            className="transition-colors cursor-pointer"
                                            style={{ borderBottom: idx < logs.length - 1 ? "1px solid #f3f4f6" : "none" }}
                                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#eff6ff")}
                                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                                            onClick={() => onViewDetails(log)}
                                        >
                                            <td className="py-3.5 px-4 font-mono text-sm font-semibold" style={{ color: "#374151" }}>
                                                {shortId(log.audit_id)}
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-2">
                                                    <UserAvatar name={employeeName} />
                                                    <span className="font-medium text-sm" style={{ color: "#111827" }}>
                                                        {employeeName}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <OperationBadge op={log.operation_type} tableName={log.table_name} />
                                            </td>

                                            <td className="py-3.5 px-4" style={{ color: "#374151" }}>
                                                {log.table_name.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                                            </td>

                                            <td className="py-3.5 px-4" style={{ color: "#374151" }}>
                                                {formatDateTime(log.performed_at)}
                                            </td>

                                            <td className="py-3.5 px-4 font-mono text-sm" style={{ color: "#374151" }}>
                                                {log.ip_address ?? "-"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {pagination && (
                <div
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-3 sm:px-4 py-4"
                    style={{ borderTop: "1px solid #e5e7eb" }}
                >
                    <span className="text-xs" style={{ color: "#6b7280" }}>
                        {(() => {
                            const perPage = pagination.per_page ?? logs.length ?? 10;
                            const from = (pagination.current_page - 1) * perPage + 1;
                            const to = Math.min(pagination.current_page * perPage, pagination.total);
                            return `Showing ${isNaN(from) ? 1 : from}-${isNaN(to) ? logs.length : to} of ${pagination.total.toLocaleString()}`;
                        })()}
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(pagination.current_page - 1)}
                            disabled={!pagination.has_previous}
                            className="h-8 w-8 p-0 rounded border-slate-300"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>

                        <span
                            className="text-xs font-semibold px-3 py-1 rounded"
                            style={{ border: "1.5px solid #d1d5db", color: "#374151" }}
                        >
                            {pagination.current_page} of {pagination.total_pages}
                        </span>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(pagination.current_page + 1)}
                            disabled={!pagination.has_next}
                            className="h-8 w-8 p-0 rounded border-slate-300"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(pagination.current_page - 1)}
                            disabled={!pagination.has_previous}
                            className="hidden xl:inline-flex h-8 px-4 rounded border-slate-300 text-slate-700"
                        >
                            Previous
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => onPageChange(pagination.current_page + 1)}
                            disabled={!pagination.has_next}
                            className="hidden xl:inline-flex h-8 px-4 rounded font-semibold text-white hover:opacity-90"
                            style={{ backgroundColor: "#1a4ab5", border: "none" }}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
