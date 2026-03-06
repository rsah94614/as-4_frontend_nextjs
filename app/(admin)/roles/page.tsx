"use client";

// app/(dashboard)/control-panel/roles/page.tsx
// Drop this in your existing (dashboard) layout — it sits alongside your other control-panel pages.

import { useEffect, useState, useCallback } from "react";
import { Shield, Plus, UserPlus, UserMinus, Lock, Unlock, ChevronDown, X, Loader2, AlertCircle, CheckCircle2, Route } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import {
  rolesApi,
  employeeRolesApi,
  routePermissionsApi,
  type Role,
  type EmployeeRole,
  type RoutePermission,
} from "@/services/roles-client";

// ─── Toast ────────────────────────────────────────────────────────────────────

type ToastType = "success" | "error";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);
  return { toasts, show };
}

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all
            ${t.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"}`}
        >
          {t.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── Tab types ────────────────────────────────────────────────────────────────

type Tab = "roles" | "assignments" | "permissions";

// ─── Section: Roles ───────────────────────────────────────────────────────────

function RolesSection({ toast }: { toast: (msg: string, t?: ToastType) => void }) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.role_name.trim() || !form.role_code.trim()) {
      toast("Role name and code are required", "error");
      return;
    }
    try {
      setSubmitting(true);
      await rolesApi.createRole(form);
      toast("Role created successfully");
      setOpen(false);
      setForm({ role_name: "", role_code: "", description: "" });
      load();
    } catch (e: unknown) {
      toast((e as Error).message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Roles</h2>
          <p className="text-sm text-gray-500 mt-0.5">Define access roles for your organisation</p>
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
                  <p className="font-semibold text-sm text-gray-900 truncate">{role.role_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{role.description || "No description"}</p>
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
              <Label htmlFor="role_name">Role Name <span className="text-red-500">*</span></Label>
              <Input
                id="role_name"
                placeholder="e.g. HR Manager"
                value={form.role_name}
                onChange={(e) => setForm((f) => ({ ...f, role_name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role_code">Role Code <span className="text-red-500">*</span></Label>
              <Input
                id="role_code"
                placeholder="e.g. HR_MANAGER"
                value={form.role_code}
                onChange={(e) => setForm((f) => ({ ...f, role_code: e.target.value.toUpperCase() }))}
                className="font-mono"
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
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="flex gap-2 pt-1 justify-end">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
              <Button onClick={handleCreate} disabled={submitting} className="gap-1.5">
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

// ─── Section: Assignments ─────────────────────────────────────────────────────

function AssignmentsSection({ toast }: { toast: (msg: string, t?: ToastType) => void }) {
  const [records, setRecords] = useState<EmployeeRole[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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

  useEffect(() => { load(); }, [load]);

  const handleAssign = async () => {
    if (!form.employee_id.trim() || !form.role_id) {
      toast("Employee ID and role are required", "error");
      return;
    }
    try {
      setSubmitting(true);
      await employeeRolesApi.assignRole(form);
      toast("Role assigned successfully");
      setOpen(false);
      setForm({ employee_id: "", role_id: "" });
      load();
    } catch (e: unknown) {
      toast((e as Error).message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (record: EmployeeRole) => {
    const key = record.employee_role_id;
    try {
      setRevoking(key);
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
          <h2 className="text-base font-semibold text-gray-900">Employee Role Assignments</h2>
          <p className="text-sm text-gray-500 mt-0.5">Assign or revoke roles for employees</p>
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
          <p className="text-sm">{search ? "No matching assignments" : "No assignments yet"}</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Employee</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Assigned At</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filtered.map((r) => (
                <tr key={r.employee_role_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{r.employee.username}</p>
                    <p className="text-xs text-gray-400">{r.employee.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="font-mono text-xs">{r.role.code}</Badge>
                    <p className="text-xs text-gray-500 mt-0.5">{r.role.name}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(r.assigned_at).toLocaleDateString("en-IN", {
                      day: "2-digit", month: "short", year: "numeric",
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
                      {revoking === r.employee_role_id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <UserMinus className="w-3.5 h-3.5" />}
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
            <DialogDescription>Assign a role to an employee by their ID</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="employee_id">Employee ID <span className="text-red-500">*</span></Label>
              <Input
                id="employee_id"
                placeholder="e.g. emp_abc123"
                value={form.employee_id}
                onChange={(e) => setForm((f) => ({ ...f, employee_id: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role_select">Role <span className="text-red-500">*</span></Label>
              <div className="relative">
                <select
                  id="role_select"
                  value={form.role_id}
                  onChange={(e) => setForm((f) => ({ ...f, role_id: e.target.value }))}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
              <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
              <Button onClick={handleAssign} disabled={submitting} className="gap-1.5">
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

// ─── Section: Route Permissions ───────────────────────────────────────────────

function RoutePermissionsSection({ toast }: { toast: (msg: string, t?: ToastType) => void }) {
  const [permissions, setPermissions] = useState<RoutePermission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [form, setForm] = useState({ route_key: "", role_id: "" });
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [perms, r] = await Promise.all([
        routePermissionsApi.listRoutePermissions(),
        rolesApi.listRoles(),
      ]);
      setPermissions(perms);
      setRoles(r);
    } catch (e: unknown) {
      toast((e as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!form.route_key.trim() || !form.role_id) {
      toast("Route key and role are required", "error");
      return;
    }
    try {
      setSubmitting(true);
      await routePermissionsApi.addRoutePermission(form);
      toast("Permission added");
      setOpen(false);
      setForm({ route_key: "", role_id: "" });
      load();
    } catch (e: unknown) {
      toast((e as Error).message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (route_key: string, role_id: string, role_code: string) => {
    const key = `${route_key}::${role_id}`;
    try {
      setRemoving(key);
      await routePermissionsApi.removeRoutePermission({ route_key, role_id });
      toast(`Removed ${role_code} from ${route_key}`);
      load();
    } catch (e: unknown) {
      toast((e as Error).message, "error");
    } finally {
      setRemoving(null);
    }
  };

  // Derive method badge color
  const methodColor: Record<string, string> = {
    GET: "bg-blue-50 text-blue-700 border-blue-200",
    POST: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PATCH: "bg-amber-50 text-amber-700 border-amber-200",
    PUT: "bg-amber-50 text-amber-700 border-amber-200",
    DELETE: "bg-red-50 text-red-700 border-red-200",
  };

  const getMethod = (key: string) => key.split(":")[0] ?? "";
  const getPath = (key: string) => key.split(":").slice(1).join(":") ?? key;

  const filtered = permissions.filter(
    (p) =>
      p.route_key.toLowerCase().includes(search.toLowerCase()) ||
      p.roles.some((r) => r.role_code.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Route Permissions</h2>
          <p className="text-sm text-gray-500 mt-0.5">Control which roles can access each API route</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5">
          <Lock className="w-4 h-4" /> Add Permission
        </Button>
      </div>

      <Input
        placeholder="Search by route or role code..."
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
          <Route className="w-8 h-8 opacity-30" />
          <p className="text-sm">{search ? "No matching routes" : "No permissions set yet"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((perm) => {
            const method = getMethod(perm.route_key);
            const path = getPath(perm.route_key);
            return (
              <div
                key={perm.route_key}
                className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-sm transition-shadow"
              >
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span
                    className={`text-xs font-bold font-mono px-2 py-0.5 rounded border ${methodColor[method] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}
                  >
                    {method}
                  </span>
                  <span className="font-mono text-sm text-gray-800">{path}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {perm.roles.map((r) => {
                    const k = `${perm.route_key}::${r.role_id}`;
                    return (
                      <span
                        key={r.role_id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium"
                      >
                        {r.role_code}
                        <button
                          onClick={() => handleRemove(perm.route_key, r.role_id, r.role_code)}
                          disabled={removing === k}
                          className="hover:text-red-600 transition-colors disabled:opacity-50"
                          title={`Remove ${r.role_code}`}
                        >
                          {removing === k
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <X className="w-3 h-3" />}
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Route Permission</DialogTitle>
            <DialogDescription>Grant a role access to a specific route</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="route_key">Route Key <span className="text-red-500">*</span></Label>
              <Input
                id="route_key"
                placeholder="e.g. POST:/v1/rewards/grant"
                value={form.route_key}
                onChange={(e) => setForm((f) => ({ ...f, route_key: e.target.value }))}
                className="font-mono"
              />
              <p className="text-xs text-gray-400">Format: METHOD:/path/to/route</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="perm_role_select">Role <span className="text-red-500">*</span></Label>
              <div className="relative">
                <select
                  id="perm_role_select"
                  value={form.role_id}
                  onChange={(e) => setForm((f) => ({ ...f, role_id: e.target.value }))}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
              <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
              <Button onClick={handleAdd} disabled={submitting} className="gap-1.5">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <Unlock className="w-4 h-4" />
                Add Permission
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "roles", label: "Roles", icon: <Shield className="w-4 h-4" /> },
  { id: "assignments", label: "Assignments", icon: <UserPlus className="w-4 h-4" /> },
  { id: "permissions", label: "Route Permissions", icon: <Lock className="w-4 h-4" /> },
];

export default function RolesPage() {
  const [tab, setTab] = useState<Tab>("roles");
  const { toasts, show: toast } = useToast();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-gray-700" />
          <h1 className="text-xl font-semibold text-gray-900">Roles & Permissions</h1>
        </div>
        <p className="text-sm text-gray-500">
          Manage roles, assign them to employees, and control route-level access
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border border-gray-200 rounded-xl p-1 bg-gray-50 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${tab === t.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"}`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <Card>
        <CardContent className="pt-6">
          {tab === "roles" && <RolesSection toast={toast} />}
          {tab === "assignments" && <AssignmentsSection toast={toast} />}
          {tab === "permissions" && <RoutePermissionsSection toast={toast} />}
        </CardContent>
      </Card>

      <ToastContainer toasts={toasts} />
    </div>
  );
}