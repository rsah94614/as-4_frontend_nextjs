"use client";

import { useEffect, useState, useCallback } from "react";
import { Shield, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { rolesApi, type Role } from "@/services/roles-client";
import type { ToastType } from "./UIHelpers";

interface RolesSectionProps {
    toast: (msg: string, t?: ToastType) => void;
}

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
            toast((e as Error).message, "error");
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        load();
    }, [load]);

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
            toast((e as Error).message, "error");
        } finally {
            setSub(false);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-base font-semibold text-gray-900">Roles</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Define access roles for your organisation
                    </p>
                </div>
                <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5">
                    <Plus className="w-4 h-4" /> New Role
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-32 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                </div>
            ) : roles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400 gap-2">
                    <Shield className="w-8 h-8 opacity-30" />
                    <p className="text-sm">No roles created yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {roles.map((role) => (
                        <div
                            key={role.role_id}
                            className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-sm transition-shadow"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm text-gray-900 truncate">
                                        {role.role_name}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                                        {role.description || "No description"}
                                    </p>
                                </div>
                                <Badge variant="secondary" className="font-mono text-xs shrink-0">
                                    {role.role_code}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create Role</DialogTitle>
                        <DialogDescription>Add a new role to your system</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="role_name">
                                Role Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="role_name"
                                placeholder="e.g. HR Manager"
                                value={form.role_name}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, role_name: e.target.value }))
                                }
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="role_code">
                                Role Code <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="role_code"
                                placeholder="e.g. HR_MANAGER"
                                value={form.role_code}
                                className="font-mono"
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        role_code: e.target.value.toUpperCase(),
                                    }))
                                }
                            />
                            <p className="text-xs text-gray-400">Will be stored in UPPERCASE</p>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Optional description..."
                                rows={3}
                                value={form.description}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, description: e.target.value }))
                                }
                            />
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
                                onClick={handleCreate}
                                disabled={submitting}
                                className="gap-1.5"
                            >
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Create Role
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
