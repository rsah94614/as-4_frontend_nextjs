"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    Users, UserPlus, ChevronLeft, Search, Loader2,
    Building2, Briefcase, Calendar, MoreHorizontal,
    CheckCircle2, XCircle, Info, ChevronDown, Upload,
    X, Eye, EyeOff, FileSpreadsheet, Download,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast, ToastContainer } from "@/components/features/admin/roles/UIHelpers";
import { createAuthenticatedClient } from "@/lib/api-utils";
import { auth } from "@/services/auth-service";

// ─── API clients ──────────────────────────────────────────────────────────────
const empClient  = createAuthenticatedClient("/api/proxy/employees");

// Auth bulk-import needs multipart — we call fetch directly with the token.
async function authBulkImport(file: File) {
    const token = auth.getAccessToken();
    const form  = new FormData();
    form.append("file", file);
    const res = await fetch("/api/proxy/auth/bulk-import", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { detail?: string }).detail ?? `HTTP ${res.status}`);
    }
    return res.json() as Promise<BulkImportResponse>;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Designation { designation_id: string; designation_name: string; }
interface Department  { department_id: string;  department_name: string;  }
interface Status      { status_id: string;      status_code: string;      status_name: string; }

interface Employee {
    employee_id: string;
    username: string;
    email: string;
    designation_id?: string;
    designation_name?: string;
    department_id?: string;
    department_name?: string;
    manager_id?: string;
    manager_name?: string;
    date_of_joining: string;
    date_of_birth?: string;
    status_id?: string;
    status_name?: string;
    // is_active is the reliable field from the list endpoint
    is_active: boolean;
    created_at: string;
}

interface PaginationMeta {
    current_page: number; per_page: number; total: number;
    total_pages: number;  has_next: boolean; has_previous: boolean;
}

interface BulkImportRow {
    row: number; username?: string; email?: string;
    status: "success" | "error";
    error?: string; employee_id?: string;
}
interface BulkImportResponse {
    total: number; succeeded: number; failed: number;
    results: BulkImportRow[];
}

type Tab = "list" | "bulk";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ["#004C8F", "#1E3A5F", "#14532D", "#7C2D12", "#6D28D9", "#0F766E"];

