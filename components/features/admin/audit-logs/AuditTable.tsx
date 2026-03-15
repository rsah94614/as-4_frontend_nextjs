"use client";

import { Eye, ArrowUpCircle, PencilLine, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AuditLog, OperationType } from "@/types/audit-types";
import { PaginationMeta } from "@/types/pagination";
import { cn } from "@/lib/utils";

interface AuditTableProps {
    logs: AuditLog[];
    loading: boolean;
    pagination: PaginationMeta | null;
    onPageChange: (page: number) => void;
    onViewDetails: (log: AuditLog) => void;
    hasActiveFilters: boolean;
}

const OP_META: Record<OperationType, { variant: string; icon: React.ReactNode; label: string; className: string }> = {
    INSERT: {
        variant: "outline",
        icon: <ArrowUpCircle className="w-3 h-3" />,
        label: "Created",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    UPDATE: {
        variant: "outline",
        icon: <PencilLine className="w-3 h-3" />,
        label: "Updated",
        className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    DELETE: {
        variant: "outline",
        icon: <Trash2 className="w-3 h-3" />,
        label: "Deleted",
        className: "bg-red-50 text-red-700 border-red-200",
    },
};

export function OperationBadge({ op }: { op: string }) {
    const meta = OP_META[op as OperationType];
    if (!meta) return <span className="text-xs text-gray-400 font-mono">{op}</span>;
    return (
        <Badge variant="outline" className={cn("gap-1.5 font-semibold py-1 rounded-lg", meta.className)}>
            {meta.icon} {meta.label}
        </Badge>
    );
}

export function TableBadge({ name }: { name: string }) {
    return (
        <Badge variant="outline" className="font-mono text-xs font-semibold text-gray-600 bg-gray-100 border-gray-200 py-1 rounded-lg">
            {name}
        </Badge>
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
    if (loading) {
        return (
            <div className="space-y-4 p-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                ))}
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="px-5 py-16 text-center">
                <p className="text-sm font-medium text-gray-400">No logs found</p>
                <p className="text-xs text-gray-300 mt-1">
                    {hasActiveFilters ? "Try changing or clearing your filters." : "No activity has been recorded yet."}
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Table</th>
                            <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                            <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Record ID</th>
                            <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Done By</th>
                            <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">When</th>
                            <th className="px-5 py-3.5 w-12" />
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.audit_id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors group">
                                <td className="px-5 py-4"><TableBadge name={log.table_name} /></td>
                                <td className="px-5 py-4"><OperationBadge op={log.operation_type} /></td>
                                <td className="px-5 py-4 hidden md:table-cell">
                                    <span className="font-mono text-xs text-gray-400 truncate max-w-[140px] block" title={log.record_id}>
                                        {log.record_id.slice(0, 8)}…
                                    </span>
                                </td>
                                <td className="px-5 py-4 hidden lg:table-cell">
                                    <span className="font-mono text-xs text-gray-400 truncate max-w-[140px] block" title={log.performed_by}>
                                        {log.performed_by.slice(0, 8)}…
                                    </span>
                                </td>
                                <td className="px-5 py-4">
                                    <div>
                                        <span className="text-xs font-bold text-gray-800">{new Date(log.performed_at).toLocaleDateString()}</span>
                                        <span className="text-xs font-bold text-gray-600 ml-1.5">
                                            {new Date(log.performed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-5 py-4">
                                    <Button variant="ghost" size="icon-sm" onClick={() => onViewDetails(log)}
                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-teal-600 hover:bg-teal-50">
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden">
                {logs.map((log) => (
                    <button key={log.audit_id} onClick={() => onViewDetails(log)}
                        className="w-full text-left p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/60 active:bg-gray-100 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <TableBadge name={log.table_name} />
                                    <OperationBadge op={log.operation_type} />
                                </div>
                                <p className="text-xs text-gray-400 font-mono truncate">{log.record_id}</p>
                                <p className="text-xs text-gray-400">
                                    {new Date(log.performed_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                                </p>
                            </div>
                            <Eye className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
                        </div>
                    </button>
                ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/40">
                    <p className="text-xs font-semibold text-gray-600">
                        Showing page <span className="font-bold text-gray-900">{pagination.current_page}</span> of <span className="font-bold text-gray-900">{pagination.total_pages}</span>
                        <span className="hidden sm:inline"> · {pagination.total.toLocaleString()} total entries</span>
                    </p>
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" onClick={() => onPageChange(pagination.current_page - 1)} disabled={!pagination.has_previous}>
                            <ChevronLeft className="w-3.5 h-3.5" /> Prev
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => onPageChange(pagination.current_page + 1)} disabled={!pagination.has_next}>
                            Next <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
