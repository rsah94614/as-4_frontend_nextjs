"use client";

import { X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AuditLog } from "@/types/audit-types";
import { OperationBadge } from "./AuditTable";

interface AuditDetailModalProps {
    log: AuditLog | null;
    onClose: () => void;
}

// Renders a key-value object in a human-readable way
function ChangeTable({ data, emptyMessage }: { data: unknown; emptyMessage: string }) {
    if (!data || typeof data !== "object" || Object.keys(data as object).length === 0) {
        return (
            <p className="text-sm italic py-3 px-4 rounded-lg" style={{ color: "#9ca3af", backgroundColor: "#f9fafb", border: "1px solid #f3f4f6" }}>
                {emptyMessage}
            </p>
        );
    }

    const entries = Object.entries(data as Record<string, unknown>);

    return (
        <div className="rounded-lg overflow-x-auto" style={{ border: "1px solid #e5e7eb" }}>
            <table className="w-full text-sm">
                <thead>
                    <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide" style={{ color: "#6b7280", width: "40%" }}>Field</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide" style={{ color: "#6b7280" }}>Value</th>
                    </tr>
                </thead>
                <tbody>
                    {entries.map(([key, value], idx) => {
                        // Format the key nicely
                        const label = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
                        // Format the value nicely
                        let displayValue: string;
                        if (value === null || value === undefined) {
                            displayValue = "—";
                        } else if (typeof value === "boolean") {
                            displayValue = value ? "Yes" : "No";
                        } else if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
                            displayValue = new Date(value).toLocaleString();
                        } else {
                            displayValue = String(value);
                        }

                        return (
                            <tr
                                key={key}
                                style={{ borderBottom: idx < entries.length - 1 ? "1px solid #f3f4f6" : "none" }}
                            >
                                <td className="px-4 py-2.5 font-medium text-sm" style={{ color: "#374151" }}>{label}</td>
                                <td className="px-4 py-2.5 text-sm" style={{ color: "#111827" }}>{displayValue}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export function AuditDetailModal({ log, onClose }: AuditDetailModalProps) {
    if (!log) return null;

    const employeeName = (log as AuditLog & { employee_name?: string; performed_by_name?: string }).employee_name || (log as AuditLog & { employee_name?: string; performed_by_name?: string }).performed_by_name || "Admin";

    return (
        <Dialog open={!!log} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-xl [&>button]:hidden" style={{ border: "none" }}>

                {/* Blue header */}
                <div
                    className="flex items-center justify-between px-4 sm:px-6 py-4 sticky top-0 z-10"
                    style={{ backgroundColor: "#1a4ab5" }}
                >
                    <div>
                        <DialogTitle className="text-lg font-bold text-white">
                            Activity Detail
                        </DialogTitle>
                        <p className="text-blue-200 text-xs mt-0.5">
                            What happened and what changed
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="text-white hover:text-blue-200 hover:bg-transparent p-1 h-auto"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="bg-white px-4 sm:px-6 py-5 sm:py-6 space-y-5 sm:space-y-6">

                    {/* Summary cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="rounded-lg px-4 py-3" style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}>
                            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#6b7280" }}>Done by</p>
                            <p className="text-sm font-semibold" style={{ color: "#111827" }}>{employeeName}</p>
                        </div>
                        <div className="rounded-lg px-4 py-3" style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}>
                            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#6b7280" }}>Action</p>
                            <OperationBadge op={log.operation_type} />
                        </div>
                        <div className="rounded-lg px-4 py-3" style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}>
                            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#6b7280" }}>Date & Time</p>
                            <p className="text-sm font-semibold" style={{ color: "#111827" }}>
                                {new Date(log.performed_at).toLocaleString([], { dateStyle: "long", timeStyle: "short" })}
                            </p>
                        </div>
                        <div className="rounded-lg px-4 py-3" style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}>
                            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#6b7280" }}>IP Address</p>
                            <p className="text-sm font-semibold font-mono" style={{ color: "#111827" }}>
                                {log.ip_address ?? "Not recorded"}
                            </p>
                        </div>
                        <div className="rounded-lg px-4 py-3 sm:col-span-2" style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}>
                            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#6b7280" }}>Section / Module</p>
                            <p className="text-sm font-semibold" style={{ color: "#111827" }}>
                                {log.table_name.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                            </p>
                        </div>
                    </div>

                    {/* Before & After — human readable */}
                    <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1.25rem" }}>
                        <p className="text-sm font-semibold mb-4" style={{ color: "#374151" }}>What changed</p>

                        <div className="space-y-4">
                            {log.operation_type !== "INSERT" && (
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#6b7280" }}>
                                        Before the change
                                    </p>
                                    <ChangeTable
                                        data={log.old_values}
                                        emptyMessage="No previous data — this was a brand new record."
                                    />
                                </div>
                            )}

                            {log.operation_type !== "DELETE" && (
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#6b7280" }}>
                                        {log.operation_type === "INSERT" ? "What was created" : "After the change"}
                                    </p>
                                    <ChangeTable
                                        data={log.new_values}
                                        emptyMessage="No new data recorded."
                                    />
                                </div>
                            )}

                            {log.operation_type === "DELETE" && (
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#6b7280" }}>
                                        What was deleted
                                    </p>
                                    <ChangeTable
                                        data={log.old_values}
                                        emptyMessage="No data recorded for this deletion."
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
}
