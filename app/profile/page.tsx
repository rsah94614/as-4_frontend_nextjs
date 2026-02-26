"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { fetchWithAuth } from "@/services/auth-service";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import ProtectedRoute from "@/components/features/auth/ProtectedRoute";
import {
    User,
    Mail,
    Briefcase,
    Building2,
    Shield,
    Wallet,
    CalendarDays,
    UserCheck,
    LogOut,
    Loader2,
} from "lucide-react";

interface Designation {
    designation_id: string;
    designation_name: string;
    designation_code: string;
    level: number;
}

interface Department {
    department_id: string;
    department_name: string;
    department_code: string;
    department_type?: { type_name: string; type_code: string };
}

interface Manager {
    employee_id: string;
    username: string;
    email: string;
}

interface WalletInfo {
    wallet_id: string;
    available_points: number;
    redeemed_points: number;
    total_earned_points: number;
}

interface Role {
    role_id: string;
    role_name: string;
    role_code: string;
}

interface EmployeeDetail {
    employee_id: string;
    username: string;
    email: string;
    date_of_joining: string;
    is_active: boolean;
    designation?: Designation;
    department?: Department;
    manager?: Manager;
    wallet?: WalletInfo;
    roles: Role[];
    status?: { status_name: string };
}

const EMPLOYEE_API = process.env.NEXT_PUBLIC_EMPLOYEE_API_URL;

export default function ProfilePage() {
    const { user, isAuthenticated, loading: authLoading, logoutUser } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profile, setProfile] = useState<EmployeeDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && isAuthenticated && user?.employee_id) {
            fetchProfile(user.employee_id);
        } else if (!authLoading && !isAuthenticated) {
            window.location.href = "/login";
        }
    }, [authLoading, isAuthenticated, user]);

    async function fetchProfile(employeeId: string) {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchWithAuth(
                `${EMPLOYEE_API}/v1/employees/${employeeId}`
            );
            if (!res.ok) throw new Error(`Failed to load profile (${res.status})`);
            const data: EmployeeDetail = await res.json();
            setProfile(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <ProtectedRoute>
            <div className="flex min-h-screen bg-gray-100">

                {/* Main */}
                <div className="flex-1 flex flex-col min-w-0 w-full">
                    {/* <Navbar onMenuClick={() => setSidebarOpen(true)} /> */}

                    <main className="flex-1 p-4 sm:p-6 overflow-auto">

                        {/* Loading */}
                        {(authLoading || loading) && (
                            <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm min-h-[60vh] flex items-center justify-center">
                                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                            </div>
                        )}

                        {/* Error */}
                        {!authLoading && !loading && error && (
                            <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm min-h-[60vh] flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-sm text-red-500">{error}</p>
                                    <button
                                        onClick={() => user?.employee_id && fetchProfile(user.employee_id)}
                                        className="mt-3 text-sm text-indigo-600 hover:underline"
                                    >
                                        Try again
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Profile Content */}
                        {!authLoading && !loading && !error && profile && (
                            <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm">
                                <div className="p-4 sm:p-6 md:p-8 space-y-6">

                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            {/* Avatar */}
                                            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                                                {profile.username.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <h1 className="text-lg font-semibold text-gray-900">
                                                    {profile.username}
                                                </h1>
                                                <p className="text-sm text-gray-500">{profile.email}</p>
                                                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${profile.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${profile.is_active ? "bg-green-500" : "bg-red-500"}`} />
                                                        {profile.is_active ? "Active" : "Inactive"}
                                                    </span>
                                                    {profile.roles.map((r) => (
                                                        <span key={r.role_id} className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                                                            {r.role_name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Logout */}
                                        <button
                                            onClick={logoutUser}
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-full hover:bg-red-50 transition-colors flex-shrink-0"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span className="hidden sm:inline">Logout</span>
                                        </button>
                                    </div>

                                    {/* Wallet */}
                                    {profile.wallet && (
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { label: "Available", value: profile.wallet.available_points, color: "text-indigo-600" },
                                                { label: "Redeemed", value: profile.wallet.redeemed_points, color: "text-red-500" },
                                                { label: "Total Earned", value: profile.wallet.total_earned_points, color: "text-green-600" },
                                            ].map((stat) => (
                                                <div key={stat.label} className="bg-gray-50 rounded-xl p-4 text-center border">
                                                    <Wallet className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                                                    <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{stat.label} Points</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Info Fields */}
                                    <div className="space-y-3">
                                        {[
                                            {
                                                icon: <User className="w-4 h-4 text-gray-400" />,
                                                label: "Username",
                                                value: profile.username,
                                            },
                                            {
                                                icon: <Mail className="w-4 h-4 text-gray-400" />,
                                                label: "Email",
                                                value: profile.email,
                                            },
                                            {
                                                icon: <Briefcase className="w-4 h-4 text-gray-400" />,
                                                label: "Designation",
                                                value: profile.designation
                                                    ? `${profile.designation.designation_name} (Level ${profile.designation.level})`
                                                    : "—",
                                            },
                                            {
                                                icon: <Building2 className="w-4 h-4 text-gray-400" />,
                                                label: "Department",
                                                value: profile.department
                                                    ? `${profile.department.department_name}${profile.department.department_type ? ` · ${profile.department.department_type.type_name}` : ""}`
                                                    : "—",
                                            },
                                            {
                                                icon: <UserCheck className="w-4 h-4 text-gray-400" />,
                                                label: "Manager",
                                                value: profile.manager
                                                    ? `${profile.manager.username} (${profile.manager.email})`
                                                    : "—",
                                            },
                                            {
                                                icon: <CalendarDays className="w-4 h-4 text-gray-400" />,
                                                label: "Date of Joining",
                                                value: new Date(profile.date_of_joining).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                }),
                                            },
                                            {
                                                icon: <Shield className="w-4 h-4 text-gray-400" />,
                                                label: "Roles",
                                                value: profile.roles.length > 0
                                                    ? profile.roles.map((r) => r.role_name).join(", ")
                                                    : "—",
                                            },
                                        ].map((field) => (
                                            <div key={field.label} className="flex items-start gap-3 p-4 rounded-xl border bg-white">
                                                <div className="mt-0.5 flex-shrink-0">{field.icon}</div>
                                                <div className="min-w-0">
                                                    <p className="text-xs text-gray-400">{field.label}</p>
                                                    <p className="text-sm font-medium text-gray-800 break-words">{field.value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}