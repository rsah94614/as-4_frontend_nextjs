"use client";

import { useState, useEffect, useTransition, useMemo, useRef } from "react";
import {
    Bell,
    CheckCheck,
    RefreshCw,
    Megaphone,
    BarChart3,
    Send,
    X,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Calendar,
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { extractErrorMessage } from "@/lib/error-utils";
import type {
    Notification,
    NotificationType,
    AnnouncementRequest,
    AnnouncementResponse,
    DigestEmailRequest,
    DigestResponse,
    WeeklyDigestData,
} from "@/types/notification-types";
import { Skeleton } from "@/components/ui/skeleton";
// FIX: import from the single ADMIN_ROLES / SUPER_DEV_ROLES constants so
// page-level role checks stay consistent with role-utils.ts definitions.
import { getRolesFromToken, ADMIN_ROLES } from "@/lib/role-utils";

type UserRole = "SUPER_ADMIN" | "HR_ADMIN" | "MANAGER" | "EMPLOYEE";

const CAN_POST_ANNOUNCEMENT: UserRole[] = ["SUPER_ADMIN", "HR_ADMIN"];
const CAN_GET_DIGEST:        UserRole[] = ["SUPER_ADMIN", "HR_ADMIN", "MANAGER"];
const CAN_POST_DIGEST:       UserRole[] = ["SUPER_ADMIN", "HR_ADMIN"];

// ─── Brand colours ────────────────────────────────────────────────────────────

const BRAND = {
    red:       "#E31837",
    navy:      "#004C8F",
    navyLight: "#EEF4FB",
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(iso: string): string {
    const date     = new Date(iso);
    const diffMs   = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60_000);
    if (diffMins < 1)   return "just now";
    if (diffMins < 60)  return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays  = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7)   return `${diffDays}d ago`;
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function formatWeekLabel(iso: string): string {
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
    });
}

/**
 * <input type="date"> produces "YYYY-MM-DD".
 * FastAPI's `datetime` parser requires a full ISO-8601 string with time.
 * Pass-through if a time component is already present.
 */
function toIsoDatetime(dateStr: string): string {
    if (!dateStr) return dateStr;
    if (dateStr.includes("T")) return dateStr;
    return `${dateStr}T00:00:00Z`;
}

/**
 * Read the JWT from localStorage (where auth-service.ts stores it) and return
 * an Authorization header ready to spread into any fetch() call.
 *
 * The proxy at /api/proxy/[...path]/route.ts reads this header and forwards it
 * to the upstream microservice. Without it the proxy sends no token and the
 * microservice returns 401 "Authorization header missing".
 */
