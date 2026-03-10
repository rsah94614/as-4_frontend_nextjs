"use client";

import { useEffect, useState, useCallback } from "react";
import { UserPlus, UserMinus, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    rolesApi,
    employeeRolesApi,
    type Role,
    type EmployeeRole,
} from "@/services/roles-client";
import type { ToastType } from "./UIHelpers";

interface AssignmentsSectionProps {
    toast: (msg: string, t?: ToastType) => void;
}

export function AssignmentsSection({ toast }: AssignmentsSectionProps) {
    const [records, setRecords] = useState<EmployeeRole[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [submitting, setSub] = useState(false);
    const [revoking, setRevoking] = useState<string | null>(null);
    const [form, setForm] = useState({ employee_id: "", role_id: "" });
    const [search, setSearch] = useState("");

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
            toast((e as Error).message, "error");
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        load();
    }, [load]);

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
            toast((e as Error).message, "error");
        } finally {
            setSub(false);
        }
    };

    const handleRevoke = async (record: EmployeeRole) => {
        try {
            setRevoking(record.employee_role_id);
            await employeeRolesApi.revokeRole({
                employee_id: record.employee.id,
                role_id: record.role.id,
            });
            toast("Role revoked");
            load();
        } catch (e: unknown) {
            toast((e as Error).message, "error");
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
        <div>
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-base font-semibold text-gray-900">
                        Employee Role Assignments
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Assign or revoke roles for employees
                    </p>
                </div>
                <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5">
                    <UserPlus className="w-4 h-4" /> Assign Role
                </Button>
            </div>

            <Input
                placeholder="Search by name, email or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-4 max-w-sm"
            />

            {loading ? (
                <div className="flex items-center justify-center h-32 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400 gap-2">
                    <UserPlus className="w-8 h-8 opacity-30" />
                    <p className="text-sm">
                        {search ? "No matching assignments" : "No assignments yet"}
                    </p>
                </div>
            ) : (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">
                                    Employee
                                </th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">
                                    Role
                                </th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">
                                    Assigned At
                                </th>
                                <th className="text-right px-4 py-3 font-medium text-gray-600">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {filtered.map((r) => (
                                <tr
                                    key={r.employee_role_id}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-900">
                                            {r.employee.username}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {r.employee.email}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant="secondary" className="font-mono text-xs">
                                            {r.role.code}
                                        </Badge>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {r.role.name}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">
                                        {new Date(r.assigned_at).toLocaleDateString("en-IN", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 gap-1.5"
                                            disabled={revoking === r.employee_role_id}
                                            onClick={() => handleRevoke(r)}
                                        >
                                            {revoking === r.employee_role_id ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <UserMinus className="w-3.5 h-3.5" />
                                            )}
                                            Revoke
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Assign Role</DialogTitle>
                        <DialogDescription>
                            Assign a role to an employee by their ID
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="employee_id">
                                Employee ID <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="employee_id"
                                placeholder="e.g. emp_abc123"
                                value={form.employee_id}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, employee_id: e.target.value }))
                                }
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>
                                Role <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <select
                                    value={form.role_id}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, role_id: e.target.value }))
                                    }
                                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-purple-400"
                                >
                                    <option value="">Select a role...</option>
                                    {roles.map((r) => (
                                        <option key={r.role_id} value={r.role_id}>
                                            {r.role_name} ({r.role_code})
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        <div className="flex gap-2 pt-1 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAssign}
                                disabled={submitting}
                                className="gap-1.5"
                            >
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Assign
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
