"use client";

// app/(dashboard)/control-panel/roles/page.tsx

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Shield, Plus, UserPlus, UserMinus, Lock, ChevronDown,
  X, Loader2, AlertCircle, CheckCircle2, Search, ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import {
  rolesApi, employeeRolesApi, routePermissionsApi,
  type Role, type EmployeeRole, type RoutePermission,
} from "@/services/roles-client";

// ─── Toast ────────────────────────────────────────────────────────────────────

type ToastType = "success" | "error";
interface Toast { id: number; message: string; type: ToastType; }

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
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium
          ${t.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          {t.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

type Tab = "roles" | "assignments" | "permissions";

const METHOD_COLORS: Record<string, string> = {
  GET:    "bg-blue-50 text-blue-700 border-blue-200",
  POST:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  PATCH:  "bg-amber-50 text-amber-700 border-amber-200",
  PUT:    "bg-amber-50 text-amber-700 border-amber-200",
  DELETE: "bg-red-50 text-red-700 border-red-200",
};

function MethodBadge({ routeKey }: { routeKey: string }) {
  const method = routeKey.split(":")[0] ?? "";
  const path   = routeKey.split(":").slice(1).join(":") ?? routeKey;
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className={`shrink-0 text-xs font-bold font-mono px-2 py-0.5 rounded border ${METHOD_COLORS[method] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
        {method}
      </span>
      <span className="font-mono text-sm text-gray-800 truncate">{path}</span>
    </div>
  );
}

// ─── Section: Roles ───────────────────────────────────────────────────────────

function RolesSection({ toast }: { toast: (msg: string, t?: ToastType) => void }) {
  const [roles, setRoles]       = useState<Role[]>([]);
  const [loading, setLoading]   = useState(true);
  const [open, setOpen]         = useState(false);
  const [submitting, setSub]    = useState(false);
  const [form, setForm]         = useState({ role_name: "", role_code: "", description: "" });

  const load = useCallback(async () => {
    try { setLoading(true); setRoles(await rolesApi.listRoles()); }
    catch (e: unknown) { toast((e as Error).message, "error"); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.role_name.trim() || !form.role_code.trim()) { toast("Role name and code are required", "error"); return; }
    try {
      setSub(true);
      await rolesApi.createRole(form);
      toast("Role created successfully");
      setOpen(false);
      setForm({ role_name: "", role_code: "", description: "" });
      load();
    } catch (e: unknown) { toast((e as Error).message, "error"); }
    finally { setSub(false); }
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
        <div className="flex items-center justify-center h-32 text-gray-400"><Loader2 className="w-5 h-5 animate-spin" /></div>
      ) : roles.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-gray-400 gap-2">
          <Shield className="w-8 h-8 opacity-30" /><p className="text-sm">No roles created yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {roles.map((role) => (
            <div key={role.role_id} className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{role.role_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{role.description || "No description"}</p>
                </div>
                <Badge variant="secondary" className="font-mono text-xs shrink-0">{role.role_code}</Badge>
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
              <Input id="role_name" placeholder="e.g. HR Manager" value={form.role_name}
                onChange={(e) => setForm((f) => ({ ...f, role_name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role_code">Role Code <span className="text-red-500">*</span></Label>
              <Input id="role_code" placeholder="e.g. HR_MANAGER" value={form.role_code} className="font-mono"
                onChange={(e) => setForm((f) => ({ ...f, role_code: e.target.value.toUpperCase() }))} />
              <p className="text-xs text-gray-400">Will be stored in UPPERCASE</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Optional description..." rows={3} value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="flex gap-2 pt-1 justify-end">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
              <Button onClick={handleCreate} disabled={submitting} className="gap-1.5">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Create Role
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
      const [emp, r] = await Promise.all([employeeRolesApi.listEmployeeRoles(), rolesApi.listRoles()]);
      setRecords(emp); setRoles(r);
    } catch (e: unknown) { toast((e as Error).message, "error"); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleAssign = async () => {
    if (!form.employee_id.trim() || !form.role_id) { toast("Employee ID and role are required", "error"); return; }
    try {
      setSub(true);
      await employeeRolesApi.assignRole(form);
      toast("Role assigned successfully");
      setOpen(false);
      setForm({ employee_id: "", role_id: "" });
      load();
    } catch (e: unknown) { toast((e as Error).message, "error"); }
    finally { setSub(false); }
  };

  const handleRevoke = async (record: EmployeeRole) => {
    try {
      setRevoking(record.employee_role_id);
      await employeeRolesApi.revokeRole({ employee_id: record.employee.id, role_id: record.role.id });
      toast("Role revoked");
      load();
    } catch (e: unknown) { toast((e as Error).message, "error"); }
    finally { setRevoking(null); }
  };

  const filtered = records.filter((r) =>
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

      <Input placeholder="Search by name, email or role..." value={search}
        onChange={(e) => setSearch(e.target.value)} className="mb-4 max-w-sm" />

      {loading ? (
        <div className="flex items-center justify-center h-32 text-gray-400"><Loader2 className="w-5 h-5 animate-spin" /></div>
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
                    {new Date(r.assigned_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 gap-1.5"
                      disabled={revoking === r.employee_role_id} onClick={() => handleRevoke(r)}>
                      {revoking === r.employee_role_id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserMinus className="w-3.5 h-3.5" />}
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
              <Input id="employee_id" placeholder="e.g. emp_abc123" value={form.employee_id}
                onChange={(e) => setForm((f) => ({ ...f, employee_id: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Role <span className="text-red-500">*</span></Label>
              <div className="relative">
                <select value={form.role_id} onChange={(e) => setForm((f) => ({ ...f, role_id: e.target.value }))}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-gray-900">
                  <option value="">Select a role...</option>
                  {roles.map((r) => <option key={r.role_id} value={r.role_id}>{r.role_name} ({r.role_code})</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="flex gap-2 pt-1 justify-end">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
              <Button onClick={handleAssign} disabled={submitting} className="gap-1.5">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Assign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Section: Route Permissions (role-centric) ────────────────────────────────

function RoutePermissionsSection({ toast }: { toast: (msg: string, t?: ToastType) => void }) {
  const [permissions, setPermissions] = useState<RoutePermission[]>([]);
  const [roles, setRoles]             = useState<Role[]>([]);
  const [loading, setLoading]         = useState(true);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [removing, setRemoving]       = useState<string | null>(null);
  const [adding, setAdding]           = useState<string | null>(null);
  const [routeSearch, setRouteSearch] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [perms, r] = await Promise.all([routePermissionsApi.listRoutePermissions(), rolesApi.listRoles()]);
      setPermissions(perms);
      setRoles(r);
      // Auto-select first role
      if (r.length > 0 && !selectedRoleId) setSelectedRoleId(r[0].role_id);
    } catch (e: unknown) { toast((e as Error).message, "error"); }
    finally { setLoading(false); }
  }, [toast, selectedRoleId]);

  useEffect(() => { load(); }, [load]);

  const selectedRole = roles.find((r) => r.role_id === selectedRoleId);

  // All unique route keys in the system
  const allRouteKeys = useMemo(() =>
    [...new Set(permissions.map((p) => p.route_key))].sort(),
    [permissions]
  );

  // Routes currently assigned to selected role
  const assignedRouteKeys = useMemo(() =>
    permissions
      .filter((p) => p.roles.some((r) => r.role_id === selectedRoleId))
      .map((p) => p.route_key),
    [permissions, selectedRoleId]
  );

  // Routes NOT yet assigned to selected role (available to add)
  const availableRouteKeys = useMemo(() =>
    allRouteKeys.filter((k) => !assignedRouteKeys.includes(k))
      .filter((k) => k.toLowerCase().includes(routeSearch.toLowerCase())),
    [allRouteKeys, assignedRouteKeys, routeSearch]
  );

  const assignedFiltered = useMemo(() =>
    assignedRouteKeys.filter((k) => k.toLowerCase().includes(routeSearch.toLowerCase())),
    [assignedRouteKeys, routeSearch]
  );

  const handleAdd = async (route_key: string) => {
    if (!selectedRoleId) return;
    try {
      setAdding(route_key);
      await routePermissionsApi.addRoutePermission({ route_key, role_id: selectedRoleId });
      toast(`Added ${route_key}`);
      // Optimistic update
      setPermissions((prev) => prev.map((p) =>
        p.route_key === route_key
          ? { ...p, roles: [...p.roles, { role_id: selectedRoleId, role_code: selectedRole?.role_code ?? "", role_name: selectedRole?.role_name ?? "" }] }
          : p
      ));
    } catch (e: unknown) { toast((e as Error).message, "error"); }
    finally { setAdding(null); }
  };

  const handleRemove = async (route_key: string) => {
    if (!selectedRoleId) return;
    try {
      setRemoving(route_key);
      await routePermissionsApi.removeRoutePermission({ route_key, role_id: selectedRoleId });
      toast(`Removed ${route_key}`);
      // Optimistic update
      setPermissions((prev) => prev.map((p) =>
        p.route_key === route_key
          ? { ...p, roles: p.roles.filter((r) => r.role_id !== selectedRoleId) }
          : p
      ));
    } catch (e: unknown) { toast((e as Error).message, "error"); }
    finally { setRemoving(null); }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-48 text-gray-400"><Loader2 className="w-5 h-5 animate-spin" /></div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-base font-semibold text-gray-900">Route Permissions</h2>
        <p className="text-sm text-gray-500 mt-0.5">Select a role to view and manage its route access</p>
      </div>

      {/* Role selector pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {roles.map((role) => {
          const count = permissions.filter((p) => p.roles.some((r) => r.role_id === role.role_id)).length;
          const isSelected = role.role_id === selectedRoleId;
          return (
            <button
              key={role.role_id}
              onClick={() => { setSelectedRoleId(role.role_id); setRouteSearch(""); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium transition-all
                ${isSelected
                  ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-900"}`}
            >
              <Shield className="w-3.5 h-3.5" />
              {role.role_name}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-mono
                ${isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {selectedRole && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Left: Assigned routes */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">Assigned Routes</p>
                <p className="text-xs text-gray-400 mt-0.5">{assignedRouteKeys.length} routes for <span className="font-mono">{selectedRole.role_code}</span></p>
              </div>
              <Badge variant="secondary" className="font-mono text-xs">{assignedRouteKeys.length}</Badge>
            </div>

            {/* Search inside panel */}
            <div className="px-3 py-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter routes..."
                  value={routeSearch}
                  onChange={(e) => setRouteSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                />
              </div>
            </div>

            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {assignedFiltered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 text-gray-400 gap-1">
                  <p className="text-xs">{routeSearch ? "No matching routes" : "No routes assigned"}</p>
                </div>
              ) : (
                assignedFiltered.map((routeKey) => (
                  <div key={routeKey} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 group">
                    <MethodBadge routeKey={routeKey} />
                    <button
                      onClick={() => handleRemove(routeKey)}
                      disabled={removing === routeKey}
                      className="ml-2 shrink-0 flex items-center gap-1 text-xs text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    >
                      {removing === routeKey ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Available routes to add */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
              <p className="text-sm font-semibold text-gray-900">Available Routes</p>
              <p className="text-xs text-gray-400 mt-0.5">Click <ChevronRight className="inline w-3 h-3" /> to grant access</p>
            </div>

            <div className="px-3 py-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search routes to add..."
                  value={routeSearch}
                  onChange={(e) => setRouteSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                />
              </div>
            </div>

            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {availableRouteKeys.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 text-gray-400 gap-1">
                  <p className="text-xs">{routeSearch ? "No matching routes" : "All routes assigned!"}</p>
                </div>
              ) : (
                availableRouteKeys.map((routeKey) => (
                  <div key={routeKey} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 group">
                    <MethodBadge routeKey={routeKey} />
                    <button
                      onClick={() => handleAdd(routeKey)}
                      disabled={adding === routeKey}
                      className="ml-2 shrink-0 flex items-center gap-1 text-xs text-gray-400 hover:text-emerald-600 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    >
                      {adding === routeKey ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "roles",       label: "Roles",            icon: <Shield className="w-4 h-4" /> },
  { id: "assignments", label: "Assignments",       icon: <UserPlus className="w-4 h-4" /> },
  { id: "permissions", label: "Route Permissions", icon: <Lock className="w-4 h-4" /> },
];

export default function RolesPage() {
  const [tab, setTab] = useState<Tab>("roles");
  const { toasts, show: toast } = useToast();
    const [sidebarOpen, setSidebarOpen] = useState(false);

 return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Layout */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Navbar */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">

            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-5 h-5 text-gray-700" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Roles & Permissions
                </h1>
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
                    ${
                      tab === t.id
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
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
                {tab === "permissions" && (
                  <RoutePermissionsSection toast={toast} />
                )}
              </CardContent>
            </Card>

            <ToastContainer toasts={toasts} />

          </div>
        </main>

      </div>
    </div>
  );
}