function initials(name: string) {
    return name.split(/[\s._-]/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}
function formatDate(d?: string) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// StatusBadge uses is_active (boolean) — the list endpoint returns this reliably.
// status_code is NOT returned by the list endpoint, so never rely on it here.
function StatusBadge({ isActive }: { isActive: boolean }) {
    return (
        <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold"
            style={
                isActive
                    ? { background: "#D1FAE5", color: "#065F46" }
                    : { background: "#F3F4F6", color: "#6B7280" }
            }
        >
            {isActive ? <CheckCircle2 size={9} /> : <XCircle size={9} />}
            {isActive ? "Active" : "Inactive"}
        </span>
    );
}

// ─── HowItWorks ───────────────────────────────────────────────────────────────
const HOW_IT_WORKS_LIST = [
    { n: "01", title: "Create Employee",  desc: "Add employees individually via the form, providing all required profile details." },
    { n: "02", title: "Assign Manager",   desc: "Set manager_id to build the hierarchy used by digest and recognition scoping." },
    { n: "03", title: "Set DOB",          desc: "Date of birth enables birthday celebration notifications from the celebration worker." },
    { n: "04", title: "Manage Status",    desc: "Deactivate an employee via the detail panel — soft-deletes without losing history." },
];
const HOW_IT_WORKS_BULK = [
    { n: "01", title: "Download Template", desc: "Download the CSV template with correct column headers pre-filled." },
    { n: "02", title: "Fill Data",         desc: "Required: username, email, password, designation_id, department_id. Optional: manager_id, date_of_birth." },
    { n: "03", title: "Upload File",       desc: "Upload your completed CSV or XLSX file. Each row is processed independently." },
    { n: "04", title: "Review Results",    desc: "Successful rows are created immediately. Errors are listed per-row — fix and re-upload." },
];

function HowItWorks({ steps }: { steps: typeof HOW_IT_WORKS_LIST }) {
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
                        {steps.map((s) => (
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

// ─── Shared SelectField ───────────────────────────────────────────────────────
function SelectField({ id, label, value, onChange, options, placeholder, required }: {
    id: string; label: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
    placeholder: string; required?: boolean;
}) {
    return (
        <div className="space-y-1.5">
            <Label htmlFor={id} className="text-[11px] font-bold text-[#004C8F] uppercase tracking-widest">
                {label} {required && <span style={{ color: "#E31837" }}>*</span>}
            </Label>
            <div className="relative">
                <select id={id} value={value} onChange={onChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white appearance-none pr-9
                        focus:outline-none focus:ring-2 focus:ring-[#004C8F]/10 focus:border-[#004C8F]/40 font-medium transition-all">
                    <option value="">{placeholder}</option>
                    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
        </div>
    );
}

// ─── Create Employee Dialog ───────────────────────────────────────────────────
function CreateEmployeeDialog({ open, onClose, onCreated, toast, designations, departments, employees }: {
    open: boolean; onClose: () => void; onCreated: () => void;
    toast: (msg: string, t?: "success" | "error") => void;
    designations: Designation[]; departments: Department[]; employees: Employee[];
}) {
    const [submitting, setSub] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const [form, setForm] = useState({
        username: "", email: "", password: "",
        designation_id: "", department_id: "", manager_id: "",
        date_of_joining: "", date_of_birth: "",
    });

    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value }));

    const handleCreate = async () => {
        if (!form.username || !form.email || !form.password || !form.designation_id || !form.department_id || !form.date_of_joining) {
            toast("All required fields must be filled", "error"); return;
        }
        try {
            setSub(true);
            const token = auth.getAccessToken();
            await fetch("/api/proxy/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    username:       form.username,
                    email:          form.email,
                    password:       form.password,
                    designation_id: form.designation_id,
                    department_id:  form.department_id,
                    manager_id:     form.manager_id   || undefined,
                    date_of_birth:  form.date_of_birth || undefined,
                }),
            }).then(async (res) => {
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error((err as { detail?: string }).detail ?? `HTTP ${res.status}`);
                }
            });
            toast("Employee created successfully");
            onClose();
            setForm({ username: "", email: "", password: "", designation_id: "", department_id: "", manager_id: "", date_of_joining: "", date_of_birth: "" });
            onCreated();
        } catch (e: unknown) {
            toast((e as Error).message ?? "Failed to create employee", "error");
        } finally {
            setSub(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-xl border-0">
                <div className="px-6 py-4" style={{ background: "#004C8F" }}>
                    <DialogHeader>
                        <DialogTitle className="text-white font-bold text-sm">Create New Employee</DialogTitle>
                        <DialogDescription className="text-blue-200 text-xs mt-0.5">Add a new employee to the platform</DialogDescription>
                    </DialogHeader>
                </div>
                <div className="h-0.5" style={{ background: "#E31837" }} />

                <div className="p-6 space-y-4 bg-white max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="username" className="text-[11px] font-bold text-[#004C8F] uppercase tracking-widest">
                                Username <span style={{ color: "#E31837" }}>*</span>
                            </Label>
                            <Input id="username" placeholder="john.doe" value={form.username} onChange={set("username")}
                                className="border-gray-200 focus-visible:ring-0 focus-visible:border-[#004C8F]" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-[11px] font-bold text-[#004C8F] uppercase tracking-widest">
                                Email <span style={{ color: "#E31837" }}>*</span>
                            </Label>
                            <Input id="email" type="email" placeholder="john@company.com" value={form.email} onChange={set("email")}
                                className="border-gray-200 focus-visible:ring-0 focus-visible:border-[#004C8F]" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-[11px] font-bold text-[#004C8F] uppercase tracking-widest">
                            Password <span style={{ color: "#E31837" }}>*</span>
                        </Label>
                        <div className="relative">
                            <Input id="password" type={showPwd ? "text" : "password"}
                                placeholder="Min 8 chars, upper, lower, number, special"
                                value={form.password} onChange={set("password")}
                                className="border-gray-200 focus-visible:ring-0 focus-visible:border-[#004C8F] pr-10" />
                            <button type="button" onClick={() => setShowPwd((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <SelectField id="designation_id" label="Designation" required value={form.designation_id}
                            onChange={set("designation_id")} placeholder="Select…"
                            options={designations.map((d) => ({ value: d.designation_id, label: d.designation_name }))} />
                        <SelectField id="department_id" label="Department" required value={form.department_id}
                            onChange={set("department_id")} placeholder="Select…"
                            options={departments.map((d) => ({ value: d.department_id, label: d.department_name }))} />
                    </div>

                    <SelectField id="manager_id" label="Manager" value={form.manager_id}
                        onChange={set("manager_id")} placeholder="No manager (optional)"
                        options={employees.map((e) => ({ value: e.employee_id, label: `${e.username} (${e.email})` }))} />

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="doj" className="text-[11px] font-bold text-[#004C8F] uppercase tracking-widest">
                                Date of Joining <span style={{ color: "#E31837" }}>*</span>
                            </Label>
                            <Input id="doj" type="date" value={form.date_of_joining} onChange={set("date_of_joining")}
                                className="border-gray-200 focus-visible:ring-0 focus-visible:border-[#004C8F]" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="dob" className="text-[11px] font-bold text-[#004C8F] uppercase tracking-widest">Date of Birth</Label>
                            <Input id="dob" type="date" value={form.date_of_birth} onChange={set("date_of_birth")}
                                className="border-gray-200 focus-visible:ring-0 focus-visible:border-[#004C8F]" />
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                    <Button variant="outline" onClick={onClose} disabled={submitting} className="border-gray-200 text-xs font-semibold">Cancel</Button>
                    <button onClick={handleCreate} disabled={submitting}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ background: "#004C8F" }}>
                        {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Create Employee
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Employee Detail Dialog ───────────────────────────────────────────────────
function EmployeeDetailDialog({ employee, open, onClose, onUpdated, toast, designations, departments, statuses, employees: allEmployees }: {
    employee: Employee | null; open: boolean; onClose: () => void; onUpdated: () => void;
    toast: (msg: string, t?: "success" | "error") => void;
    designations: Designation[]; departments: Department[]; statuses: Status[]; employees: Employee[];
}) {
    const [editing, setEditing]   = useState(false);
    const [submitting, setSub]    = useState(false);
    const [deactivating, setDeact] = useState(false);
    const [form, setForm] = useState({ username: "", email: "", designation_id: "", department_id: "", manager_id: "", status_id: "", date_of_birth: "" });

    useEffect(() => {
        if (employee) {
            setForm({
                username:       employee.username       ?? "",
                email:          employee.email          ?? "",
                designation_id: employee.designation_id ?? "",
                department_id:  employee.department_id  ?? "",
                manager_id:     employee.manager_id     ?? "",
                status_id:      employee.status_id      ?? "",
                date_of_birth:  employee.date_of_birth  ? employee.date_of_birth.split("T")[0] : "",
            });
            setEditing(false);
        }
    }, [employee]);

    if (!employee) return null;

    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value }));

    const handleUpdate = async () => {
        try {
            setSub(true);
            const payload: Record<string, string | undefined> = {};
            if (form.username       !== employee.username)       payload.username       = form.username;
            if (form.email          !== employee.email)          payload.email          = form.email;
            if (form.designation_id !== employee.designation_id) payload.designation_id = form.designation_id;
            if (form.department_id  !== employee.department_id)  payload.department_id  = form.department_id;
            if (form.manager_id     !== (employee.manager_id ?? "")) payload.manager_id = form.manager_id || undefined;
            if (form.status_id      !== employee.status_id)      payload.status_id      = form.status_id;
            const formDob = form.date_of_birth || undefined;
            const empDob  = employee.date_of_birth ? employee.date_of_birth.split("T")[0] : undefined;
            if (formDob !== empDob) payload.date_of_birth = formDob;
            await empClient.put(`/${employee.employee_id}`, payload);
            toast("Employee updated successfully");
            setEditing(false);
            onUpdated();
        } catch (e: unknown) {
            const err = e as { response?: { data?: { detail?: string } }; message?: string };
            toast(err.response?.data?.detail || err.message || "Update failed", "error");
        } finally { setSub(false); }
    };

    const handleDeactivate = async () => {
        try {
            setDeact(true);
            await empClient.patch(`/${employee.employee_id}`);
            toast("Employee deactivated");
            onClose(); onUpdated();
        } catch (e: unknown) {
            const err = e as { response?: { data?: { detail?: string } }; message?: string };
            toast(err.response?.data?.detail || err.message || "Deactivation failed", "error");
        } finally { setDeact(false); }
    };

    const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
        <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
            <p className="text-sm font-medium text-gray-800">{value || "—"}</p>
        </div>
    );

    const colorIdx = employee.username.charCodeAt(0) % AVATAR_COLORS.length;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-xl border-0">
                <VisuallyHidden.Root><DialogTitle>Employee Details</DialogTitle></VisuallyHidden.Root>
                <div className="px-6 py-5" style={{ background: "#004C8F" }}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold text-white shrink-0"
                            style={{ background: AVATAR_COLORS[colorIdx] }}>
                            {initials(employee.username)}
                        </div>
                        <div className="min-w-0">
                            <p className="text-white font-bold truncate">{employee.username}</p>
                            <p className="text-blue-200 text-xs truncate">{employee.email}</p>
                        </div>
                        <div className="ml-auto shrink-0">
                            <StatusBadge isActive={employee.is_active} />
                        </div>
                    </div>
                </div>
                <div className="h-0.5" style={{ background: "#E31837" }} />

                <div className="p-6 bg-white max-h-[60vh] overflow-y-auto">
                    {!editing ? (
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                            <Field label="Employee ID" value={<span className="font-mono text-xs break-all">{employee.employee_id}</span>} />
                            <Field label="Designation"   value={employee.designation_name} />
                            <Field label="Department"    value={employee.department_name} />
                            <Field label="Manager"       value={employee.manager_name} />
                            <Field label="Date of Join"  value={formatDate(employee.date_of_joining)} />
                            <Field label="Date of Birth" value={formatDate(employee.date_of_birth)} />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="e_un" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Username</Label>
                                    <Input id="e_un" value={form.username} onChange={set("username")}
                                        className="border-gray-200 focus-visible:ring-0 focus-visible:border-[#004C8F] text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="e_em" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</Label>
                                    <Input id="e_em" type="email" value={form.email} onChange={set("email")}
                                        className="border-gray-200 focus-visible:ring-0 focus-visible:border-[#004C8F] text-sm" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <SelectField id="e_dsg" label="Designation" value={form.designation_id} onChange={set("designation_id")}
                                    placeholder="Select…" options={designations.map((d) => ({ value: d.designation_id, label: d.designation_name }))} />
                                <SelectField id="e_dpt" label="Department" value={form.department_id} onChange={set("department_id")}
                                    placeholder="Select…" options={departments.map((d) => ({ value: d.department_id, label: d.department_name }))} />
                            </div>
                            <SelectField id="e_mgr" label="Manager" value={form.manager_id} onChange={set("manager_id")}
                                placeholder="No manager"
                                options={allEmployees.filter((e) => e.employee_id !== employee.employee_id).map((e) => ({ value: e.employee_id, label: `${e.username} (${e.email})` }))} />
                            <div className="grid grid-cols-2 gap-3">
                                <SelectField id="e_sts" label="Status" value={form.status_id} onChange={set("status_id")}
                                    placeholder="Select…" options={statuses.map((s) => ({ value: s.status_id, label: s.status_name }))} />
                                <div className="space-y-1">
                                    <Label htmlFor="e_dob" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date of Birth</Label>
                                    <Input id="e_dob" type="date" value={form.date_of_birth} onChange={set("date_of_birth")}
                                        className="border-gray-200 focus-visible:ring-0 focus-visible:border-[#004C8F] text-sm" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
                    <div>
                        {!editing && employee.is_active && (
                            <button onClick={handleDeactivate} disabled={deactivating}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all hover:bg-red-50 disabled:opacity-40"
                                style={{ color: "#E31837" }}>
                                {deactivating ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle size={13} />}
                                Deactivate
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {editing ? (
                            <>
                                <Button variant="outline" onClick={() => setEditing(false)} disabled={submitting} className="border-gray-200 text-xs font-semibold">Cancel</Button>
                                <button onClick={handleUpdate} disabled={submitting}
                                    className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                                    style={{ background: "#004C8F" }}>
                                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    Save Changes
                                </button>
                            </>
                        ) : (
                            <>
                                <Button variant="outline" onClick={onClose} className="border-gray-200 text-xs font-semibold">Close</Button>
                                <button onClick={() => setEditing(true)}
                                    className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90"
                                    style={{ background: "#004C8F" }}>
                                    Edit
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Bulk Import Section ──────────────────────────────────────────────────────
// Required columns (from auth/router.py): username, email, password, designation_id, department_id
// Optional columns: manager_id, date_of_birth
const REQUIRED_COLS = ["username", "email", "password", "designation_id", "department_id"];
const OPTIONAL_COLS = ["manager_id", "date_of_birth"];
const CSV_TEMPLATE  = [
    [...REQUIRED_COLS, ...OPTIONAL_COLS].join(","),
    "john.doe,john.doe@company.com,Passw0rd!,<designation_uuid>,<department_uuid>,<manager_uuid>,1990-05-20",
].join("\n");

function BulkImportSection({ toast }: { toast: (msg: string, t?: "success" | "error") => void }) {
    const inputRef               = useRef<HTMLInputElement>(null);
    const [file, setFile]        = useState<File | null>(null);
    const [uploading, setUpl]    = useState(false);
    const [result, setResult]    = useState<BulkImportResponse | null>(null);
    const [resultFilter, setFlt] = useState<"all" | "success" | "error">("all");

    const handleFile = (f: File) => {
        const ext = f.name.split(".").pop()?.toLowerCase();
        if (ext !== "csv" && ext !== "xlsx") {
            toast("Only .csv and .xlsx files are supported", "error"); return;
        }
        setFile(f); setResult(null);
    };

    const handleUpload = async () => {
        if (!file) return;
        try {
            setUpl(true);
            const res = await authBulkImport(file);
            setResult(res);
            if (res.failed === 0) toast(`All ${res.succeeded} employees created successfully`);
            else toast(`${res.succeeded} created, ${res.failed} failed — review errors below`, "error");
        } catch (e: unknown) {
            toast((e as Error).message ?? "Upload failed", "error");
        } finally { setUpl(false); }
    };

    const downloadTemplate = () => {
        const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href = url; a.download = "employee_import_template.csv"; a.click();
        URL.revokeObjectURL(url);
    };

    const filtered = result?.results.filter((r) =>
        resultFilter === "all" ? true : r.status === resultFilter
    ) ?? [];

    return (
        <div className="w-full">
            <HowItWorks steps={HOW_IT_WORKS_BULK} />

            {/* Template download + upload card */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-4">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileSpreadsheet size={14} className="text-[#004C8F]" />
                        <h2 className="text-sm font-bold text-[#004C8F]">Bulk Import Employees</h2>
                    </div>
                    <button onClick={downloadTemplate}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold border border-gray-200 text-gray-600 hover:bg-[#004C8F] hover:text-white hover:border-[#004C8F] transition-all">
                        <Download size={12} /> Download Template
                    </button>
                </div>

                <div className="p-6">
                    {/* Required columns info */}
                    <div className="mb-5 p-4 rounded-lg border border-gray-100 bg-gray-50">
                        <p className="text-[11px] font-bold text-[#004C8F] uppercase tracking-widest mb-2">Column Reference</p>
                        <div className="flex flex-wrap gap-1.5">
                            {REQUIRED_COLS.map((c) => (
                                <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono"
                                    style={{ background: "#E8F1FA", color: "#004C8F" }}>
                                    {c} <span style={{ color: "#E31837" }}>*</span>
                                </span>
                            ))}
                            {OPTIONAL_COLS.map((c) => (
                                <span key={c} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-gray-100 text-gray-500">
                                    {c}
                                </span>
                            ))}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-2">
                            <span style={{ color: "#E31837" }}>*</span> Required &nbsp;·&nbsp;
                            <span className="font-mono">date_of_birth</span> format: YYYY-MM-DD &nbsp;·&nbsp;
                            IDs must be valid UUIDs from your system
                        </p>
                    </div>

                    {/* Drop zone */}
                    <div
                        className={cn(
                            "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
                            file ? "border-[#004C8F] bg-blue-50/40" : "border-gray-200 hover:border-[#004C8F]/40 hover:bg-gray-50"
                        )}
                        onClick={() => inputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); }}
                        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                    >
                        <input ref={inputRef} type="file" accept=".csv,.xlsx" className="hidden"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

                        {file ? (
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#E8F1FA" }}>
                                    <FileSpreadsheet size={20} style={{ color: "#004C8F" }} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-[#004C8F]">{file.name}</p>
                                    <p className="text-[11px] text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); if (inputRef.current) inputRef.current.value = ""; }}
                                    className="ml-2 w-6 h-6 rounded-full flex items-center justify-center bg-gray-100 hover:bg-red-100 transition-colors"
                                    style={{ color: "#E31837" }}
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 bg-gray-100">
                                    <Upload size={22} className="text-gray-400" />
                                </div>
                                <p className="text-sm font-semibold text-gray-600 mb-1">Drop your CSV or XLSX here</p>
                                <p className="text-[11px] text-gray-400">or click to browse</p>
                            </>
                        )}
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                        {file ? `Ready to import: ${file.name}` : "No file selected"}
                    </p>
                    <button onClick={handleUpload} disabled={!file || uploading}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-40"
                        style={{ background: "#E31837" }}>
                        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload size={13} />}
                        {uploading ? "Importing…" : "Import Employees"}
                    </button>
                </div>
            </div>

            {/* Results */}
            {result && (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    {/* Summary bar */}
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <p className="text-sm font-bold text-[#004C8F]">Import Results</p>
                            <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full tabular-nums">
                                {result.total} rows
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-xs font-bold" style={{ color: "#065F46" }}>
                                <CheckCircle2 size={13} /> {result.succeeded} succeeded
                            </span>
                            {result.failed > 0 && (
                                <span className="flex items-center gap-1 text-xs font-bold" style={{ color: "#B91C1C" }}>
                                    <XCircle size={13} /> {result.failed} failed
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Filter tabs */}
                    <div className="px-6 pt-3 pb-0 flex gap-1 border-b border-gray-100">
                        {(["all", "success", "error"] as const).map((f) => (
                            <button key={f} onClick={() => setFlt(f)}
                                className="px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-all capitalize"
                                style={resultFilter === f
                                    ? { color: "#004C8F", borderColor: "#E31837" }
                                    : { color: "#9CA3AF", borderColor: "transparent" }}>
                                {f === "all" ? `All (${result.total})` : f === "success" ? `Success (${result.succeeded})` : `Failed (${result.failed})`}
                            </button>
                        ))}
                    </div>

                    {/* Result rows */}
                    <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                        {filtered.map((row) => (
                            <div key={row.row} className="flex items-center px-6 py-3 gap-4">
                                <span className="text-[10px] font-black text-gray-400 tabular-nums w-8 shrink-0">#{row.row}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-gray-700 truncate">{row.username ?? "—"}</p>
                                    <p className="text-[11px] text-gray-400 truncate">{row.email ?? "—"}</p>
                                </div>
                                {row.status === "success" ? (
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: "#D1FAE5", color: "#065F46" }}>
                                            Created
                                        </span>
                                        <span className="font-mono text-[10px] text-gray-400 hidden sm:block">{row.employee_id}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 shrink-0 max-w-[240px]">
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded shrink-0" style={{ background: "#FEE2E2", color: "#B91C1C" }}>
                                            Error
                                        </span>
                                        <span className="text-[11px] text-red-600 truncate">{row.error}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Employee List Section ────────────────────────────────────────────────────
function EmployeeListSection({ toast }: { toast: (msg: string, t?: "success" | "error") => void }) {
    const [employees, setEmployees]       = useState<Employee[]>([]);
    const [loading, setLoading]           = useState(true);
    const [pagination, setPagination]     = useState<PaginationMeta | null>(null);
    const [page, setPage]                 = useState(1);
    const [search, setSearch]             = useState("");
    const [debouncedSearch, setDebounced] = useState("");
    const [createOpen, setCreateOpen]     = useState(false);
    const [selected, setSelected]         = useState<Employee | null>(null);
    const [detailOpen, setDetailOpen]     = useState(false);
    const [designations, setDesignations] = useState<Designation[]>([]);
    const [departments,  setDepartments]  = useState<Department[]>([]);
    const [statuses,     setStatuses]     = useState<Status[]>([]);
    const [filterDept,   setFilterDept]   = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    useEffect(() => {
        const t = setTimeout(() => { setDebounced(search); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [search]);

    // Designations, departments and statuses live on the org service.
    // Statuses are derived from the paginated employee list since there is no
    // dedicated status endpoint — we accumulate them across pages as employees load.
    const orgClient = createAuthenticatedClient("/api/proxy/org");

    const loadMeta = useCallback(async () => {
        try {
            const [dsgRes, dptRes] = await Promise.allSettled([
                orgClient.get("/designations"),
                orgClient.get("/departments"),
            ]);
            if (dsgRes.status === "fulfilled") {
                const d = dsgRes.value.data;
                const arr: Designation[] = Array.isArray(d) ? d : (d as { data?: Designation[] }).data ?? [];
                setDesignations(arr.sort((a, b) => a.designation_name.localeCompare(b.designation_name)));
            }
            if (dptRes.status === "fulfilled") {
                const d = dptRes.value.data;
                const arr: Department[] = Array.isArray(d) ? d : (d as { data?: Department[] }).data ?? [];
                setDepartments(arr.sort((a, b) => a.department_name.localeCompare(b.department_name)));
            }
        } catch {/* best-effort */}
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const params: Record<string, string | number> = { page, limit: 20 };
            if (debouncedSearch) params.search      = debouncedSearch;
            if (filterDept)      params.department_id = filterDept;
            if (filterStatus)    params.status_id   = filterStatus;
            const res = await empClient.get<{ data: Employee[]; pagination: PaginationMeta }>("/list", { params });
            const emps = res.data.data;
            setEmployees(emps);
            setPagination(res.data.pagination);
            // Accumulate statuses from whatever the current page returned
            setStatuses((prev) => {
                const map = new Map(prev.map((s) => [s.status_id, s]));
                for (const e of emps) {
                    if (e.status_id && e.status_name && !map.has(e.status_id))
                        map.set(e.status_id, { status_id: e.status_id, status_code: e.is_active ? "ACTIVE" : "INACTIVE", status_name: e.status_name });
                }
                return [...map.values()];
            });
        } catch (e: unknown) {
            toast((e as Error).message, "error");
        } finally { setLoading(false); }
    }, [page, debouncedSearch, filterDept, filterStatus, toast]);

    useEffect(() => { loadMeta(); }, [loadMeta]);
    useEffect(() => { load(); }, [load]);

    return (
        <div className="w-full">
            <HowItWorks steps={HOW_IT_WORKS_LIST} />

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users size={14} className="text-[#004C8F]" />
                        <h2 className="text-sm font-bold text-[#004C8F]">Employees</h2>
                        {!loading && pagination && (
                            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full tabular-nums">
                                {pagination.total}
                            </span>
                        )}
                    </div>
                    <button onClick={() => setCreateOpen(true)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95"
                        style={{ background: "#E31837" }}>
                        <UserPlus size={13} /> New Employee
                    </button>
                </div>

                {/* Filters */}
                <div className="px-6 py-3 border-b border-gray-100 flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input placeholder="Search name or email…" value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm
                                placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004C8F]/10 focus:border-[#004C8F]/40 transition-all" />
                        {search && (
                            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X size={13} />
                            </button>
                        )}
                    </div>
                    {departments.length > 0 && (
                        <div className="relative">
                            <select value={filterDept} onChange={(e) => { setFilterDept(e.target.value); setPage(1); }}
                                className="border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white appearance-none pr-8
                                    focus:outline-none focus:ring-2 focus:ring-[#004C8F]/10 focus:border-[#004C8F]/40 font-medium text-gray-600">
                                <option value="">All Departments</option>
                                {departments.map((d) => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        </div>
                    )}
                    {statuses.length > 0 && (
                        <div className="relative">
                            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                                className="border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white appearance-none pr-8
                                    focus:outline-none focus:ring-2 focus:ring-[#004C8F]/10 focus:border-[#004C8F]/40 font-medium text-gray-600">
                                <option value="">All Statuses</option>
                                {statuses.map((s) => <option key={s.status_id} value={s.status_id}>{s.status_name}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        </div>
                    )}
                </div>

                {/* Table */}
                {loading ? (
                    <div className="p-6 space-y-3">
                        {[0,1,2,3,4].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
                    </div>
                ) : employees.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                            <Users size={24} className="text-gray-300" />
                        </div>
                        <p className="text-sm font-semibold text-gray-500">
                            {debouncedSearch || filterDept || filterStatus ? "No matching employees" : "No employees yet"}
                        </p>
                    </div>
                ) : (
                    <div>
                        <div className="grid px-6 py-2.5 bg-gray-50 border-b border-gray-100"
                            style={{ gridTemplateColumns: "1fr 150px 150px 100px 80px 36px" }}>
                            {["Employee", "Designation", "Department", "Joined", "Status", ""].map((h) => (
                                <span key={h} className="text-[10px] font-black uppercase tracking-widest text-gray-400">{h}</span>
                            ))}
                        </div>
                        <div className="divide-y divide-gray-100">
                            {employees.map((emp, i) => (
                                <div key={emp.employee_id}
                                    className="grid px-6 py-3.5 items-center hover:bg-gray-50 transition-colors cursor-pointer"
                                    style={{ gridTemplateColumns: "1fr 150px 150px 100px 80px 36px" }}
                                    onClick={() => { setSelected(emp); setDetailOpen(true); }}>
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                                            style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                                            {initials(emp.username)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-[#004C8F] truncate">{emp.username}</p>
                                            <p className="text-[11px] text-gray-400 truncate">{emp.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <Briefcase size={11} className="text-gray-400 shrink-0" />
                                        <span className="text-[12px] text-gray-600 truncate">{emp.designation_name ?? "—"}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <Building2 size={11} className="text-gray-400 shrink-0" />
                                        <span className="text-[12px] text-gray-600 truncate">{emp.department_name ?? "—"}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={11} className="text-gray-400 shrink-0" />
                                        <span className="text-[11px] text-gray-400">{formatDate(emp.date_of_joining)}</span>
                                    </div>
                                    {/* Use is_active boolean — NOT status_code which isn't in list response */}
                                    <StatusBadge isActive={emp.is_active} />
                                    <div className="flex justify-end">
                                        <MoreHorizontal size={15} className="text-gray-400" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Pagination footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                        {loading ? "Loading…" : pagination
                            ? `Showing ${((page-1)*20)+1}–${Math.min(page*20, pagination.total)} of ${pagination.total} employees`
                            : ""}
                    </p>
                    {pagination && pagination.total_pages > 1 && (
                        <div className="flex items-center gap-1">
                            <button disabled={!pagination.has_previous} onClick={() => setPage((p) => p-1)}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-white disabled:opacity-40 transition-colors">
                                Prev
                            </button>
                            <span className="px-3 py-1.5 text-xs font-bold text-[#004C8F]">{page} / {pagination.total_pages}</span>
                            <button disabled={!pagination.has_next} onClick={() => setPage((p) => p+1)}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-white disabled:opacity-40 transition-colors">
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <CreateEmployeeDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreated={load}
                toast={toast} designations={designations} departments={departments} employees={employees} />
            <EmployeeDetailDialog employee={selected} open={detailOpen} onClose={() => setDetailOpen(false)}
                onUpdated={load} toast={toast} designations={designations} departments={departments}
                statuses={statuses} employees={employees} />
        </div>
    );
}

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "list", label: "Employees",    icon: <Users          className="w-4 h-4" /> },
    { id: "bulk", label: "Bulk Import",  icon: <FileSpreadsheet className="w-4 h-4" /> },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function EmployeesPage() {
    const { toasts, show: toast } = useToast();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [tab, setTab] = useState<Tab>("list");

    return (
        <div className="flex h-screen overflow-hidden bg-white">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 overflow-y-auto bg-white">

                    {/* Page Header */}
                    <div className="bg-white border-b border-gray-200 px-8 md:px-10 py-5">
                        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
                            <div>
                                <Link href="/control-panel"
                                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 hover:bg-[#004C8F] hover:text-white hover:border-[#004C8F] transition-all duration-150 mb-3 group">
                                    <ChevronLeft size={13} className="group-hover:-translate-x-0.5 transition-transform duration-150" />
                                    Back to Control Panel
                                </Link>
                                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#E31837" }}>
                                    Admin · Control Panel
                                </p>
                                <h1 className="text-2xl font-bold leading-tight" style={{ color: "#004C8F" }}>
                                    Employee Management
                                </h1>
                                <p className="text-sm text-gray-400 mt-1">
                                    Create employees · Bulk import · Manage profiles &amp; hierarchy
                                </p>
                            </div>
                            <span className="hidden md:flex items-center text-xl font-black tracking-tight select-none">
                                <span style={{ color: "#E31837" }}>A</span>
                                <span style={{ color: "#004C8F" }}>abhar</span>
                            </span>
                        </div>
                    </div>

                    {/* Red accent line */}
                    <div className="h-0.5 shrink-0" style={{ background: "#E31837" }} />

                    {/* Tab bar */}
                    <div className="bg-white border-b border-gray-200 px-8 md:px-10">
                        <div className="max-w-[1200px] mx-auto flex">
                            {TABS.map((t) => {
                                const active = tab === t.id;
                                return (
                                    <button key={t.id} onClick={() => setTab(t.id)}
                                        className="flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 transition-all -mb-px"
                                        style={active
                                            ? { color: "#004C8F", borderColor: "#E31837" }
                                            : { color: "#9CA3AF", borderColor: "transparent" }}>
                                        {t.icon}{t.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-8 md:px-10 py-8" style={{ background: "#F7F9FC" }}>
                        <div className="max-w-[1200px] mx-auto">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                                {tab === "list" && <EmployeeListSection toast={toast} />}
                                {tab === "bulk" && <BulkImportSection   toast={toast} />}
                            </div>
                        </div>
                    </div>

                </main>
            </div>

            <ToastContainer toasts={toasts} />
        </div>
    );
}