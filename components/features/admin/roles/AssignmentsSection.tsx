"use client";

import React, { useEffect, useState, useCallback } from "react";
import { UserPlus, UserMinus, Loader2, ChevronDown, Search, Users, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
    rolesApi,
    employeeRolesApi,
    type Role,
    type EmployeeRole,
} from "@/services/roles-client";
import { extractErrorMessage } from "@/lib/error-utils";
import type { ToastType } from "./UIHelpers";

interface AssignmentsSectionProps {
    toast: (msg: string, t?: ToastType) => void;
}

function rolePillStyle(name: string): React.CSSProperties {
    const n = name.toLowerCase();
    if (n.includes("super"))                          return { background: "#E31837", color: "#fff" };
    if (n.includes("hr"))                             return { background: "#004C8F", color: "#fff" };
    if (n.includes("head") || n.includes("manager"))  return { background: "#6D28D9", color: "#fff" };
    if (n.includes("audit"))                          return { background: "#0F766E", color: "#fff" };
    return { background: "#1E3A5F", color: "#fff" };
}

const AVATAR_COLORS = ["#004C8F", "#E31837", "#1E3A5F", "#7C2D12", "#14532D", "#6D28D9"];

function initials(name: string) {
    return name.split(/[\s._-]/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

const HOW_IT_WORKS = [
    { n: "01", title: "Find Employee ID",  desc: "Employee IDs are found on the employee profile page in the admin panel." },
    { n: "02", title: "Select Role",       desc: "Choose the appropriate role based on the employee's responsibilities." },
    { n: "03", title: "Confirm Access",    desc: "Role takes effect immediately on the employee's next login." },
    { n: "04", title: "Revoke Anytime",    desc: "Remove a role assignment at any time using the Revoke button in the table." },
];

function HowItWorks() {
    const [open, setOpen] = useState(false);
    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-6">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Info size={13} className="text-[#E31837]" />
                    <span className="text-[11px] font-bold text-[#004C8F] uppercase tracking-widest">How It Works</span>
                </div>
                <ChevronDown size={15} className={cn("text-gray-400 transition-transform duration-200", open && "rotate-180")} />
            </button>
            {open && (
                <div className="border-t border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                        {HOW_IT_WORKS.map((s) => (
                            <div key={s.n} className="flex gap-3 px-5 py-4">
                                <span className="text-[11px] font-black text-[#E31837] w-6 shrink-0 tabular-nums pt-0.5">{s.n}</span>
                                <div>
                                    <p className="text-xs font-semibold text-[#004C8F] mb-0.5">{s.title}</p>
                                    <p className="text-[11px] text-gray-500 leading-relaxed">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export function AssignmentsSection({ toast }: AssignmentsSectionProps) {
    const [records, setRecords]   = useState<EmployeeRole[]>([]);
    const [roles, setRoles]       = useState<Role[]>([]);
    const [loading, setLoading]   = useState(true);
    const [open, setOpen]         = useState(false);
    const [submitting, setSub]    = useState(false);
    const [revoking, setRevoking] = useState<string | null>(null);
    const [form, setForm]         = useState({ employee_id: "", role_id: "" });
    const [search, setSearch]     = useState("");

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const [emp, r] = await Promise.all([
                employeeRolesApi.listEmployeeRoles(),
                rolesApi.listRoles(),
            ]);
            setRecords(emp);
            setRoles(r);
        } catch (e: unknown) {
            toast(extractErrorMessage(e), "error");
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { load(); }, [load]);

    const handleAssign = async () => {
        if (!form.employee_id.trim() || !form.role_id) {
            toast("Employee ID and role are required", "error");
            return;
        }
        try {
            setSub(true);
            await employeeRolesApi.assignRole(form);
            toast("Role assigned successfully");
            setOpen(false);
            setForm({ employee_id: "", role_id: "" });
            load();
        } catch (e: unknown) {
            toast(extractErrorMessage(e), "error");
        } finally {
            setSub(false);
        }
    };

    const handleRevoke = async (record: EmployeeRole) => {
        try {
            setRevoking(record.employee_role_id);
            await employeeRolesApi.revokeRole({ employee_id: record.employee.id, role_id: record.role.id });
            toast("Role revoked");
            load();
        } catch (e: unknown) {
            toast(extractErrorMessage(e), "error");
        } finally {
            setRevoking(null);
        }
    };

    const filtered = records.filter(
        (r) =>
            r.employee.username.toLowerCase().includes(search.toLowerCase()) ||
            r.employee.email.toLowerCase().includes(search.toLowerCase()) ||
            r.role.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="w-full">
            <HowItWorks />

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">

                {/* Card header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users size={14} className="text-[#004C8F]" />
                        <h2 className="text-sm font-bold text-[#004C8F]">Role Assignments</h2>
                        {!loading && (
                            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full tabular-nums">
                                {records.length}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setOpen(true)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95"
                        style={{ background: "#E31837" }}
                    >
                        <UserPlus size={13} /> Assign Role
                    </button>
                </div>

                {/* Search bar */}
                <div className="px-6 py-3 border-b border-gray-100">
                    <div className="relative max-w-sm">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            placeholder="Search by name, email or role…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm
                                placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004C8F]/10
                                focus:border-[#004C8F]/40 transition-all"
                        />
                    </div>
                </div>

                {/* Body */}
                {loading ? (
                    <div className="p-6 space-y-3">
                        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                            <UserPlus size={22} className="text-gray-300" />
                        </div>
                        <p className="text-sm font-semibold text-gray-500">
                            {search ? "No matching assignments" : "No assignments yet"}
                        </p>
                    </div>
                ) : (
                    <div>
                        {/* Table head */}
                        <div className="grid px-6 py-2.5 bg-gray-50 border-b border-gray-100"
                            style={{ gridTemplateColumns: "1fr 160px 120px 90px" }}>
                            {["Employee", "Role", "Assigned", ""].map((h) => (
                                <span key={h} className="text-[10px] font-black uppercase tracking-widest text-gray-400">{h}</span>
                            ))}
                        </div>

                        {/* Rows */}
                        <div className="divide-y divide-gray-100">
                            {filtered.map((r, i) => (
                                <div
                                    key={r.employee_role_id}
                                    className="grid px-6 py-3.5 items-center hover:bg-gray-50 transition-colors"
                                    style={{ gridTemplateColumns: "1fr 160px 120px 90px" }}
                                >
                                    {/* Employee */}
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                                            style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                                        >
                                            {initials(r.employee.username)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-[#004C8F] truncate">{r.employee.username}</p>
                                            <p className="text-[11px] text-gray-400 truncate">{r.employee.email}</p>
                                        </div>
                                    </div>

                                    {/* Role — name only, no duplicate code below */}
                                    <div>
                                        <span
                                            className="inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold"
                                            style={rolePillStyle(r.role.name)}
                                        >
                                            {r.role.name}
                                        </span>
                                    </div>

                                    {/* Date */}
                                    <p className="text-[11px] text-gray-400">
                                        {new Date(r.assigned_at).toLocaleDateString("en-IN", {
                                            day: "2-digit", month: "short", year: "numeric",
                                        })}
                                    </p>

                                    {/* Revoke */}
                                    <div className="flex justify-end">
                                        <button
                                            disabled={revoking === r.employee_role_id}
                                            onClick={() => handleRevoke(r)}
                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold
                                                transition-all hover:bg-red-50 disabled:opacity-40"
                                            style={{ color: "#E31837" }}
                                        >
                                            {revoking === r.employee_role_id
                                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                                : <UserMinus size={12} />}
                                            Revoke
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer bar */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                        {loading ? "Loading…" : `${records.length} assignment${records.length !== 1 ? "s" : ""}`}
                    </p>
                    <button
                        onClick={() => setOpen(true)}
                        className="flex items-center gap-1 text-xs font-semibold text-[#004C8F] hover:text-[#E31837] transition-colors"
                    >
                        <UserPlus size={12} /> Assign another
                    </button>
                </div>
            </div>

            {/* Assign Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-xl border-0">
                    <div className="px-6 py-4" style={{ background: "#004C8F" }}>
                        <DialogHeader>
                            <DialogTitle className="text-white font-bold text-sm">Assign Role</DialogTitle>
                            <DialogDescription className="text-blue-200 text-xs mt-0.5">
                                Assign a role to an employee by their ID
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="h-0.5" style={{ background: "#E31837" }} />

                    <div className="p-6 space-y-4 bg-white">
                        <div className="space-y-1.5">
                            <Label htmlFor="employee_id" className="text-[11px] font-bold text-[#004C8F] uppercase tracking-widest">
                                Employee ID <span style={{ color: "#E31837" }}>*</span>
                            </Label>
                            <Input id="employee_id" placeholder="e.g. emp_abc123" value={form.employee_id}
                                onChange={(e) => setForm((f) => ({ ...f, employee_id: e.target.value }))}
                                className="border-gray-200 focus-visible:ring-0 focus-visible:border-[#004C8F]" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-bold text-[#004C8F] uppercase tracking-widest">
                                Role <span style={{ color: "#E31837" }}>*</span>
                            </Label>
                            <div className="relative">
                                <select
                                    value={form.role_id}
                                    onChange={(e) => setForm((f) => ({ ...f, role_id: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white appearance-none pr-9
                                        focus:outline-none focus:ring-2 focus:ring-[#004C8F]/10 focus:border-[#004C8F]/40 font-medium transition-all"
                                >
                                    <option value="">Select a role…</option>
                                    {roles.map((r) => (
                                        <option key={r.role_id} value={r.role_id}>
                                            {r.role_name} ({r.role_code})
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}
                            className="border-gray-200 text-xs font-semibold">
                            Cancel
                        </Button>
                        <button onClick={handleAssign} disabled={submitting}
                            className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                            style={{ background: "#004C8F" }}>
                            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            Assign Role
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}