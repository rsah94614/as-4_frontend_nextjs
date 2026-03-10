"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { AuditLog } from "@/types/audit-types";
import { OperationBadge } from "./AuditTable";

interface AuditDetailModalProps {
    log: AuditLog | null;
    onClose: () => void;
}

function JsonBlock({ label, data, hint }: { label: string; data: unknown; hint?: string }) {
    if (!data) return (
        <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</p>
            <p className="text-xs text-gray-300 italic px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">{hint ?? "No data"}</p>
        </div>
    );
    return (
        <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</p>
            <pre className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed font-mono">
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    );
}

export function AuditDetailModal({ log, onClose }: AuditDetailModalProps) {
    if (!log) return null;

    return (
        <Dialog open={!!log} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
                <DialogHeader className="px-6 py-5 border-b border-gray-100 shrink-0 bg-white sticky top-0 z-10">
                    <DialogTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <OperationBadge op={log.operation_type} /> on &quot;{log.table_name}&quot;
                    </DialogTitle>
                    <DialogDescription className="text-xs text-gray-400 mt-0.5 font-mono">
                        Log ID: {log.audit_id}
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6">
                    {/* Summary grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                        {[
                            { label: "When", value: new Date(log.performed_at).toLocaleString([], { dateStyle: "long", timeStyle: "medium" }) },
                            { label: "Record ID", value: log.record_id, mono: true },
                            { label: "Done by (Employee ID)", value: log.performed_by, mono: true },
                            { label: "IP Address", value: log.ip_address ?? "Not recorded" },
                        ].map(({ label, value, mono }) => (
                            <div key={label} className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">{label}</p>
                                <p className={`text-sm text-gray-800 break-all ${mono ? "font-mono text-xs" : "font-medium"}`}>{value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-100 pt-4 space-y-4">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                            What changed — <span className="normal-case font-normal text-gray-400">Before &amp; After comparison</span>
                        </p>
                        <JsonBlock
                            label="Before (Old Values)"
                            data={log.old_values}
                            hint="No previous values — this was a new record creation."
                        />
                        <JsonBlock
                            label="After (New Values)"
                            data={log.new_values}
                            hint="No new values — this record was deleted."
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
