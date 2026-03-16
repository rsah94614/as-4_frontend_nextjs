"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Shield, Plus, X, Loader2, Search, Lock, Info, ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
    rolesApi,
    routePermissionsApi,
    type Role,
    type RoutePermission,
} from "@/services/roles-client";
import { extractErrorMessage } from "@/lib/error-utils";
import { MethodBadge, type ToastType } from "./UIHelpers";

interface RoutePermissionsSectionProps {
    toast: (msg: string, t?: ToastType) => void;
}

const HOW_IT_WORKS = [
    { n: "01", title: "Select a Role",    desc: "Click a role pill to load its current route permissions." },
    { n: "02", title: "Assigned Routes",  desc: "Routes in the left panel are accessible by the selected role." },
    { n: "03", title: "Grant Access",     desc: "Click + on any available route to grant the role access instantly." },
    { n: "04", title: "Revoke Access",    desc: "Hover an assigned route and click × to remove access immediately." },
];

function HowItWorks() {
    const [open, setOpen] = useState(false);
    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-6">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 sm:px-6 py-3.5 hover:bg-gray-50 transition-colors"
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
                            <div key={s.n} className="flex gap-3 px-4 sm:px-5 py-4">
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

export function RoutePermissionsSection({ toast }: RoutePermissionsSectionProps) {
    const [permissions, setPermissions]         = useState<RoutePermission[]>([]);
    const [roles, setRoles]                     = useState<Role[]>([]);
    const [loading, setLoading]                 = useState(true);
    const [selectedRoleId, setSelectedRoleId]   = useState<string>("");
    const [removing, setRemoving]               = useState<string | null>(null);
    const [adding, setAdding]                   = useState<string | null>(null);
    const [assignedSearch, setAssignedSearch]   = useState("");
    const [availableSearch, setAvailableSearch] = useState("");

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const [perms, r] = await Promise.all([
                routePermissionsApi.listRoutePermissions(),
                rolesApi.listRoles(),
            ]);
            setPermissions(perms);
            setRoles(r);
            setSelectedRoleId((prev) => prev || (r[0]?.role_id ?? ""));
        } catch (e: unknown) {
            toast(extractErrorMessage(e), "error");
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { load(); }, [load]);

    const selectedRole = roles.find((r) => r.role_id === selectedRoleId);

    const titleMap = useMemo(
        () => Object.fromEntries(permissions.map((p) => [p.route_key, p.title ?? ""])),
        [permissions],
    );

    const allRouteKeys = useMemo(
        () => [...new Set(permissions.map((p) => p.route_key))].sort(),
        [permissions],
    );

    const assignedSet = useMemo(() => {
        const s = new Set<string>();
        for (const p of permissions)
            if (p.roles.some((r) => r.role_id === selectedRoleId)) s.add(p.route_key);
        return s;
    }, [permissions, selectedRoleId]);

    const assignedRouteKeys  = useMemo(() => allRouteKeys.filter((k) =>  assignedSet.has(k)), [allRouteKeys, assignedSet]);
    const availableRouteKeys = useMemo(() => allRouteKeys.filter((k) => !assignedSet.has(k)), [allRouteKeys, assignedSet]);

    const filterRoutes = (keys: string[], query: string) => {
        if (!query) return keys;
        const q = query.toLowerCase();
        return keys.filter((k) => k.toLowerCase().includes(q) || titleMap[k]?.toLowerCase().includes(q));
    };

    const assignedFiltered  = useMemo(() => filterRoutes(assignedRouteKeys,  assignedSearch),  // eslint-disable-next-line react-hooks/exhaustive-deps
        [assignedRouteKeys, assignedSearch, titleMap]);
    const availableFiltered = useMemo(() => filterRoutes(availableRouteKeys, availableSearch), // eslint-disable-next-line react-hooks/exhaustive-deps
        [availableRouteKeys, availableSearch, titleMap]);

    const handleAdd = async (route_key: string) => {
        if (!selectedRoleId || !selectedRole) return;
        try {
            setAdding(route_key);
            await routePermissionsApi.addRoutePermission({ route_key, role_id: selectedRoleId });
            toast(`Added: ${titleMap[route_key] || route_key}`);
            setPermissions((prev) =>
                prev.map((p) => p.route_key !== route_key ? p : {
                    ...p,
                    roles: [...p.roles, { role_id: selectedRoleId, role_code: selectedRole.role_code, role_name: selectedRole.role_name }],
                }),
            );
        } catch (e: unknown) {
            toast(extractErrorMessage(e), "error");
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
            setPermissions((prev) =>
                prev.map((p) => p.route_key !== route_key ? p : {
                    ...p,
                    roles: p.roles.filter((r) => r.role_id !== selectedRoleId),
                }),
            );
        } catch (e: unknown) {
            toast(extractErrorMessage(e), "error");
        } finally {
            setRemoving(null);
        }
    };

    return (
        <div className="w-full">
            <HowItWorks />

            {/* Role selector card */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-4">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-wrap items-center gap-2">
                    <Lock size={14} className="text-[#004C8F]" />
                    <h2 className="text-sm font-bold text-[#004C8F]">Route Permissions</h2>
                    {!loading && selectedRole && (
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full tabular-nums ml-1">
                            {assignedRouteKeys.length} / {allRouteKeys.length} routes assigned
                        </span>
                    )}
                </div>

                <div className="p-4 sm:p-6">
                    {loading ? (
                        <div className="flex gap-2 flex-wrap">
                            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-9 w-28 rounded-lg" />)}
                        </div>
                    ) : (
                        <>
                            <label className="block text-[11px] font-bold text-[#004C8F] uppercase tracking-widest mb-3">
                                Select role to manage
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {roles.map((role) => {
                                    const isSelected = role.role_id === selectedRoleId;
                                    const count = allRouteKeys.filter((k) =>
                                        permissions.find((x) => x.route_key === k)?.roles.some((r) => r.role_id === role.role_id)
                                    ).length;
                                    return (
                                        <button
                                            key={role.role_id}
                                            onClick={() => setSelectedRoleId(role.role_id)}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-all duration-150"
                                            style={
                                                isSelected
                                                    ? { background: "#004C8F", color: "#fff", borderColor: "#004C8F" }
                                                    : { background: "#fff", color: "#6B7280", borderColor: "#E5E7EB" }
                                            }
                                        >
                                            <Shield size={12} />
                                            {role.role_name}
                                            <span
                                                className="text-[10px] font-black font-mono px-1.5 py-0.5 rounded"
                                                style={
                                                    isSelected
                                                        ? { background: "rgba(255,255,255,0.2)", color: "#fff" }
                                                        : { background: "#F3F4F6", color: "#6B7280" }
                                                }
                                            >
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Two-panel editor — full width, 50/50 split */}
            {!loading && selectedRole && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* ── Assigned panel ── */}
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="px-4 sm:px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-[#004C8F]">Assigned Routes</p>
                                <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{selectedRole.role_code}</p>
                            </div>
                            <span className="text-[10px] font-black text-[#004C8F] bg-blue-50 px-2 py-1 rounded tabular-nums">
                                {assignedRouteKeys.length}
                            </span>
                        </div>

                        {/* Search */}
                        <div className="px-3 sm:px-4 py-2.5 border-b border-gray-100">
                            <div className="relative">
                                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Filter routes…"
                                    value={assignedSearch}
                                    onChange={(e) => setAssignedSearch(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-gray-50
                                        placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004C8F]/10 focus:border-[#004C8F]/40"
                                />
                            </div>
                        </div>

                        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                            {assignedFiltered.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center py-10 font-medium">
                                    {assignedSearch ? "No matching routes" : "No routes assigned yet"}
                                </p>
                            ) : assignedFiltered.map((routeKey) => (
                                <div
                                    key={routeKey}
                                    className="flex items-center justify-between px-3 sm:px-4 py-2.5 hover:bg-red-50/40 group transition-colors"
                                >
                                    <div className="flex flex-col min-w-0 gap-0.5">
                                        {titleMap[routeKey] && (
                                            <span className="text-[11px] font-semibold text-gray-600 truncate">{titleMap[routeKey]}</span>
                                        )}
                                        <MethodBadge routeKey={routeKey} />
                                    </div>
                                    <button
                                        onClick={() => handleRemove(routeKey)}
                                        disabled={removing === routeKey}
                                        aria-label={`Remove ${routeKey}`}
                                        className="ml-2 shrink-0 w-6 h-6 rounded flex items-center justify-center
                                            opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all disabled:opacity-40 hover:bg-red-100"
                                        style={{ color: "#E31837" }}
                                    >
                                        {removing === routeKey
                                            ? <Loader2 className="w-3 h-3 animate-spin" />
                                            : <X size={12} />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Available panel ── */}
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="px-4 sm:px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-gray-700">Available Routes</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">Click + to grant access</p>
                            </div>
                            <span className="text-[10px] font-black text-gray-500 bg-gray-100 px-2 py-1 rounded tabular-nums">
                                {availableRouteKeys.length}
                            </span>
                        </div>

                        {/* Search */}
                        <div className="px-3 sm:px-4 py-2.5 border-b border-gray-100">
                            <div className="relative">
                                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search routes…"
                                    value={availableSearch}
                                    onChange={(e) => setAvailableSearch(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-gray-50
                                        placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004C8F]/10 focus:border-[#004C8F]/40"
                                />
                            </div>
                        </div>

                        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                            {availableFiltered.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center py-10 font-medium">
                                    {availableSearch ? "No matching routes" : "All routes assigned!"}
                                </p>
                            ) : availableFiltered.map((routeKey) => (
                                <div
                                    key={routeKey}
                                    className="flex items-center justify-between px-3 sm:px-4 py-2.5 hover:bg-gray-50 group transition-colors"
                                >
                                    <div className="flex flex-col min-w-0 gap-0.5">
                                        {titleMap[routeKey] && (
                                            <span className="text-[11px] font-semibold text-gray-600 truncate">{titleMap[routeKey]}</span>
                                        )}
                                        <MethodBadge routeKey={routeKey} />
                                    </div>
                                    <button
                                        onClick={() => handleAdd(routeKey)}
                                        disabled={adding === routeKey}
                                        aria-label={`Add ${routeKey}`}
                                        className="ml-2 shrink-0 w-6 h-6 rounded flex items-center justify-center
                                            opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all disabled:opacity-40
                                            hover:bg-green-100 text-emerald-600"
                                    >
                                        {adding === routeKey
                                            ? <Loader2 className="w-3 h-3 animate-spin" />
                                            : <Plus size={12} />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