function getAuthHeaders(): Record<string, string> {
    if (typeof window === "undefined") return {};
    const token = localStorage.getItem("access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

const TYPE_META: Record<
    NotificationType,
    { label: string; dot: string; textColor: string; bgColor: string }
> = {
    REVIEW:       { label: "Review",       dot: BRAND.navy, textColor: "#004C8F", bgColor: "#EEF4FB" },
    REWARD:       { label: "Reward",       dot: BRAND.red,  textColor: "#B91C1C", bgColor: "#FEF2F2" },
    SYSTEM:       { label: "System",       dot: "#6B7280",  textColor: "#374151", bgColor: "#F3F4F6" },
    CELEBRATION:  { label: "Celebration",  dot: BRAND.red,  textColor: "#9D174D", bgColor: "#FDF2F8" },
    ANNOUNCEMENT: { label: "Announcement", dot: BRAND.navy, textColor: "#004C8F", bgColor: "#EEF4FB" },
};

// ─── API helpers ──────────────────────────────────────────────────────────────
//
// ALL requests go through the Next.js proxy at /api/proxy/[...path]/route.ts.
// The proxy strips the first path segment, resolves it in SERVICE_MAP, and
// forwards the rest (plus query params + Authorization header) to the upstream.
//
// Route resolution:
//   Notifications  → /api/proxy/employees/notifications/...
//                    EMPLOYEE_API_URL/v1/employees/notifications/...
//   Digest         → /api/proxy/recognition/digest/...
//                    RECOGNITION_API_URL/v1/recognitions/digest/...
//
// IMPORTANT: Every fetch() must include getAuthHeaders() so the proxy can
// forward the Bearer token. axiosClient does this automatically via its
// interceptor; raw fetch() calls must do it explicitly.

/** POST /api/proxy/employees/notifications/announcements */
async function postAnnouncement(payload: AnnouncementRequest): Promise<AnnouncementResponse> {
    const res = await fetch("/api/proxy/employees/notifications/announcements", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(extractErrorMessage(errData, `Failed (${res.status})`));
    }
    return res.json();
}

// ─── Department / Employee lookup helpers ─────────────────────────────────────
//
// These endpoints are best-guesses based on the proxy SERVICE_MAP pattern.
// If yours differ, update the URL strings below:
//   Departments → /api/proxy/org/departments
//   Employees   → /api/proxy/employees/list
//
// Both return their lists and are only called when the user opens the
// targeting section — not on page load.

// department_name matches the actual API field (Prisma schema + department-service.ts).
// Response shape: DepartmentListResponse { departments: [], total, page, limit }
interface Department { department_id: string; department_name: string; }
interface EmployeeOption { employee_id: string; username: string; email: string; }

async function fetchDepartments(): Promise<Department[]> {
    const res = await fetch("/api/proxy/org/departments?limit=100", {
        headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error(`Could not load departments (${res.status})`);
    const data = await res.json();
    // DepartmentListResponse: { departments: [...], total, page, limit }
    if (Array.isArray(data))             return data;
    if (Array.isArray(data.departments)) return data.departments;
    if (Array.isArray(data.data))        return data.data;
    return [];
}

async function fetchEmployeeOptions(search: string): Promise<EmployeeOption[]> {
    const url = new URL("/api/proxy/employees/list", window.location.origin);
    if (search) url.searchParams.set("search", search);
    url.searchParams.set("limit", "30");
    const res = await fetch(url.toString(), {
        headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error(`Could not load employees (${res.status})`);
    const data = await res.json();
    return Array.isArray(data) ? data : (data.employees ?? data.data ?? []);
}

/** GET /api/proxy/recognition/digest?week_start=...&manager_id=... */
async function getDigest(weekStart?: string, managerId?: string): Promise<WeeklyDigestData> {
    const url = new URL("/api/proxy/recognition/digest", window.location.origin);
    if (weekStart)  url.searchParams.set("week_start",  toIsoDatetime(weekStart));
    if (managerId)  url.searchParams.set("manager_id",  managerId);
    const res = await fetch(url.toString(), {
        headers: { ...getAuthHeaders() },
    });
    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(extractErrorMessage(errData, `Failed (${res.status})`));
    }
    return res.json();
}

/** POST /api/proxy/recognition/digest/send */
async function postDigest(payload: DigestEmailRequest): Promise<DigestResponse> {
    const body: Record<string, string> = { manager_email: payload.manager_email };
    if (payload.week_start) body.week_start = toIsoDatetime(payload.week_start);
    if (payload.manager_id) body.manager_id = payload.manager_id;

    const res = await fetch("/api/proxy/recognition/digest/send", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(extractErrorMessage(errData, `Failed (${res.status})`));
    }
    return res.json();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: NotificationType }) {
    const m = TYPE_META[type] ?? TYPE_META.SYSTEM;
    return (
        <span
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10.5px] font-bold tracking-widest uppercase whitespace-nowrap rounded-sm"
            style={{ color: m.textColor, background: m.bgColor }}
        >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: m.dot }} />
            {m.label}
        </span>
    );
}

function NotificationRow({
    notification,
    onMarkRead,
}: {
    notification: Notification;
    onMarkRead: (id: string) => void;
}) {
    const isUnread = !notification.is_read;
    return (
        <button
            onClick={() => isUnread && onMarkRead(notification.notification_id)}
            className="w-full text-left flex items-start gap-4 px-5 py-4 transition-all duration-150 group"
            style={{
                background: isUnread ? "#F8FAFF" : "transparent",
                cursor:     isUnread ? "pointer" : "default",
            }}
        >
            <span className="pt-[7px] shrink-0 w-3 flex justify-center">
                {isUnread && (
                    <span className="w-2 h-2 rounded-full block" style={{ background: BRAND.navy }} />
                )}
            </span>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <TypeBadge type={notification.type} />
                    <span className="text-[11px] text-slate-400 ml-auto shrink-0 tabular-nums">
                        {formatRelativeTime(notification.created_at)}
                    </span>
                </div>
                <p
                    className="text-[13px] leading-snug"
                    style={{
                        color:      isUnread ? "#0D1B2A" : "#6B7280",
                        fontWeight: isUnread ? 600 : 400,
                    }}
                >
                    {notification.title}
                </p>
                {notification.message && (
                    <p className="text-[12px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {notification.message}
                    </p>
                )}
            </div>
        </button>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-0 divide-y divide-slate-50">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 px-5 py-4">
                    <Skeleton className="w-2 h-2 mt-2 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-[18px] w-20 rounded-sm" />
                            <Skeleton className="h-3 w-12 ml-auto rounded" />
                        </div>
                        <Skeleton className="h-[14px] w-3/4 rounded" />
                        <Skeleton className="h-3 w-1/2 rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
                style={{ background: BRAND.navyLight }}
            >
                <Bell className="w-6 h-6" style={{ color: BRAND.navy }} />
            </div>
            <p className="text-[15px] font-semibold text-slate-700">All caught up</p>
            <p className="text-[13px] text-slate-400 mt-1.5 max-w-[220px]">
                No notifications yet. Check back later.
            </p>
        </div>
    );
}

// ── Result banner ─────────────────────────────────────────────────────────────

function ResultBanner({
    type, message, onDismiss,
}: {
    type: "success" | "error";
    message: string;
    onDismiss: () => void;
}) {
    const isSuccess = type === "success";
    return (
        <div
            className="flex items-start gap-3 px-4 py-3 rounded-sm text-[13px] mb-4"
            style={{
                background: isSuccess ? "#F0FDF4" : "#FEF2F2",
                border:     `1px solid ${isSuccess ? "#BBF7D0" : "#FECACA"}`,
                color:      isSuccess ? "#166534" : "#991B1B",
            }}
        >
            {isSuccess
                ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                : <AlertCircle  className="w-4 h-4 shrink-0 mt-0.5" />
            }
            <span className="flex-1 leading-relaxed">{message}</span>
            <button onClick={onDismiss} className="shrink-0 opacity-60 hover:opacity-100">
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
        <label className="block text-[11px] font-bold tracking-widest uppercase text-slate-500 mb-1.5">
            {children}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
    );
}

const inputClass =
    "w-full border border-slate-200 rounded-sm px-3 py-2.5 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 transition bg-white";

const inputFocus = { "--tw-ring-color": BRAND.navy } as React.CSSProperties;

// ─── Announcement panel ───────────────────────────────────────────────────────
//
// Targeting modes:
//   all         → broadcast to every active employee (no ids sent)
//   departments → send department_ids[]  to the backend
//   employees   → send employee_ids[]    to the backend
//
// The backend (AnnouncementCreateRequest) supports all three — if both arrays
// are omitted it broadcasts to all; if either is provided it restricts.

type TargetMode = "all" | "departments" | "employees";

// ── Audience summary ─────────────────────────────────────────────────────────

function AudienceSummary({
    targetMode,
    deptCount,
    empCount,
}: {
    targetMode: TargetMode;
    deptCount: number;
    empCount: number;
}) {
    if (targetMode === "all") {
        return (
            <p className="text-[12px] text-slate-400 leading-relaxed">
                This announcement will be broadcast to <strong>all active employees</strong>.
            </p>
        );
    }
    if (targetMode === "departments") {
        return (
            <p className="text-[12px] text-slate-400 leading-relaxed">
                Will be sent to employees in{" "}
                <strong>{deptCount === 0 ? "no departments selected" : `${deptCount} department${deptCount !== 1 ? "s" : ""}`}</strong>.
            </p>
        );
    }
    return (
        <p className="text-[12px] text-slate-400 leading-relaxed">
            Will be sent to <strong>{empCount === 0 ? "no employees selected" : `${empCount} employee${empCount !== 1 ? "s" : ""}`}</strong>.
        </p>
    );
}

function AnnouncementPanel({ onDone }: { onDone?: () => void }) {
    const [title,      setTitle]      = useState("");
    const [message,    setMessage]    = useState("");
    const [targetMode, setTargetMode] = useState<TargetMode>("all");
    const [result,     setResult]     = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [isPending,  startTransition] = useTransition();

    // ── Department state ──────────────────────────────────────────────────────
    const [departments,      setDepartments]      = useState<Department[]>([]);
    const [deptLoading,      setDeptLoading]      = useState(false);
    const [deptError,        setDeptError]        = useState<string | null>(null);
    const [selectedDeptIds,  setSelectedDeptIds]  = useState<Set<string>>(new Set());

    // ── Employee state ────────────────────────────────────────────────────────
    const [empSearch,        setEmpSearch]        = useState("");
    const [empResults,       setEmpResults]       = useState<EmployeeOption[]>([]);
    const [empLoading,       setEmpLoading]       = useState(false);
    const [empError,         setEmpError]         = useState<string | null>(null);
    const [selectedEmps,     setSelectedEmps]     = useState<Map<string, EmployeeOption>>(new Map());

    // Load departments the first time the user switches to department mode
    const deptLoaded = useRef(false);
    const empSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    function handleTargetMode(mode: TargetMode) {
        setTargetMode(mode);
        if (mode === "departments" && !deptLoaded.current) {
            deptLoaded.current = true;
            setDeptLoading(true);
            setDeptError(null);
            fetchDepartments()
                .then(setDepartments)
                .catch(e => setDeptError(extractErrorMessage(e, "Failed to load departments")))
                .finally(() => setDeptLoading(false));
        }
    }

    function toggleDept(id: string) {
        setSelectedDeptIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) { next.delete(id); } else { next.add(id); }
            return next;
        });
    }

    function toggleEmp(emp: EmployeeOption) {
        setSelectedEmps(prev => {
            const next = new Map(prev);
            if (next.has(emp.employee_id)) { next.delete(emp.employee_id); } else { next.set(emp.employee_id, emp); }
            return next;
        });
    }

    // Debounced employee search
    function handleEmpSearch(value: string) {
        setEmpSearch(value);
        if (empSearchTimer.current) clearTimeout(empSearchTimer.current);
        empSearchTimer.current = setTimeout(() => {
            if (!value.trim()) { setEmpResults([]); return; }
            setEmpLoading(true);
            setEmpError(null);
            fetchEmployeeOptions(value.trim())
                .then(setEmpResults)
                .catch(e => setEmpError(extractErrorMessage(e, "Failed to search employees")))
                .finally(() => setEmpLoading(false));
        }, 350);
    }

    const canSubmit = (() => {
        if (!title.trim() || !message.trim()) return false;
        if (targetMode === "departments") return selectedDeptIds.size > 0;
        if (targetMode === "employees")   return selectedEmps.size > 0;
        return true; // "all"
    })();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!canSubmit) return;
        setResult(null);
        startTransition(async () => {
            try {
                const payload: AnnouncementRequest = {
                    title:   title.trim(),
                    message: message.trim(),
                };
                if (targetMode === "departments") {
                    payload.department_ids = [...selectedDeptIds];
                } else if (targetMode === "employees") {
                    payload.employee_ids = [...selectedEmps.keys()];
                }

                const res = await postAnnouncement(payload);
                setResult({
                    type: "success",
                    text: `Announcement sent to ${res.recipient_count} recipient${res.recipient_count !== 1 ? "s" : ""}.`,
                });
                // Reset form
                setTitle(""); setMessage("");
                setSelectedDeptIds(new Set()); setSelectedEmps(new Map());
                setTargetMode("all");
                onDone?.();
            } catch (err: unknown) {
                setResult({
                    type: "error",
                    text: extractErrorMessage(err, "An unexpected error occurred."),
                });
            }
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {result && (
                <ResultBanner type={result.type} message={result.text} onDismiss={() => setResult(null)} />
            )}

            {/* Subject */}
            <div>
                <FieldLabel required>Subject</FieldLabel>
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Q2 Townhall scheduled for Friday"
                    className={inputClass}
                    style={inputFocus}
                    maxLength={200}
                    disabled={isPending}
                />
            </div>

            {/* Message */}
            <div>
                <FieldLabel required>Message</FieldLabel>
                <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Write your announcement here."
                    rows={4}
                    className={`${inputClass} resize-none`}
                    style={inputFocus}
                    maxLength={2000}
                    disabled={isPending}
                />
                <p className="text-[11px] text-slate-400 mt-1 text-right">{message.length}/2000</p>
            </div>

            {/* ── Targeting mode selector ───────────────────────────────────── */}
            <div>
                <FieldLabel>Send To</FieldLabel>
                <div className="flex gap-2">
                    {(["all", "departments", "employees"] as TargetMode[]).map(mode => {
                        const labels: Record<TargetMode, string> = {
                            all:         "All Employees",
                            departments: "By Department",
                            employees:   "Specific Employees",
                        };
                        const active = targetMode === mode;
                        return (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => handleTargetMode(mode)}
                                disabled={isPending}
                                className="px-3 py-1.5 text-[12px] font-semibold rounded-sm border transition"
                                style={{
                                    background:   active ? BRAND.navy : "#fff",
                                    color:        active ? "#fff"     : "#374151",
                                    borderColor:  active ? BRAND.navy : "#D1D5DB",
                                }}
                            >
                                {labels[mode]}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Department picker ─────────────────────────────────────────── */}
            {targetMode === "departments" && (
                <div>
                    <FieldLabel required>Select Departments</FieldLabel>
                    {deptLoading && (
                        <p className="text-[12px] text-slate-400 flex items-center gap-1.5">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading departments…
                        </p>
                    )}
                    {deptError && (
                        <p className="text-[12px]" style={{ color: "#991B1B" }}>{deptError}</p>
                    )}
                    {!deptLoading && !deptError && departments.length === 0 && (
                        <p className="text-[12px] text-slate-400">No departments found.</p>
                    )}
                    {departments.length > 0 && (
                        <div
                            className="grid gap-1.5 mt-1"
                            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}
                        >
                            {departments.map(dept => {
                                const checked = selectedDeptIds.has(dept.department_id);
                                return (
                                    <label
                                        key={dept.department_id}
                                        className="flex items-center gap-2 px-3 py-2 rounded-sm border cursor-pointer text-[12.5px] transition select-none"
                                        style={{
                                            borderColor: checked ? BRAND.navy : "#E5E7EB",
                                            background:  checked ? "#EEF4FB" : "#fff",
                                            color:       checked ? BRAND.navy : "#374151",
                                            fontWeight:  checked ? 600 : 400,
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            className="accent-[#004C8F]"
                                            checked={checked}
                                            onChange={() => toggleDept(dept.department_id)}
                                            disabled={isPending}
                                        />
                                        <span style={{ color: checked ? BRAND.navy : "#374151" }}>
                                            {dept.department_name}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ── Employee picker ───────────────────────────────────────────── */}
            {targetMode === "employees" && (
                <div className="space-y-2">
                    <FieldLabel required>Search Employees</FieldLabel>

                    {/* Search input */}
                    <div className="relative">
                        <input
                            type="text"
                            value={empSearch}
                            onChange={e => handleEmpSearch(e.target.value)}
                            placeholder="Type a name or email…"
                            className={inputClass}
                            style={inputFocus}
                            disabled={isPending}
                        />
                        {empLoading && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-slate-400" />
                        )}
                    </div>
                    {empError && (
                        <p className="text-[12px]" style={{ color: "#991B1B" }}>{empError}</p>
                    )}

                    {/* Search results */}
                    {empResults.length > 0 && (
                        <div
                            className="rounded-sm border divide-y divide-slate-50 overflow-hidden"
                            style={{ borderColor: "#E5E7EB" }}
                        >
                            {empResults.map(emp => {
                                const selected = selectedEmps.has(emp.employee_id);
                                return (
                                    <button
                                        key={emp.employee_id}
                                        type="button"
                                        onClick={() => toggleEmp(emp)}
                                        disabled={isPending}
                                        className="w-full flex items-center justify-between px-4 py-2.5 text-left transition hover:bg-slate-50"
                                    >
                                        <div>
                                            <p className="text-[13px] font-medium text-slate-800">{emp.username}</p>
                                            <p className="text-[11px] text-slate-400">{emp.email}</p>
                                        </div>
                                        <span
                                            className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm shrink-0"
                                            style={{
                                                background: selected ? BRAND.navy : "#F3F4F6",
                                                color:      selected ? "#fff"     : "#6B7280",
                                            }}
                                        >
                                            {selected ? "Selected" : "Add"}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Selected employees chips */}
                    {selectedEmps.size > 0 && (
                        <div>
                            <p className="text-[10.5px] font-bold tracking-widest uppercase text-slate-400 mb-1.5">
                                Selected ({selectedEmps.size})
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {[...selectedEmps.values()].map(emp => (
                                    <span
                                        key={emp.employee_id}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[12px] font-medium"
                                        style={{ background: "#EEF4FB", color: BRAND.navy }}
                                    >
                                        {emp.username}
                                        <button
                                            type="button"
                                            onClick={() => toggleEmp(emp)}
                                            className="opacity-60 hover:opacity-100"
                                            disabled={isPending}
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <AudienceSummary targetMode={targetMode} deptCount={selectedDeptIds.size} empCount={selectedEmps.size} />

            <button
                type="submit"
                disabled={!canSubmit || isPending}
                className="flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold text-white rounded-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: BRAND.navy }}
            >
                {isPending
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                    : <><Send    className="w-4 h-4" /> Send Announcement</>
                }
            </button>
        </form>
    );
}

// ─── Digest panel ─────────────────────────────────────────────────────────────
//
// Recipient is restricted to a dropdown of manager/admin emails fetched from
// the employees API. Free-text input was removed to prevent sending the digest
// to arbitrary (non-manager) addresses.

interface ManagerOption { employee_id: string; username: string; email: string; }

async function fetchManagerOptions(): Promise<ManagerOption[]> {
    // Strategy: fetch employee-roles assignments from the roles service (which
    // has the role_code) AND the employee list (which has the canonical
    // employee_id UUID that matches employees.manager_id in the DB).
    // Cross-reference to return only MANAGER / HR_ADMIN / SUPER_ADMIN employees
    // with their correct UUID.
    //
    // FIX: Use the imported ADMIN_ROLES constant instead of a local inline set
    // so that any future changes to admin role names only need one edit.
    const ALLOWED = new Set([...ADMIN_ROLES, "MANAGER"]);

    const headers = { ...getAuthHeaders() };

    type EmpListResponse = { employees?: EmployeeOption[]; data?: EmployeeOption[] } | EmployeeOption[];

    const [rolesRes, empRes] = await Promise.all([
        fetch("/api/proxy/roles/employees", { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(new URL("/api/proxy/employees/list?limit=100", window.location.origin).toString(), { headers })
            .then(r => r.ok ? r.json() as Promise<EmpListResponse> : ({} as EmpListResponse))
            .catch((): EmpListResponse => ({})),
    ]);

    // Build a set of employee emails that have an allowed active role
    const allowedEmails = new Set<string>();
    const roleRows: { is_active: boolean; employee: { email: string }; role: { code: string } }[] =
        Array.isArray(rolesRes) ? rolesRes : [];
    for (const er of roleRows) {
        if (er.is_active && ALLOWED.has(er.role?.code?.toUpperCase())) {
            allowedEmails.add(er.employee?.email);
        }
    }

    // Use the employees list for the canonical employee_id UUID
    const empRows: EmployeeOption[] =
        Array.isArray(empRes) ? empRes : (empRes.employees ?? empRes.data ?? []);

    return empRows
        .filter(emp => allowedEmails.has(emp.email))
        .map(emp => ({
            employee_id: emp.employee_id,   // canonical UUID — matches employees.manager_id
            username:    emp.username,
            email:       emp.email,
        }));
}

function DigestPanel({ canSend }: { canSend: boolean }) {
    const [weekStart,      setWeekStart]      = useState("");
    const [managerEmail,   setManagerEmail]   = useState("");
    const [managerId,      setManagerId]      = useState("");
    const [digestData,     setDigestData]     = useState<WeeklyDigestData | null>(null);
    const [result,         setResult]         = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [isFetching,     startFetch]        = useTransition();
    const [isSending,      startSend]         = useTransition();

    function handleFetch(e: React.FormEvent) {
        e.preventDefault();
        setResult(null);
        setDigestData(null);
        startFetch(async () => {
            try {
                const data = await getDigest(weekStart || undefined, managerId || undefined);
                setDigestData(data);
            } catch (err: unknown) {
                setResult({
                    type: "error",
                    text: extractErrorMessage(err, "Failed to fetch digest."),
                });
            }
        });
    }

    function handleSend(e: React.FormEvent) {
        e.preventDefault();
        if (!managerEmail) return;
        setResult(null);
        startSend(async () => {
            try {
                const res = await postDigest({
                    manager_email: managerEmail,
                    ...(managerId  ? { manager_id:    managerId }                : {}),
                    ...(weekStart  ? { week_start:    weekStart }                : {}),
                });
                setResult({ type: res.success ? "success" : "error", text: res.message });
                if (res.data) setDigestData(res.data);
            } catch (err: unknown) {
                setResult({
                    type: "error",
                    text: extractErrorMessage(err, "Failed to send digest."),
                });
            }
        });
    }

    // Load manager list on mount so the preview filter is populated immediately.
    const [previewManagers,    setPreviewManagers]    = useState<ManagerOption[]>([]);
    const [previewMgrsLoading, setPreviewMgrsLoading] = useState(true);

    useEffect(() => {
        fetchManagerOptions()
            .then(setPreviewManagers)
            .finally(() => setPreviewMgrsLoading(false));
    }, []);

    return (
        <div className="space-y-5">
            {result && (
                <ResultBanner type={result.type} message={result.text} onDismiss={() => setResult(null)} />
            )}

            <form onSubmit={handleFetch} className="space-y-3">
                <div className="flex items-end gap-3">
                    {/* Manager filter */}
                    <div className="flex-1">
                        <FieldLabel>Manager (Team Scope)</FieldLabel>
                        {previewMgrsLoading ? (
                            <p className="text-[12px] text-slate-400 flex items-center gap-1.5 py-2.5">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading…
                            </p>
                        ) : (
                            <select
                                value={managerId}
                                onChange={e => {
                                    setManagerId(e.target.value);
                                    setDigestData(null);   // clear stale summary after scope change
                                    setResult(null);
                                    // Keep email in sync so Send form pre-fills correctly
                                    const selected = previewManagers.find(m => m.employee_id === e.target.value);
                                    setManagerEmail(selected?.email ?? "");
                                }}
                                className={inputClass}
                                style={{ ...inputFocus, color: managerId ? "#1e293b" : "#94a3b8" }}
                                disabled={isFetching}
                            >
                                <option value="">All managers (platform-wide)</option>
                                {previewManagers.map(m => (
                                    <option key={m.employee_id} value={m.employee_id}>
                                        {m.username} ({m.email})
                                    </option>
                                ))}
                            </select>
                        )}
                        <p className="text-[11px] text-slate-400 mt-1">
                            Select a manager to scope the summary to their direct reports
                        </p>
                    </div>

                    {/* Week picker */}
                    <div className="flex-1">
                        <FieldLabel>Week Starting (Monday)</FieldLabel>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                            <input
                                type="date"
                                value={weekStart}
                                onChange={e => { setWeekStart(e.target.value); setDigestData(null); }}
                                className={`${inputClass} pl-8`}
                                style={inputFocus}
                                disabled={isFetching}
                            />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">Leave blank for last completed week</p>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isFetching}
                    className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-white rounded-sm transition disabled:opacity-40"
                    style={{ background: BRAND.navy }}
                >
                    {isFetching
                        ? <><Loader2  className="w-4 h-4 animate-spin" /> Loading…</>
                        : <><BarChart3 className="w-4 h-4" /> View Summary</>
                    }
                </button>
            </form>

            {digestData && <DigestDataCard data={digestData} />}

            {canSend && (
                <form onSubmit={handleSend} className="space-y-4 pt-4 border-t border-slate-100">
                    <p className="text-[11px] font-bold tracking-widest uppercase text-slate-500">
                        Send Digest by Email
                    </p>
                    <div className="flex items-end gap-3">
                        <div className="flex-1">
                            <FieldLabel required>Recipient (Managers &amp; Admins only)</FieldLabel>
                            {previewMgrsLoading ? (
                                <p className="text-[12px] text-slate-400 flex items-center gap-1.5 py-2">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading managers…
                                </p>
                            ) : (
                                <select
                                    value={managerEmail}
                                    onChange={e => {
                                        setManagerEmail(e.target.value);
                                        const selected = previewManagers.find(m => m.email === e.target.value);
                                        setManagerId(selected?.employee_id ?? "");
                                    }}
                                    className={inputClass}
                                    style={{ ...inputFocus, color: managerEmail ? "#1e293b" : "#94a3b8" }}
                                    disabled={isSending || previewManagers.length === 0}
                                >
                                    <option value="">Select a manager or admin…</option>
                                    {previewManagers.map(m => (
                                        <option key={m.employee_id} value={m.email}>
                                            {m.username} ({m.email})
                                        </option>
                                    ))}
                                </select>
                            )}
                            {!previewMgrsLoading && previewManagers.length === 0 && (
                                <p className="text-[11px] text-slate-400 mt-1">No managers found.</p>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={!managerEmail || isSending || previewMgrsLoading}
                            className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-white rounded-sm transition disabled:opacity-40 shrink-0"
                            style={{ background: BRAND.red }}
                        >
                            {isSending
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                                : <><Send    className="w-4 h-4" /> Send</>
                            }
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

// ── Digest data card ──────────────────────────────────────────────────────────

function DigestDataCard({ data }: { data: WeeklyDigestData }) {
    const weekLabel = `${formatWeekLabel(data.week_start)} – ${formatWeekLabel(data.week_end)}`;

    const stats: { label: string; value: string | number; accent: string }[] = [
        { label: "Recognitions",   value: data.total_recognitions,   accent: BRAND.navy },
        { label: "Points Awarded", value: data.total_points_awarded, accent: BRAND.navy },
        { label: "Unique Givers",  value: data.unique_givers,        accent: BRAND.red  },
        { label: "Receivers",      value: data.unique_receivers,     accent: BRAND.red  },
    ];

    return (
        <div className="rounded-sm overflow-hidden" style={{ border: "1px solid #D1D5DB" }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ background: BRAND.navy }}>
                <span className="text-[11px] font-bold tracking-widest uppercase text-white/70">
                    Weekly Recognition Summary
                </span>
                <span className="text-[11px] text-white/60">{weekLabel}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-slate-100">
                {stats.map(s => (
                    <div key={s.label} className="px-4 py-4 text-center">
                        <div className="text-[26px] font-bold leading-none tabular-nums" style={{ color: s.accent }}>
                            {s.value}
                        </div>
                        <div className="text-[10.5px] font-semibold tracking-widest uppercase text-slate-400 mt-1.5">
                            {s.label}
                        </div>
                    </div>
                ))}
            </div>

            {(data.top_giver || data.top_receiver) && (
                <div className="px-4 py-3 border-t border-slate-100 space-y-2.5">
                    <p className="text-[10.5px] font-bold tracking-widest uppercase text-slate-400">
                        Top Performers
                    </p>
                    {data.top_giver && (
                        <PerformerRow label="Top Giver" name={data.top_giver.username} count={data.top_giver.count} accent={BRAND.navy} />
                    )}
                    {data.top_receiver && (
                        <PerformerRow label="Top Receiver" name={data.top_receiver.username} count={data.top_receiver.count} accent={BRAND.red} />
                    )}
                </div>
            )}

            {data.total_recognitions === 0 && (
                <div
                    className="px-4 py-3 text-[12.5px] leading-relaxed border-t border-slate-100"
                    style={{ color: "#374151", background: BRAND.navyLight }}
                >
                    No recognitions were submitted during this period.
                </div>
            )}
        </div>
    );
}

function PerformerRow({ label, name, count, accent }: {
    label: string; name: string; count: number; accent: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <span
                className="text-[9.5px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm whitespace-nowrap"
                style={{ background: accent, color: "#fff" }}
            >
                {label}
            </span>
            <span className="text-[13px] font-semibold text-slate-800 flex-1 truncate">{name}</span>
            <span className="text-[12px] text-slate-400 tabular-nums shrink-0">
                {count} {count === 1 ? "recognition" : "recognitions"}
            </span>
        </div>
    );
}

// ── Admin drawer ──────────────────────────────────────────────────────────────

function AdminPanel({ label, icon, accentColor, children }: {
    label: string; icon: React.ReactNode; accentColor: string; children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    return (
        <div className="rounded-sm overflow-hidden mb-3" style={{ border: "1px solid #E5E7EB" }}>
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-slate-50"
            >
                <div className="flex items-center gap-3">
                    <span
                        className="w-7 h-7 rounded-sm flex items-center justify-center"
                        style={{ background: accentColor + "18" }}
                    >
                        <span style={{ color: accentColor }}>{icon}</span>
                    </span>
                    <span className="text-[13px] font-semibold text-slate-800">{label}</span>
                </div>
                <span className="text-slate-400">
                    {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
            </button>

            {open && (
                <div className="px-5 py-5 border-t border-slate-100 bg-slate-50/40">
                    {children}
                </div>
            )}
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
    const { notifications, unreadCount, loading, error, markOne, markAll, reload } =
        useNotifications(100);

    const roles = useMemo(() => getRolesFromToken() as UserRole[], []);

    const canAnnounce   = CAN_POST_ANNOUNCEMENT.some(r => roles.includes(r));
    const canViewDigest = CAN_GET_DIGEST.some(r => roles.includes(r));
    const canSendDigest = CAN_POST_DIGEST.some(r => roles.includes(r));
    const showAdminArea = canAnnounce || canViewDigest;
    const hasUnread     = unreadCount > 0;

    return (
        <div className="flex-1 w-full">
            <div className="bg-white rounded-[20px] px-6 md:px-10 py-8 max-w-[820px] mx-auto">

                {/* ── Page header ──────────────────────────────────────────── */}
                <div className="flex items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">
                            Notifications
                        </h1>
                        {unreadCount > 0 && (
                            <span
                                className="inline-flex items-center justify-center px-2 py-0.5 rounded-sm text-[11px] font-bold text-white min-w-[22px]"
                                style={{ background: BRAND.navy }}
                            >
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={reload}
                            className="p-2 rounded-sm hover:bg-slate-100 transition text-slate-400 hover:text-slate-700"
                            title="Refresh"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={markAll}
                            disabled={!hasUnread || loading}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-sm text-[13px] font-semibold transition text-white disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ background: hasUnread ? BRAND.navy : "#94A3B8" }}
                        >
                            <CheckCheck className="w-4 h-4" />
                            Mark all read
                        </button>
                    </div>
                </div>

                {/* ── Error banner ─────────────────────────────────────────── */}
                {error && (
                    <div
                        className="mb-4 px-4 py-3 rounded-sm text-[13px] flex items-start gap-2"
                        style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B" }}
                    >
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        {error}
                    </div>
                )}

                {/* ── Admin controls ───────────────────────────────────────── */}
                {showAdminArea && (
                    <div className="mb-6">
                        <p className="text-[10.5px] font-bold tracking-widest uppercase text-slate-400 mb-3">
                            Admin Controls
                        </p>

                        {canAnnounce && (
                            <AdminPanel label="Send Announcement" icon={<Megaphone className="w-4 h-4" />} accentColor={BRAND.navy}>
                                <AnnouncementPanel onDone={reload} />
                            </AdminPanel>
                        )}

                        {canViewDigest && (
                            <AdminPanel label="Recognition Digest" icon={<BarChart3 className="w-4 h-4" />} accentColor={BRAND.red}>
                                <DigestPanel canSend={canSendDigest} />
                            </AdminPanel>
                        )}
                    </div>
                )}

                {/* ── Notification list ────────────────────────────────────── */}
                <div className="rounded-sm overflow-hidden" style={{ border: "1px solid #E5E7EB" }}>
                    <div
                        className="flex items-center justify-between px-5 py-3 border-b"
                        style={{ borderColor: "#E5E7EB", background: "#FAFAFA" }}
                    >
                        <span className="text-[10.5px] font-bold tracking-widest uppercase text-slate-500">
                            {unreadCount > 0 ? `${unreadCount} Unread` : "All Notifications"}
                        </span>
                        {unreadCount > 0 && (
                            <span className="text-[11px] text-slate-400">
                                Click a notification to mark as read
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <LoadingSkeleton />
                    ) : notifications.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {notifications.map(n => (
                                <NotificationRow
                                    key={n.notification_id}
                                    notification={n}
                                    onMarkRead={markOne}
                                />
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}