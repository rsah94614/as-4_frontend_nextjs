"use client";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuditLog, OperationType } from "@/types/audit-types";
import { PaginationMeta } from "@/types/pagination";

interface AuditTableProps {
    logs: AuditLog[];
    loading: boolean;
    pagination: PaginationMeta | null;
    onPageChange: (page: number) => void;
    onViewDetails: (log: AuditLog) => void;
    hasActiveFilters: boolean;
}

// Action badge colors matching screenshot
const OP_STYLES: Record<string, { label: string; bg: string; color: string }> = {
    INSERT: { label: "Added",   bg: "#1a4ab5", color: "#fff" },
    UPDATE: { label: "Updated", bg: "#14a882", color: "#fff" },
    DELETE: { label: "Deleted", bg: "#e8192c", color: "#fff" },
};

export function OperationBadge({ op, tableName }: { op: string; tableName?: string }) {
    const style = OP_STYLES[op] ?? { label: op, bg: "#6b7280", color: "#fff" };
    // Make it descriptive: "Updated Reward", "Deleted Employee" etc.
    const tableLabel = tableName
        ? tableName.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()).replace(/s$/, "")
        : "";
    return (
        <span
            className="inline-flex items-center px-3 py-1 rounded text-xs font-semibold whitespace-nowrap"
            style={{ backgroundColor: style.bg, color: style.color }}
        >
            {style.label}{tableLabel ? ` ${tableLabel}` : ""}
        </span>
    );
}

// Avatar circle with initials
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

// Format short log ID from audit_id
function shortId(id: string) {
    // If it looks like a UUID, show LOG + last 4 chars uppercased
    return "LOG" + id.slice(0, 4).toUpperCase();
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
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
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
                    {loading ? (
                        <tr>
                            <td colSpan={6} className="py-20 text-center">
                                <Loader2 className="w-6 h-6 animate-spin mx-auto" style={{ color: "#1a4ab5" }} />
                            </td>
                        </tr>
                    ) : logs.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="py-20 text-center text-sm" style={{ color: "#9ca3af" }}>
                                {hasActiveFilters ? "No logs match your filters." : "No audit logs recorded yet."}
                            </td>
                        </tr>
                    ) : (
                        logs.map((log, idx) => {
                            const employeeName = (log as any).employee_name || (log as any).performed_by_name || "Admin";
                            return (
                                <tr
                                    key={log.audit_id}
                                    className="transition-colors cursor-pointer"
                                    style={{ borderBottom: idx < logs.length - 1 ? "1px solid #f3f4f6" : "none" }}
                                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#eff6ff")}
                                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                                    onClick={() => onViewDetails(log)}
                                >
                                    {/* Log ID */}
                                    <td className="py-3.5 px-4 font-mono text-sm font-semibold" style={{ color: "#374151" }}>
                                        {shortId(log.audit_id)}
                                    </td>

                                    {/* User */}
                                    <td className="py-3.5 px-4">
                                        <div className="flex items-center gap-2">
                                            <UserAvatar name={employeeName} />
                                            <span className="font-medium text-sm" style={{ color: "#111827" }}>
                                                {employeeName}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Action */}
                                    <td className="py-3.5 px-4">
                                        <OperationBadge op={log.operation_type} tableName={log.table_name} />
                                    </td>

                                    {/* Table */}
                                    <td className="py-3.5 px-4" style={{ color: "#374151" }}>
                                        {log.table_name.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                                    </td>

                                    {/* Timestamp */}
                                    <td className="py-3.5 px-4" style={{ color: "#374151" }}>
                                        {new Date(log.performed_at).toLocaleDateString("en-GB", {
                                            day: "2-digit", month: "2-digit", year: "numeric",
                                        })}{" "}
                                        {new Date(log.performed_at).toLocaleTimeString([], {
                                            hour: "2-digit", minute: "2-digit", hour12: false,
                                        })}
                                    </td>

                                    {/* IP Address */}
                                    <td className="py-3.5 px-4 font-mono text-sm" style={{ color: "#374151" }}>
                                        {log.ip_address ?? "—"}
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>

            {/* Pagination */}
            {pagination && (
                <div
                    className="flex items-center justify-between px-4 py-4"
                    style={{ borderTop: "1px solid #e5e7eb" }}
                >
                    <span className="text-xs" style={{ color: "#6b7280" }}>
                        {(() => {
                            const perPage = pagination.per_page || logs.length || 10;
                            const from = (pagination.current_page - 1) * perPage + 1;
                            const to = Math.min(pagination.current_page * perPage, pagination.total);
                            return `Showing ${from}–${to} of ${pagination.total.toLocaleString()}`;
                        })()}
                    </span>

                    <div className="flex items-center gap-2">
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
                            className="h-8 px-4 rounded border-slate-300 text-slate-700"
                        >
                            Previous
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => onPageChange(pagination.current_page + 1)}
                            disabled={!pagination.has_next}
                            className="h-8 px-4 rounded font-semibold text-white hover:opacity-90"
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