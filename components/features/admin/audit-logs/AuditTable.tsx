"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { AuditLog } from "@/types/audit-types";
import { PaginationMeta } from "@/types/pagination";
import PaginationControls from "@/components/shared/PaginationControls";

interface AuditTableProps {
    logs: AuditLog[];
    loading: boolean;
    pagination: PaginationMeta | null;
    onPageChange: (page: number) => void;
    onViewDetails: (log: AuditLog) => void;
    hasActiveFilters: boolean;
}

const OP_STYLES: Record<string, { label: string }> = {
    INSERT: { label: "Added" },
    UPDATE: { label: "Updated" },
    DELETE: { label: "Deleted" },
};

export function OperationBadge({ op }: { op: string }) {
    const style = OP_STYLES[op] ?? { label: op };
    return (
        <span className="text-xs font-semibold whitespace-nowrap" style={{ color: "#374151" }}>
            {style.label}
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

function AuditTableSkeleton() {
    return (
        <>
            <div className="space-y-3 p-3 sm:p-4 md:hidden overflow-x-hidden">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="rounded-xl border border-slate-200 p-3.5 sm:p-4 space-y-3 w-full max-w-full overflow-hidden"
                        style={{ backgroundColor: "#ffffff" }}
                    >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-16" />
                        </div>

                        <div className="flex items-center gap-2.5 min-w-0">
                            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                            <Skeleton className="h-4 w-32" />
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="col-span-2 space-y-2">
                                <Skeleton className="h-3 w-14" />
                                <Skeleton className="h-4 w-36" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-4 w-28" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-[720px] lg:min-w-[860px] text-sm">
                    <thead>
                        <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                            <th className="text-left py-3 px-3 lg:px-4 font-semibold text-sm" style={{ color: "#374151" }}>
                                Log ID
                            </th>
                            <th className="text-left py-3 px-3 lg:px-4 font-semibold text-sm" style={{ color: "#374151" }}>
                                User
                            </th>
                            <th className="text-left py-3 px-3 lg:px-4 font-semibold text-sm" style={{ color: "#374151" }}>
                                Action
                            </th>
                            <th className="text-left py-3 px-3 lg:px-4 font-semibold text-sm" style={{ color: "#374151" }}>
                                Module
                            </th>
                            <th className="text-left py-3 px-3 lg:px-4 font-semibold text-sm" style={{ color: "#374151" }}>
                                Timestamp
                            </th>
                            <th
                                className="hidden xl:table-cell text-left py-3 px-3 lg:px-4 font-semibold text-sm"
                                style={{ color: "#374151" }}
                            >
                                IP Address
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 6 }).map((_, index) => (
                            <tr key={index} style={{ borderBottom: index < 5 ? "1px solid #f3f4f6" : "none" }}>
                                <td className="py-3.5 px-3 lg:px-4">
                                    <Skeleton className="h-4 w-20" />
                                </td>
                                <td className="py-3.5 px-3 lg:px-4">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="w-8 h-8 rounded-full" />
                                        <Skeleton className="h-4 w-28" />
                                    </div>
                                </td>
                                <td className="py-3.5 px-3 lg:px-4">
                                    <Skeleton className="h-4 w-16" />
                                </td>
                                <td className="py-3.5 px-3 lg:px-4">
                                    <Skeleton className="h-4 w-32" />
                                </td>
                                <td className="py-3.5 px-3 lg:px-4">
                                    <Skeleton className="h-4 w-36" />
                                </td>
                                <td className="hidden xl:table-cell py-3.5 px-3 lg:px-4">
                                    <Skeleton className="h-4 w-24" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
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
                <AuditTableSkeleton />
            ) : logs.length === 0 ? (
                <div className="py-20 text-center text-sm" style={{ color: "#9ca3af" }}>
                    {hasActiveFilters ? "No logs match your filters." : "No audit logs recorded yet."}
                </div>
            ) : (
                <>
                    <div className="space-y-3 p-3 sm:p-4 md:hidden overflow-x-hidden">
                        {logs.map(log => {
                            const employeeName = getEmployeeName(log);
                            return (
                                <div
                                    key={log.audit_id}
                                    className="rounded-xl border border-slate-200 p-3.5 sm:p-4 space-y-3 w-full max-w-full overflow-hidden cursor-pointer transition-colors"
                                    style={{ backgroundColor: "#ffffff" }}
                                    onClick={() => onViewDetails(log)}
                                >
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                        <span className="font-mono text-xs font-semibold" style={{ color: "#374151" }}>
                                            {shortId(log.audit_id)}
                                        </span>
                                        <div className="max-w-full overflow-hidden">
                                            <OperationBadge op={log.operation_type} />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <UserAvatar name={employeeName} />
                                        <span className="min-w-0 break-words font-medium text-sm sm:text-[15px]" style={{ color: "#111827" }}>
                                            {employeeName}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div className="col-span-2">
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

                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full min-w-[720px] lg:min-w-[860px] text-sm">
                            <thead>
                                <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                                    <th
                                        className="text-left py-3 px-3 lg:px-4 font-semibold text-sm"
                                        style={{ color: "#374151" }}
                                    >
                                        Log ID
                                    </th>
                                    <th
                                        className="text-left py-3 px-3 lg:px-4 font-semibold text-sm"
                                        style={{ color: "#374151" }}
                                    >
                                        User
                                    </th>
                                    <th
                                        className="text-left py-3 px-3 lg:px-4 font-semibold text-sm"
                                        style={{ color: "#374151" }}
                                    >
                                        Action
                                    </th>
                                    <th
                                        className="text-left py-3 px-3 lg:px-4 font-semibold text-sm"
                                        style={{ color: "#374151" }}
                                    >
                                        Module
                                    </th>
                                    <th
                                        className="text-left py-3 px-3 lg:px-4 font-semibold text-sm"
                                        style={{ color: "#374151" }}
                                    >
                                        Timestamp
                                    </th>
                                    <th
                                        className="hidden xl:table-cell text-left py-3 px-3 lg:px-4 font-semibold text-sm"
                                        style={{ color: "#374151" }}
                                    >
                                        IP Address
                                    </th>
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
                                            <td className="py-3.5 px-3 lg:px-4 font-mono text-sm font-semibold" style={{ color: "#374151" }}>
                                                {shortId(log.audit_id)}
                                            </td>

                                            <td className="py-3.5 px-3 lg:px-4">
                                                <div className="flex items-center gap-2">
                                                    <UserAvatar name={employeeName} />
                                                    <span className="font-medium text-sm" style={{ color: "#111827" }}>
                                                        {employeeName}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-3 lg:px-4">
                                                <OperationBadge op={log.operation_type} />
                                            </td>

                                            <td className="py-3.5 px-3 lg:px-4" style={{ color: "#374151" }}>
                                                {log.table_name.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                                            </td>

                                            <td className="py-3.5 px-3 lg:px-4 whitespace-nowrap" style={{ color: "#374151" }}>
                                                {formatDateTime(log.performed_at)}
                                            </td>

                                            <td className="hidden xl:table-cell py-3.5 px-3 lg:px-4 font-mono text-sm" style={{ color: "#374151" }}>
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
                <div className="px-3 sm:px-4 py-4 border-t border-[#e5e7eb]">
                    <PaginationControls
                        currentPage={pagination.current_page}
                        totalPages={pagination.total_pages}
                        hasPrevious={pagination.has_previous}
                        hasNext={pagination.has_next}
                        onPageChange={onPageChange}
                        className="mt-0"
                    />
                </div>
            )}
        </div>
    );
}
