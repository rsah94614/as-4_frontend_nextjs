"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    Users, UserPlus, Search, Loader2,
    Building2, Briefcase, Calendar, MoreHorizontal,
    CheckCircle2, XCircle, Info, ChevronDown, Upload,
    X, Eye, EyeOff, FileSpreadsheet, Download, AlertTriangle,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog, DialogContent,
    DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast, ToastContainer } from "@/components/features/admin/roles/UIHelpers";
import { auth } from "@/services/auth-service";
import { extractErrorMessage } from "@/lib/error-utils";
import { employeesClient as empClient, authClient, orgClient } from "@/services/api-clients";



async function authBulkImport(file: File) {
    const form = new FormData();
    form.append("file", file);
    const res = await authClient.post<BulkImportResponse>("/bulk-import", form, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Designation { designation_id: string; designation_name: string; }
interface Department { department_id: string; department_name: string; }
interface Status { status_id: string; status_code: string; status_name: string; }

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
    is_active: boolean;
    created_at: string;
}

interface PaginationMeta {
    current_page: number; per_page: number; total: number;
    total_pages: number; has_next: boolean; has_previous: boolean;
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

// ─── Date helpers ─────────────────────────────────────────────────────────────
function todayStr() {
    return new Date().toISOString().split("T")[0];
}
function maxDobStr() {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split("T")[0];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ["#004C8F", "#1E3A5F", "#14532D", "#7C2D12", "#6D28D9", "#0F766E"];

function initials(name: string) {
    return name.split(/[\s._-]/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}
function formatDate(d?: string) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// Active = green, Inactive = gray (no red)
function StatusBadge({ isActive }: { isActive: boolean }) {
    return (
        <span
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold whitespace-nowrap"
            style={
                isActive
                    ? { background: "#D1FAE5", color: "#065F46" }
                    : { background: "#FEE2E2", color: "#991B1B" }
            }
        >
            {isActive ? <CheckCircle2 size={9} /> : <XCircle size={9} />}
            {isActive ? "Active" : "Inactive"}
        </span>
    );
}

// ─── Confirm Deactivate Dialog ────────────────────────────────────────────────
function ConfirmDeactivateDialog({ open, username, onConfirm, onCancel, loading }: {
    open: boolean; username: string;
    onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
    return (
        <Dialog open={open} onOpenChange={onCancel}>
            <DialogContent className="w-full max-w-sm p-0 overflow-hidden rounded-xl border-0 [&>button]:hidden">
                <div className="px-6 py-5 flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                        <AlertTriangle size={22} className="text-amber-500" />
                    </div>
                    <div>
                        <DialogTitle className="text-[15px] font-bold text-foreground mb-1">Deactivate Employee?</DialogTitle>
                        <DialogDescription className="text-[13px] text-muted-foreground leading-relaxed">
                            Are you sure you want to deactivate <span className="font-semibold text-foreground">{username}</span>?
                            Their history will be preserved.
                        </DialogDescription>
                    </div>
                </div>
                <div className="px-6 pb-5 flex items-center justify-center gap-3">
                    <Button variant="outline" onClick={onCancel} disabled={loading}
                        className="border-border text-sm font-semibold px-5">
                        Cancel
                    </Button>
                    <button onClick={onConfirm} disabled={loading}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ background: "#004C8F" }}>
                        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Yes, Deactivate
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── HowItWorks ───────────────────────────────────────────────────────────────
const HOW_IT_WORKS_LIST = [
    { n: "01", title: "Create Employee", desc: "Add employees individually via the form, providing all required profile details." },
    { n: "02", title: "Assign Manager", desc: "Set manager_id to build the hierarchy used by digest and recognition scoping." },
    { n: "03", title: "Set DOB", desc: "Date of birth enables birthday celebration notifications from the celebration worker." },
    { n: "04", title: "Manage Status", desc: "Deactivate an employee via the detail panel — soft-deletes without losing history." },
];
const HOW_IT_WORKS_BULK = [
    { n: "01", title: "Download Template", desc: "Download the CSV template with correct column headers pre-filled." },
    { n: "02", title: "Fill Data", desc: "Required: username, email, password, designation_id, department_id. Optional: manager_id, date_of_birth." },
    { n: "03", title: "Upload File", desc: "Upload your completed CSV or XLSX file. Each row is processed independently." },
    { n: "04", title: "Review Results", desc: "Successful rows are created immediately. Errors are listed per-row — fix and re-upload." },
];

function HowItWorks({ steps }: { steps: typeof HOW_IT_WORKS_LIST }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="bg-white border border-border rounded-xl overflow-hidden mb-4">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Info size={13} className="text-destructive shrink-0" />
                    <span className="text-[11px] font-bold text-primary uppercase tracking-widest">How It Works</span>
                </div>
                <ChevronDown size={15} className={cn("text-muted-foreground transition-transform duration-200 shrink-0", open && "rotate-180")} />
            </button>
            {open && (
                <div className="border-t border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 divide-gray-100 sm:divide-x">
                        {steps.map((s) => (
                            <div key={s.n} className="flex gap-3 px-5 py-4">
                                <span className="text-[11px] font-black text-destructive w-6 shrink-0 tabular-nums pt-0.5">{s.n}</span>
                                <div>
                                    <p className="text-xs font-semibold text-primary mb-0.5">{s.title}</p>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Searchable Select ────────────────────────────────────────────────────────
function SearchableSelect({ id, label, value, onChange, options, placeholder, required }: {
    id: string; label: string; value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder: string; required?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    const selected = options.find((o) => o.value === value);
    const filtered = options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()));

    useEffect(() => {
        function handler(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className="space-y-1.5" ref={ref}>
            <Label htmlFor={id} className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest">
                {label} {required && <span className="text-destructive">*</span>}
            </Label>
            <div className="relative">
                <button type="button" id={id}
                    onClick={() => { setOpen((o) => !o); setQuery(""); }}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-white text-left flex items-center justify-between
                        focus:outline-none focus:ring-2 focus:ring-ring/10 focus:border-primary/40 transition-all">
                    <span className={selected ? "text-foreground font-medium" : "text-muted-foreground"}>
                        {selected ? selected.label : placeholder}
                    </span>
                    <ChevronDown size={14} className={cn("text-muted-foreground transition-transform shrink-0", open && "rotate-180")} />
                </button>

                {open && (
                    <div className="absolute z-200 w-full mt-1 bg-white border border-border rounded-lg shadow-lg overflow-hidden">
                        <div className="p-2 border-b border-gray-100">
                            <div className="relative">
                                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    autoFocus
                                    placeholder="Search…"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full pl-7 pr-3 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:border-primary/40"
                                />
                            </div>
                        </div>
                        <div className="max-h-44 overflow-y-auto">
                            <button type="button"
                                onClick={() => { onChange(""); setOpen(false); }}
                                className="w-full px-3 py-2 text-sm text-left text-muted-foreground hover:bg-muted transition-colors">
                                {placeholder}
                            </button>
                            {filtered.length === 0 ? (
                                <p className="px-3 py-2 text-sm text-muted-foreground">No results</p>
                            ) : filtered.map((o) => (
                                <button type="button" key={o.value}
                                    onClick={() => { onChange(o.value); setOpen(false); setQuery(""); }}
                                    className={cn(
                                        "w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors",
                                        o.value === value ? "font-semibold text-primary bg-blue-50/50" : "text-foreground"
                                    )}>
                                    {o.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Shared SelectField (non-searchable, used in detail/edit) ─────────────────
function SelectField({ id, label, value, onChange, options, placeholder, required }: {
    id: string; label: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
    placeholder: string; required?: boolean;
}) {
    return (
        <div className="space-y-1.5">
            <Label htmlFor={id} className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                {label} {required && <span className="text-destructive">*</span>}
            </Label>
            <div className="relative">
                <select id={id} value={value} onChange={onChange}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white appearance-none pr-9
                        focus:outline-none focus:ring-2 focus:ring-ring/10 focus:border-primary/40 font-medium transition-all text-foreground">
                    <option value="">{placeholder}</option>
                    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
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

    const isFormValid = !!(
        form.username.trim() &&
        form.email.trim() &&
        form.password.trim() &&
        form.designation_id &&
        form.department_id &&
        form.date_of_joining
    );

    const handleCreate = async () => {
        if (!form.username || !form.email || !form.password || !form.designation_id || !form.department_id || !form.date_of_joining) {
            toast("All required fields must be filled", "error"); return;
        }
        if (form.date_of_joining > todayStr()) {
            toast("Date of joining cannot be a future date", "error"); return;
        }
        if (form.date_of_birth && form.date_of_birth > maxDobStr()) {
            toast("Employee must be at least 18 years old", "error"); return;
        }
        try {
            setSub(true);
            await authClient.post("/signup", {
                username: form.username,
                email: form.email,
                password: form.password,
                designation_id: form.designation_id,
                department_id: form.department_id,
                manager_id: form.manager_id || undefined,
                date_of_birth: form.date_of_birth || undefined,
            });
            toast("Employee created successfully");
            onClose();
            setForm({ username: "", email: "", password: "", designation_id: "", department_id: "", manager_id: "", date_of_joining: "", date_of_birth: "" });
            onCreated();
        } catch (e: unknown) {
            toast(extractErrorMessage(e, "Failed to create employee"), "error");
        } finally {
            setSub(false);
        }
    };

    const fieldLabel = "text-[11px] font-bold text-muted-foreground uppercase tracking-widest";

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="w-full max-w-[95vw] sm:max-w-lg p-0 rounded-xl border-0 [&>button]:hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <div>
                        <DialogTitle className="text-[15px] font-bold text-primary">Create New Employee</DialogTitle>
                        <DialogDescription className="text-[12px] text-muted-foreground mt-0.5">Add a new employee to the platform</DialogDescription>
                    </div>
                    <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
                        <X size={14} className="text-muted-foreground" />
                    </button>
                </div>

                <div className="p-6 space-y-4 bg-white max-h-[70vh] overflow-y-auto overflow-x-visible">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="username" className={fieldLabel}>Username <span className="text-destructive">*</span></Label>
                            <Input id="username" placeholder="john.doe" value={form.username} onChange={set("username")}
                                className="border-border text-sm focus-visible:ring-0 focus-visible:border-primary" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className={fieldLabel}>Email <span className="text-destructive">*</span></Label>
                            <Input id="email" type="email" placeholder="john@company.com" value={form.email} onChange={set("email")}
                                className="border-border text-sm focus-visible:ring-0 focus-visible:border-primary" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="password" className={fieldLabel}>Password <span className="text-destructive">*</span></Label>
                        <div className="relative">
                            <Input id="password" type={showPwd ? "text" : "password"}
                                placeholder="Min 8 chars, upper, lower, number, special"
                                value={form.password} onChange={set("password")}
                                className="border-border text-sm focus-visible:ring-0 focus-visible:border-primary pr-10" />
                            <button type="button" onClick={() => setShowPwd((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <SearchableSelect id="designation_id" label="Designation" required value={form.designation_id}
                            onChange={(v) => setForm((f) => ({ ...f, designation_id: v }))} placeholder="Select…"
                            options={designations.map((d) => ({ value: d.designation_id, label: d.designation_name }))} />
                        <SearchableSelect id="department_id" label="Department" required value={form.department_id}
                            onChange={(v) => setForm((f) => ({ ...f, department_id: v }))} placeholder="Select…"
                            options={departments.map((d) => ({ value: d.department_id, label: d.department_name }))} />
                    </div>

                    <SearchableSelect id="manager_id" label="Manager" value={form.manager_id}
                        onChange={(v) => setForm((f) => ({ ...f, manager_id: v }))} placeholder="No manager (optional)"
                        options={employees.map((e) => ({ value: e.employee_id, label: `${e.username} (${e.email})` }))} />

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="doj" className={fieldLabel}>Date of Joining <span className="text-destructive">*</span></Label>
                            <Input id="doj" type="date" value={form.date_of_joining} onChange={set("date_of_joining")}
                                max={todayStr()}
                                className="border-border text-sm focus-visible:ring-0 focus-visible:border-primary" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="dob" className={fieldLabel}>Date of Birth</Label>
                            <Input id="dob" type="date" value={form.date_of_birth} onChange={set("date_of_birth")}
                                max={maxDobStr()}
                                className="border-border text-sm focus-visible:ring-0 focus-visible:border-primary" />
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-muted border-t border-gray-100 flex items-center justify-end gap-2">
                    <Button variant="outline" onClick={onClose} disabled={submitting} className="border-border text-xs font-semibold">Cancel</Button>
                    <button onClick={handleCreate} disabled={submitting || !isFormValid}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: "#003580" }}>
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
    const [editing, setEditing] = useState(false);
    const [submitting, setSub] = useState(false);
    const [deactivating, setDeact] = useState(false);
    const [confirmDeactivate, setConfirmDeactivate] = useState(false);
    const [form, setForm] = useState({ username: "", email: "", designation_id: "", department_id: "", manager_id: "", status_id: "", date_of_birth: "" });

    useEffect(() => {
        if (employee) {
            setForm({
                username: employee.username ?? "",
                email: employee.email ?? "",
                designation_id: employee.designation_id ?? "",
                department_id: employee.department_id ?? "",
                manager_id: employee.manager_id ?? "",
                status_id: employee.status_id ?? "",
                date_of_birth: employee.date_of_birth ? employee.date_of_birth.split("T")[0] : "",
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
            if (form.username !== employee.username) payload.username = form.username;
            if (form.email !== employee.email) payload.email = form.email;
            if (form.designation_id !== employee.designation_id) payload.designation_id = form.designation_id;
            if (form.department_id !== employee.department_id) payload.department_id = form.department_id;
            if (form.manager_id !== (employee.manager_id ?? "")) payload.manager_id = form.manager_id || undefined;
            if (form.status_id !== employee.status_id) payload.status_id = form.status_id;
            const formDob = form.date_of_birth || undefined;
            const empDob = employee.date_of_birth ? employee.date_of_birth.split("T")[0] : undefined;
            if (formDob !== empDob) payload.date_of_birth = formDob;
            await empClient.put(`/${employee.employee_id}`, payload);
            toast("Employee updated successfully");
            setEditing(false);
            onUpdated();
        } catch (e: unknown) {
            toast(extractErrorMessage(e, "Update failed"), "error");
        } finally { setSub(false); }
    };

    const handleDeactivate = async () => {
        try {
            setDeact(true);
            await empClient.patch(`/${employee.employee_id}`);
            toast("Employee deactivated");
            setConfirmDeactivate(false);
            onClose(); onUpdated();
        } catch (e: unknown) {
            toast(extractErrorMessage(e, "Deactivation failed"), "error");
        } finally { setDeact(false); }
    };

    const fieldLabel = "text-[11px] font-bold text-muted-foreground uppercase tracking-widest";

    const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
        <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">{label}</p>
            <p className="text-sm font-medium text-foreground wrap-words">{value || "—"}</p>
        </div>
    );

    const colorIdx = employee.username.charCodeAt(0) % AVATAR_COLORS.length;

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="w-full max-w-[95vw] sm:max-w-lg p-0 rounded-xl border border-border [&>button]:hidden">
                    <VisuallyHidden.Root><DialogTitle>Employee Details</DialogTitle></VisuallyHidden.Root>

                    {/* Header */}
                    <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                                style={{ background: AVATAR_COLORS[colorIdx] }}>
                                {initials(employee.username)}
                            </div>
                            <div>
                                <p className="text-[15px] font-bold text-primary">{employee.username}</p>
                                <p className="text-[12px] text-muted-foreground">{employee.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <StatusBadge isActive={employee.is_active} />
                            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
                                <X size={14} className="text-muted-foreground" />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 bg-white max-h-[60vh] overflow-y-auto overflow-x-visible">
                        {!editing ? (
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                <Field label="Employee ID" value={<span className="font-mono text-xs break-all">{employee.employee_id}</span>} />
                                <Field label="Designation" value={employee.designation_name} />
                                <Field label="Department" value={employee.department_name} />
                                <Field label="Manager" value={employee.manager_name} />
                                <Field label="Date of Join" value={formatDate(employee.date_of_joining)} />
                                <Field label="Date of Birth" value={formatDate(employee.date_of_birth)} />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label htmlFor="e_un" className={fieldLabel}>Username</Label>
                                        <Input id="e_un" value={form.username} onChange={set("username")}
                                            className="border-border text-sm focus-visible:ring-0 focus-visible:border-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="e_em" className={fieldLabel}>Email</Label>
                                        <Input id="e_em" type="email" value={form.email} onChange={set("email")}
                                            className="border-border text-sm focus-visible:ring-0 focus-visible:border-primary" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <SearchableSelect id="e_dsg" label="Designation" value={form.designation_id}
                                        onChange={(v) => setForm((f) => ({ ...f, designation_id: v }))}
                                        placeholder="Select…" options={designations.map((d) => ({ value: d.designation_id, label: d.designation_name }))} />
                                    <SearchableSelect id="e_dpt" label="Department" value={form.department_id}
                                        onChange={(v) => setForm((f) => ({ ...f, department_id: v }))}
                                        placeholder="Select…" options={departments.map((d) => ({ value: d.department_id, label: d.department_name }))} />
                                </div>
                                <SearchableSelect id="e_mgr" label="Manager" value={form.manager_id}
                                    onChange={(v) => setForm((f) => ({ ...f, manager_id: v }))}
                                    placeholder="No manager"
                                    options={allEmployees.filter((e) => e.employee_id !== employee.employee_id).map((e) => ({ value: e.employee_id, label: `${e.username} (${e.email})` }))} />
                                <div className="grid grid-cols-2 gap-3">
                                    <SelectField id="e_sts" label="Status" value={form.status_id} onChange={set("status_id")}
                                        placeholder="Select…" options={statuses.map((s) => ({ value: s.status_id, label: s.status_name }))} />
                                    <div className="space-y-1">
                                        <Label htmlFor="e_dob" className={fieldLabel}>Date of Birth</Label>
                                        <Input id="e_dob" type="date" value={form.date_of_birth} onChange={set("date_of_birth")}
                                            max={maxDobStr()}
                                            className="border-border text-sm focus-visible:ring-0 focus-visible:border-primary" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="px-6 py-4 bg-muted border-t border-gray-100 flex items-center justify-between gap-3">
                        <div>
                            {!editing && employee.is_active && (
                                <button onClick={() => setConfirmDeactivate(true)}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-muted-foreground border border-border hover:border-border hover:bg-white transition-all">
                                    <XCircle size={13} />
                                    Deactivate
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {editing ? (
                                <>
                                    <Button variant="outline" onClick={() => setEditing(false)} disabled={submitting} className="border-border text-xs font-semibold">Cancel</Button>
                                    <button onClick={handleUpdate} disabled={submitting}
                                        className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                                        style={{ background: "#003580" }}>
                                        {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                        Save Changes
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Button variant="outline" onClick={onClose} className="border-border text-xs font-semibold">Close</Button>
                                    <button onClick={() => setEditing(true)}
                                        className="px-5 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90"
                                        style={{ background: "#003580" }}>
                                        Edit
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <ConfirmDeactivateDialog
                open={confirmDeactivate}
                username={employee.username}
                onConfirm={handleDeactivate}
                onCancel={() => setConfirmDeactivate(false)}
                loading={deactivating}
            />
        </>
    );
}

// ─── Bulk Import Section ──────────────────────────────────────────────────────
const REQUIRED_COLS = ["username", "email", "password", "designation_id", "department_id"];
const OPTIONAL_COLS = ["manager_id", "date_of_birth"];
const CSV_TEMPLATE = [
    [...REQUIRED_COLS, ...OPTIONAL_COLS].join(","),
    "john.doe,john.doe@company.com,Passw0rd!,<designation_uuid>,<department_uuid>,<manager_uuid>,1990-05-20",
].join("\n");

function BulkImportSection({ toast }: { toast: (msg: string, t?: "success" | "error") => void }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUpl] = useState(false);
    const [result, setResult] = useState<BulkImportResponse | null>(null);
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
            toast(extractErrorMessage(e, "Upload failed"), "error");
        } finally { setUpl(false); }
    };

    const downloadTemplate = () => {
        const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "employee_import_template.csv"; a.click();
        URL.revokeObjectURL(url);
    };

    const filtered = result?.results.filter((r) =>
        resultFilter === "all" ? true : r.status === resultFilter
    ) ?? [];

    return (
        <div className="w-full">
            <HowItWorks steps={HOW_IT_WORKS_BULK} />

            <div className="bg-white border border-border rounded-xl overflow-hidden mb-4">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileSpreadsheet size={14} className="text-primary shrink-0" />
                        <h2 className="text-sm font-bold text-primary">Bulk Import Employees</h2>
                    </div>
                    <button onClick={downloadTemplate}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border text-foreground hover:bg-muted transition-all">
                        <Download size={12} /> Download Template
                    </button>
                </div>

                <div className="p-5">

                    <div
                        className={cn(
                            "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
                            file ? "border-primary bg-blue-50/30" : "border-border hover:border-border hover:bg-muted"
                        )}
                        onClick={() => inputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                    >
                        <input ref={inputRef} type="file" accept=".csv,.xlsx" className="hidden"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

                        {file ? (
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#EEF2F7" }}>
                                    <FileSpreadsheet size={18} style={{ color: "#003580" }} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-primary truncate max-w-xs">{file.name}</p>
                                    <p className="text-[11px] text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                                <button type="button"
                                    onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); if (inputRef.current) inputRef.current.value = ""; }}
                                    className="w-6 h-6 rounded-full flex items-center justify-center bg-muted hover:bg-secondary transition-colors shrink-0">
                                    <X size={12} className="text-muted-foreground" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3 bg-muted">
                                    <Upload size={18} className="text-muted-foreground" />
                                </div>
                                <p className="text-sm font-semibold text-foreground mb-1">Drop your CSV or XLSX here</p>
                                <p className="text-[11px] text-muted-foreground">or click to browse</p>
                            </>
                        )}
                    </div>
                </div>

                <div className="px-5 py-4 bg-muted border-t border-gray-100 flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground truncate">
                        {file ? `Ready: ${file.name}` : "No file selected"}
                    </p>
                    <button onClick={handleUpload} disabled={!file || uploading}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-40"
                        style={{ background: "#003580" }}>
                        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload size={13} />}
                        {uploading ? "Importing…" : "Import Employees"}
                    </button>
                </div>
            </div>

            {result && (
                <div className="bg-white border border-border rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <p className="text-sm font-bold text-primary">Import Results</p>
                            <span className="text-[10px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full tabular-nums">
                                {result.total} rows
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-xs font-bold" style={{ color: "#065F46" }}>
                                <CheckCircle2 size={13} /> {result.succeeded}
                            </span>
                            {result.failed > 0 && (
                                <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                                    <XCircle size={13} /> {result.failed} failed
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="px-5 pt-3 pb-0 flex gap-1 border-b border-gray-100">
                        {(["all", "success", "error"] as const).map((f) => (
                            <button key={f} onClick={() => setFlt(f)}
                                className="px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-all capitalize whitespace-nowrap"
                                style={resultFilter === f
                                    ? { color: "#003580", borderColor: "#003580" }
                                    : { color: "#9CA3AF", borderColor: "transparent" }}>
                                {f === "all" ? `All (${result.total})` : f === "success" ? `Success (${result.succeeded})` : `Failed (${result.failed})`}
                            </button>
                        ))}
                    </div>

                    <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                        {filtered.map((row) => (
                            <div key={row.row} className="flex items-center px-5 py-3 gap-4">
                                <span className="text-[10px] font-black text-muted-foreground tabular-nums w-8 shrink-0">#{row.row}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-foreground truncate">{row.username ?? "—"}</p>
                                    <p className="text-[11px] text-muted-foreground truncate">{row.email ?? "—"}</p>
                                </div>
                                {row.status === "success" ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded shrink-0 bg-emerald-100 text-emerald-800">
                                        Created
                                    </span>
                                ) : (
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                                            Error
                                        </span>
                                        <span className="text-[11px] text-muted-foreground truncate max-w-[200px]">{row.error}</span>
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
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebounced] = useState("");
    const [createOpen, setCreateOpen] = useState(false);
    const [selected, setSelected] = useState<Employee | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [designations, setDesignations] = useState<Designation[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [filterDept, setFilterDept] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    // Search only fires after 3+ characters (or empty to reset)
    useEffect(() => {
        if (search.length === 0 || search.length >= 3) {
            const t = setTimeout(() => { setDebounced(search); setPage(1); }, 400);
            return () => clearTimeout(t);
        }
    }, [search]);



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
        } catch {/* best-effort */ }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const params: Record<string, string | number> = { page, limit: 20 };
            if (debouncedSearch) params.search = debouncedSearch;
            if (filterDept) params.department_id = filterDept;
            if (filterStatus) params.status_id = filterStatus;
            const res = await empClient.get<{ data: Employee[]; pagination: PaginationMeta }>("/list", { params });
            const emps = res.data.data;
            setEmployees(emps);
            setPagination(res.data.pagination);
            setStatuses((prev) => {
                const map = new Map(prev.map((s) => [s.status_id, s]));
                for (const e of emps) {
                    if (e.status_id && e.status_name && !map.has(e.status_id))
                        map.set(e.status_id, { status_id: e.status_id, status_code: e.is_active ? "ACTIVE" : "INACTIVE", status_name: e.status_name });
                }
                return [...map.values()];
            });
        } catch (e: unknown) {
            toast(extractErrorMessage(e), "error");
        } finally { setLoading(false); }
    }, [page, debouncedSearch, filterDept, filterStatus, toast]);

    useEffect(() => { loadMeta(); }, [loadMeta]);
    useEffect(() => { load(); }, [load]);

    return (
        <div className="w-full">
            <HowItWorks steps={HOW_IT_WORKS_LIST} />

            <div className="bg-white border border-border rounded-xl overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users size={14} className="text-primary shrink-0" />
                        <h2 className="text-sm font-bold text-primary">Employees</h2>
                        {!loading && pagination && (
                            <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full tabular-nums">
                                {pagination.total}
                            </span>
                        )}
                    </div>
                    <button onClick={() => setCreateOpen(true)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95"
                        style={{ background: "#16A34A" }}>
                        <UserPlus size={13} />
                        New Employee
                    </button>
                </div>

                {/* Filters */}
                <div className="px-5 py-3 border-b border-gray-100 flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[180px] max-w-sm">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            placeholder="Search name or email…"
                            value={search}
<<<<<<< Updated upstream
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 rounded-lg border border-border bg-muted text-sm
                                placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/10 focus:border-primary/40 transition-all"
=======
                            onChange={(e) => setSearch(e.target.value.trimStart())}
                            className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm
                                placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003580]/10 focus:border-[#003580]/40 transition-all"
>>>>>>> Stashed changes
                        />
                        {search && (
                            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                <X size={13} />
                            </button>
                        )}
                    </div>
                    {departments.length > 0 && (
                        <div className="relative">
                            <select value={filterDept} onChange={(e) => { setFilterDept(e.target.value); setPage(1); }}
                                className="border border-border rounded-lg px-3 py-2 text-xs bg-white appearance-none pr-8
                                    focus:outline-none focus:ring-2 focus:ring-ring/10 focus:border-primary/40 font-medium text-foreground">
                                <option value="">All Departments</option>
                                {departments.map((d) => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                        </div>
                    )}
                    {statuses.length > 0 && (
                        <div className="relative">
                            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                                className="border border-border rounded-lg px-3 py-2 text-xs bg-white appearance-none pr-8
                                    focus:outline-none focus:ring-2 focus:ring-ring/10 focus:border-primary/40 font-medium text-foreground">
                                <option value="">All Statuses</option>
                                {statuses.map((s) => <option key={s.status_id} value={s.status_id}>{s.status_name}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                        </div>
                    )}
                </div>

                {/* Table */}
                {loading ? (
                    <div className="p-5 space-y-2">
                        {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
                    </div>
                ) : employees.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 gap-3">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <Users size={20} className="text-gray-300" />
                        </div>
                        <p className="text-sm font-semibold text-muted-foreground">
                            {debouncedSearch || filterDept || filterStatus ? "No matching employees" : "No employees yet"}
                        </p>
                    </div>
                ) : (
                    <div>
                        {/* Column headers */}
                        <div className="grid px-5 py-2 bg-muted border-b border-gray-100"
                            style={{ gridTemplateColumns: "2fr 1.2fr 1.2fr 1fr 100px 32px" }}>
                            {["Employee", "Designation", "Department", "Joined", "Status", ""].map((h) => (
                                <span key={h} className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{h}</span>
                            ))}
                        </div>

                        <div className="divide-y divide-gray-100">
                            {employees.map((emp) => (
                                <div key={emp.employee_id}
                                    className="grid px-5 items-center hover:bg-muted transition-colors cursor-pointer"
                                    style={{ gridTemplateColumns: "2fr 1.2fr 1.2fr 1fr 100px 32px", minHeight: "52px" }}
                                    onClick={() => { setSelected(emp); setDetailOpen(true); }}>

                                    {/* Name + email */}
                                    <div className="flex flex-col justify-center min-w-0 py-2">
                                        <p className="text-[14px] font-semibold text-primary truncate leading-5">{emp.username}</p>
                                        <p className="text-[12px] text-muted-foreground truncate leading-4">{emp.email}</p>
                                    </div>

                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <Briefcase size={12} className="text-gray-300 shrink-0" />
                                        <span className="text-[13px] text-foreground truncate">{emp.designation_name ?? "—"}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <Building2 size={12} className="text-gray-300 shrink-0" />
                                        <span className="text-[13px] text-foreground truncate">{emp.department_name ?? "—"}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={12} className="text-gray-300 shrink-0" />
                                        <span className="text-[12px] text-muted-foreground">{formatDate(emp.date_of_joining)}</span>
                                    </div>
                                    <StatusBadge isActive={emp.is_active} />
                                    <div className="flex justify-end">
                                        <MoreHorizontal size={14} className="text-gray-300" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Pagination — 20 per page */}
                <div className="px-5 py-3 bg-muted border-t border-gray-100 flex items-center justify-between gap-2">
                    <p className="text-[12px] text-muted-foreground">
                        {loading ? "Loading…" : pagination
                            ? `${((page - 1) * 20) + 1}–${Math.min(page * 20, pagination.total)} of ${pagination.total}`
                            : ""}
                    </p>
                    {pagination && pagination.total_pages > 1 && (
                        <div className="flex items-center gap-1">
                            <button disabled={!pagination.has_previous} onClick={() => setPage((p) => p - 1)}
                                className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-white disabled:opacity-40 transition-colors">
                                Prev
                            </button>
                            <span className="px-3 py-1.5 text-xs font-bold text-primary">{page} / {pagination.total_pages}</span>
                            <button disabled={!pagination.has_next} onClick={() => setPage((p) => p + 1)}
                                className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-white disabled:opacity-40 transition-colors">
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
    { id: "list", label: "Employees", icon: <Users className="w-4 h-4" /> },
    { id: "bulk", label: "Bulk Import", icon: <FileSpreadsheet className="w-4 h-4" /> },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function EmployeesPage() {
    const { toasts, show: toast } = useToast();
    const [tab, setTab] = useState<Tab>("list");

    return (
        <>
            <main className="flex-1 overflow-y-auto bg-muted">

                {/* Page Header */}
                <div className="bg-white border-b border-border px-8 md:px-10 py-5">
                    <div className="max-w-[1200px] mx-auto flex items-center justify-between">
                        <div>
                            <h1 className="text-[20px] font-bold text-primary leading-tight">
                                Employee Management
                            </h1>
                            <p className="text-[14px] text-muted-foreground mt-0.5">
                                Create employees · Bulk import · Manage profiles &amp; hierarchy
                            </p>
                        </div>
                        <span className="hidden lg:flex items-center text-xl font-black tracking-tight select-none shrink-0">
                            <span className="text-destructive">A</span>
                            <span className="text-primary">abhar</span>
                        </span>
                    </div>
                </div>

                {/* Tab bar */}
                <div className="bg-white border-b border-border px-8 md:px-10">
                    <div className="max-w-[1200px] mx-auto flex">
                        {TABS.map((t) => {
                            const active = tab === t.id;
                            return (
                                <button key={t.id} onClick={() => setTab(t.id)}
                                    className="flex items-center gap-2 px-5 py-3.5 text-[13px] font-semibold border-b-2 transition-all -mb-px whitespace-nowrap"
                                    style={active
                                        ? { color: "#003580", borderColor: "#003580" }
                                        : { color: "#9CA3AF", borderColor: "transparent" }}>
                                    {t.icon}{t.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="px-8 md:px-10 py-6">
                    <div className="max-w-[1200px] mx-auto">
                        {tab === "list" && <EmployeeListSection toast={toast} />}
                        {tab === "bulk" && <BulkImportSection toast={toast} />}
                    </div>
                </div>

            </main>
            <ToastContainer toasts={toasts} />
        </>
    );
}