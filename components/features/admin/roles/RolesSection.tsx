"use client";

import { useEffect, useState, useCallback } from "react";
import { Shield, Plus, Loader2, Hash, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { rolesApi, type Role } from "@/services/roles-service";
import { extractErrorMessage } from "@/lib/error-utils";
import type { ToastType } from "./UIHelpers";
import { HowItWorks } from "@/components/features/admin/HowItWorks";

interface RolesSectionProps {
    toast: (msg: string, t?: ToastType) => void;
}



const ROLES_STEPS = [
    { n: "01", title: "Create a Role", desc: "Define a role with a unique name and code (e.g. HR_ADMIN). Add an optional description." },
    { n: "02", title: "Assign to Employees", desc: "Go to the Assignments tab to link a role to specific employees by their ID." },
    { n: "03", title: "Set Route Access", desc: "Use Route Permissions to control which API routes each role can access." },
    { n: "04", title: "Immediate Effect", desc: "Role changes take effect on the employee's next login." },
];

export function RolesSection({ toast }: RolesSectionProps) {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [submitting, setSub] = useState(false);
    const [form, setForm] = useState({ role_name: "", role_code: "", description: "" });

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setRoles(await rolesApi.listRoles());
        } catch (e: unknown) {
            toast(extractErrorMessage(e), "error");
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { load(); }, [load]);

    const handleCreate = async () => {
        if (!form.role_name.trim() || !form.role_code.trim()) {
            toast("Role name and code are required", "error");
            return;
        }
        try {
            setSub(true);
            await rolesApi.createRole(form);
            toast("Role created successfully");
            setOpen(false);
            setForm({ role_name: "", role_code: "", description: "" });
            load();
        } catch (e: unknown) {
            toast(extractErrorMessage(e), "error");
        } finally {
            setSub(false);
        }
    };

    return (
        <div className="w-full">
            <HowItWorks steps={ROLES_STEPS} />

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                {/* Card header */}
                <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Shield size={14} className="text-[#004C8F]" />
                        <h2 className="text-sm font-bold text-[#004C8F]">System Roles</h2>
                        {!loading && (
                            <span className="text-xs font-bold text-[#004C8F] bg-[#F0F5FA] px-2 py-0.5 rounded-md tabular-nums">
                                {roles.length}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setOpen(true)}
                        className="flex w-full sm:w-auto items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95"
                        style={{ background: "#004C8F" }}
                    >
                        <Plus size={13} /> New Role
                    </button>
                </div>

                <div className="p-4 sm:p-6">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
                        </div>
                    ) : roles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                                <Shield size={24} className="text-gray-300" />
                            </div>
                            <p className="text-sm font-semibold text-gray-500">No roles created yet</p>
                            <button
                                onClick={() => setOpen(true)}
                                className="text-sm font-semibold text-[#004C8F] underline underline-offset-2 hover:text-[#E31837] transition-colors"
                            >
                                Create your first role
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 cursor-pointer">
                            {roles.map((role) => {
                                return (
                                    <div key={role.role_id}
                                        className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200">

                                        <div className="p-5">
                                            {/* Icon + arrow row */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                                    style={{ background: "#F0F5FA" }}>
                                                    <Shield size={18} style={{ color: "#004C8F" }} />
                                                </div>
                                                <div className="w-7 h-7 rounded-lg flex items-center justify-center
                                                    opacity-0 group-hover:opacity-100 transition-all duration-150 translate-x-1 group-hover:translate-x-0">
                                                    <ArrowUpRight size={14} className="text-gray-400 group-hover:text-[#004C8F] transition-colors" />
                                                </div>
                                            </div>

                                            {/* Name */}
                                            <p className="text-sm font-bold mb-1" style={{ color: '#004C8F' }}>
                                                {role.role_name}
                                            </p>

                                            {/* Description */}
                                            <p className="text-[12px] text-gray-500 leading-relaxed">
                                                {role.description || "No description provided"}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>


            </div>

            {/* Create Role Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-xl border-0">
                    <div className="px-6 py-4" style={{ background: "#004C8F" }}>
                        <DialogHeader>
                            <DialogTitle className="text-white font-bold text-sm">Create New Role</DialogTitle>
                            <DialogDescription className="text-blue-200 text-xs mt-0.5">
                                Add a new role to your organisation
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-4 sm:p-6 space-y-4 bg-white">
                        <div className="space-y-1.5">
                            <Label htmlFor="role_name" className="text-[11px] font-bold text-[#004C8F] uppercase tracking-widest">
                                Role Name <span style={{ color: "#E31837" }}>*</span>
                            </Label>
                            <Input id="role_name" placeholder="e.g. HR Manager" value={form.role_name}
                                onChange={(e) => setForm((f) => ({ ...f, role_name: e.target.value }))}
                                className="border-gray-200 focus-visible:ring-0 focus-visible:border-[#004C8F]" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="role_code" className="text-[11px] font-bold text-[#004C8F] uppercase tracking-widest">
                                Role Code <span style={{ color: "#E31837" }}>*</span>
                            </Label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input id="role_code" placeholder="HR_MANAGER" value={form.role_code}
                                    className="pl-9 font-mono border-gray-200 focus-visible:ring-0 focus-visible:border-[#004C8F]"
                                    onChange={(e) => setForm((f) => ({ ...f, role_code: e.target.value.toUpperCase() }))} />
                            </div>
                            <p className="text-[11px] text-gray-400">Stored in UPPERCASE</p>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="description" className="text-[11px] font-bold text-[#004C8F] uppercase tracking-widest">
                                Description
                            </Label>
                            <Textarea id="description" placeholder="Describe this role's responsibilities…" rows={3}
                                value={form.description}
                                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                className="border-gray-200 focus-visible:ring-0 focus-visible:border-[#004C8F] resize-none" />
                        </div>
                    </div>

                    <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}
                            className="border-gray-200 text-xs font-semibold w-full sm:w-auto">
                            Cancel
                        </Button>
                        <button onClick={handleCreate} disabled={submitting}
                            className="flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 w-full sm:w-auto"
                            style={{ background: "#004C8F" }}>
                            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            Create Role
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
