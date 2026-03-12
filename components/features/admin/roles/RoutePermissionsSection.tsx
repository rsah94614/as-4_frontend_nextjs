"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Shield, Plus, X, Loader2, Search, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    rolesApi,
    routePermissionsApi,
    type Role,
    type RoutePermission,
} from "@/services/roles-client";
import { MethodBadge, type ToastType } from "./UIHelpers";

interface RoutePermissionsSectionProps {
    toast: (msg: string, t?: ToastType) => void;
}

export function RoutePermissionsSection({ toast }: RoutePermissionsSectionProps) {
    const [permissions, setPermissions]     = useState<RoutePermission[]>([]);
    const [roles, setRoles]                 = useState<Role[]>([]);
    const [loading, setLoading]             = useState(true);
    const [selectedRoleId, setSelectedRoleId] = useState<string>("");
    const [removing, setRemoving]           = useState<string | null>(null);
    const [adding, setAdding]               = useState<string | null>(null);
    // Separate search state per panel so filtering one side doesn't affect the other.
    const [assignedSearch, setAssignedSearch]   = useState("");
    const [availableSearch, setAvailableSearch] = useState("");

    // ── Data loading ───────────────────────────────────────────────────────
    // IMPORTANT: selectedRoleId is NOT a dependency of `load`.
    // Role selection is purely a client-side filter over already-fetched data.
    // Including it would cause a full API round-trip on every role pill click.
    const load = useCallback(async () => {
        try {
            setLoading(true);
            const [perms, r] = await Promise.all([
                routePermissionsApi.listRoutePermissions(),
                rolesApi.listRoles(),
            ]);
            setPermissions(perms);
            setRoles(r);
            // Auto-select the first role only when we don't already have a
            // selection (i.e. initial load).  Use the functional updater so
            // we never read stale closure state.
            setSelectedRoleId((prev) => prev || (r[0]?.role_id ?? ""));
        } catch (e: unknown) {
            toast((e as Error).message, "error");
        } finally {
            setLoading(false);
        }
    }, [toast]); // ← no selectedRoleId here — intentional

    useEffect(() => {
        load();
    }, [load]);

    // ── Derived data (pure client-side) ───────────────────────────────────
    const selectedRole = roles.find((r) => r.role_id === selectedRoleId);

    // Title lookup for fast O(1) access in render
    const titleMap = useMemo(
        () => Object.fromEntries(permissions.map((p) => [p.route_key, p.title ?? ""])),
        [permissions],
    );

    // All unique sorted route keys known to the system
    const allRouteKeys = useMemo(
        () => [...new Set(permissions.map((p) => p.route_key))].sort(),
        [permissions],
    );

    // Route keys assigned to the currently selected role
    const assignedSet = useMemo(() => {
        const s = new Set<string>();
        for (const p of permissions) {
            if (p.roles.some((r) => r.role_id === selectedRoleId)) {
                s.add(p.route_key);
            }
        }
        return s;
    }, [permissions, selectedRoleId]);

    const assignedRouteKeys  = useMemo(
        () => allRouteKeys.filter((k) => assignedSet.has(k)),
        [allRouteKeys, assignedSet],
    );
    const availableRouteKeys = useMemo(
        () => allRouteKeys.filter((k) => !assignedSet.has(k)),
        [allRouteKeys, assignedSet],
    );

    // Apply search filters independently per panel
    const filterRoutes = (keys: string[], query: string) => {
        if (!query) return keys;
        const q = query.toLowerCase();
        return keys.filter(
            (k) => k.toLowerCase().includes(q) || titleMap[k].toLowerCase().includes(q),
        );
    };

    const assignedFiltered  = useMemo(
        () => filterRoutes(assignedRouteKeys,  assignedSearch),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [assignedRouteKeys,  assignedSearch,  titleMap],
    );
    const availableFiltered = useMemo(
        () => filterRoutes(availableRouteKeys, availableSearch),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [availableRouteKeys, availableSearch, titleMap],
    );

    // ── Actions ────────────────────────────────────────────────────────────
    const handleAdd = async (route_key: string) => {
        if (!selectedRoleId || !selectedRole) return;
        try {
            setAdding(route_key);
            await routePermissionsApi.addRoutePermission({ route_key, role_id: selectedRoleId });
            toast(`Added: ${titleMap[route_key] || route_key}`);
            // Optimistic update — no refetch needed
            setPermissions((prev) =>
                prev.map((p) =>
                    p.route_key !== route_key
                        ? p
                        : {
                              ...p,
                              roles: [
                                  ...p.roles,
                                  {
                                      role_id:   selectedRoleId,
                                      role_code: selectedRole.role_code,
                                      role_name: selectedRole.role_name,
                                  },
                              ],
                          },
                ),
            );
        } catch (e: unknown) {
            toast((e as Error).message, "error");
        } finally {
            setAdding(null);
        }
    };

    const handleRemove = async (route_key: string) => {
        if (!selectedRoleId) return;
        try {
            setRemoving(route_key);
            await routePermissionsApi.removeRoutePermission({ route_key, role_id: selectedRoleId });
            toast(`Removed: ${titleMap[route_key] || route_key}`);
            // Optimistic update — no refetch needed
            setPermissions((prev) =>
                prev.map((p) =>
                    p.route_key !== route_key
                        ? p
                        : { ...p, roles: p.roles.filter((r) => r.role_id !== selectedRoleId) },
                ),
            );
        } catch (e: unknown) {
            toast((e as Error).message, "error");
        } finally {
            setRemoving(null);
        }
    };

    const handleRoleSelect = (roleId: string) => {
        setSelectedRoleId(roleId);
        // Reset search when switching roles so the new view is unfiltered
        setAssignedSearch("");
        setAvailableSearch("");
    };

    // ── Render ─────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center h-48 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-5">
                <h2 className="text-base font-semibold text-gray-900">Route Permissions</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                    Select a role to view and manage its route access
                </p>
            </div>

            {/* Role selector pills */}
            <div className="flex flex-wrap gap-2 mb-6">
                {roles.map((role) => {
                    const count      = permissions.filter((p) =>
                        p.roles.some((r) => r.role_id === role.role_id),
                    ).length;
                    const isSelected = role.role_id === selectedRoleId;
                    return (
                        <button
                            key={role.role_id}
                            onClick={() => handleRoleSelect(role.role_id)}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium transition-all
                                ${
                                    isSelected
                                        ? "bg-purple-700 text-white border-purple-700 shadow-sm"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-900"
                                }`}
                        >
                            <Shield className="w-3.5 h-3.5" />
                            {role.role_name}
                            <span
                                className={`text-xs px-1.5 py-0.5 rounded-full font-mono
                                    ${isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}
                            >
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {selectedRole && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* ── Left: Assigned routes ─────────────────────────── */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-gray-900">
                                    Assigned Routes
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {assignedRouteKeys.length} routes for{" "}
                                    <span className="font-mono">{selectedRole.role_code}</span>
                                </p>
                            </div>
                            <Badge variant="secondary" className="font-mono text-xs">
                                {assignedRouteKeys.length}
                            </Badge>
                        </div>

                        <div className="px-3 py-2 border-b border-gray-100">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Filter assigned routes..."
                                    value={assignedSearch}
                                    onChange={(e) => setAssignedSearch(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                                />
                            </div>
                        </div>

                        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                            {assignedFiltered.length === 0 ? (
                                <div className="flex items-center justify-center h-24 text-gray-400">
                                    <p className="text-xs">
                                        {assignedSearch ? "No matching routes" : "No routes assigned"}
                                    </p>
                                </div>
                            ) : (
                                assignedFiltered.map((routeKey) => (
                                    <div
                                        key={routeKey}
                                        className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 group"
                                    >
                                        <div className="flex flex-col min-w-0">
                                            {titleMap[routeKey] && (
                                                <span className="text-xs font-medium text-gray-700 truncate mb-0.5">
                                                    {titleMap[routeKey]}
                                                </span>
                                            )}
                                            <MethodBadge routeKey={routeKey} />
                                        </div>
                                        <button
                                            onClick={() => handleRemove(routeKey)}
                                            disabled={removing === routeKey}
                                            aria-label={`Remove ${routeKey}`}
                                            className="ml-2 shrink-0 flex items-center gap-1 text-xs text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                        >
                                            {removing === routeKey ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <X className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* ── Right: Available routes ───────────────────────── */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
                            <p className="text-sm font-semibold text-gray-900">
                                Available Routes
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Click <ChevronRight className="inline w-3 h-3" /> to grant access
                            </p>
                        </div>

                        <div className="px-3 py-2 border-b border-gray-100">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search routes to add..."
                                    value={availableSearch}
                                    onChange={(e) => setAvailableSearch(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                                />
                            </div>
                        </div>

                        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                            {availableFiltered.length === 0 ? (
                                <div className="flex items-center justify-center h-24 text-gray-400">
                                    <p className="text-xs">
                                        {availableSearch ? "No matching routes" : "All routes assigned!"}
                                    </p>
                                </div>
                            ) : (
                                availableFiltered.map((routeKey) => (
                                    <div
                                        key={routeKey}
                                        className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 group"
                                    >
                                        <div className="flex flex-col min-w-0">
                                            {titleMap[routeKey] && (
                                                <span className="text-xs font-medium text-gray-700 truncate mb-0.5">
                                                    {titleMap[routeKey]}
                                                </span>
                                            )}
                                            <MethodBadge routeKey={routeKey} />
                                        </div>
                                        <button
                                            onClick={() => handleAdd(routeKey)}
                                            disabled={adding === routeKey}
                                            aria-label={`Add ${routeKey}`}
                                            className="ml-2 shrink-0 flex items-center gap-1 text-xs text-gray-400 hover:text-emerald-600 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                        >
                                            {adding === routeKey ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <Plus className="w-3.5 h-3.5" />
                                            )}
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