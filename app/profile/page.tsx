"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

// 1. Swap fetchWithAuth for your dedicated employee service
import { employeeService } from "@/services/employee-service"; 

import ProtectedRoute from "@/components/features/auth/ProtectedRoute";
import ProfileSkeleton from "@/components/features/profile/ProfileSkeleton";
import ProfileHeader from "@/components/features/profile/ProfileHeader";
import ProfileStats from "@/components/features/profile/ProfileStats";
import ProfileSections from "@/components/features/profile/ProfileSections";
import { ArrowLeft } from "lucide-react";
import type { EmployeeDetail } from "@/types/profile-types";
import { Button } from "@/components/ui/button";

// 2. Removed the EMPLOYEE_API constant completely

export default function ProfilePage() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
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
            const data = await employeeService.getEmployee(employeeId);
            
            // FIX: Assert the type to match the UI's expectation. 
            // We ensure 'roles' is an array to satisfy the strict UI types.
            setProfile({
                ...data,
                roles: data.roles || []
            } as unknown as EmployeeDetail);
            
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <ProtectedRoute>
            <div className="flex min-h-screen bg-gray-50/50">
                <div className="flex-1 flex flex-col min-w-0 w-full max-w-6xl mx-auto">
                    <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">

                        {/* Loading Skeleton */}
                        {(authLoading || loading) && <ProfileSkeleton />}

                        {/* Error */}
                        {!authLoading && !loading && error && (
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 min-h-[50vh] flex flex-col items-center justify-center p-8">
                                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-2xl">⚠️</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Failed to load profile</h3>
                                <p className="text-sm text-gray-500 text-center max-w-sm">{error}</p>
                                <Button
                                    onClick={() => user?.employee_id && fetchProfile(user.employee_id)}
                                    className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                                >
                                    Try Again
                                </Button>
                            </div>
                        )}

                        {/* Profile Content */}
                        {!authLoading && !loading && !error && profile && (
                            <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Back Button */}
                                <Button
                                    variant="ghost"
                                    onClick={() => router.back()}
                                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 -ml-4 rounded-xl hover:bg-white border-transparent hover:border-gray-200"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Dashboard
                                </Button>

                                <div className="bg-white rounded-3xl border border-gray-100 shadow-xs">
                                    <div className="p-6 sm:p-8 md:p-10">
                                        <ProfileHeader profile={profile} />
                                        <ProfileStats wallet={profile.wallet} />
                                        <ProfileSections profile={profile} />
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