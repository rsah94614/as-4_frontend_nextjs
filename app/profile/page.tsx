"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { fetchWithAuth } from "@/services/auth-service";
import ProtectedRoute from "@/components/features/auth/ProtectedRoute";
import ProfileSkeleton from "@/components/features/profile/ProfileSkeleton";
import ProfileHeader from "@/components/features/profile/ProfileHeader";
import ProfileWallet from "@/components/features/profile/ProfileWallet";
import ProfileInfoFields from "@/components/features/profile/ProfileInfoFields";
import { ArrowLeft } from "lucide-react";
import type { EmployeeDetail } from "@/types/profile-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const EMPLOYEE_API = process.env.NEXT_PUBLIC_EMPLOYEE_API_URL;

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
                <div className="flex-1 flex flex-col min-w-0 w-full">
                    <main className="flex-1 p-4 sm:p-6 overflow-auto">

                        {/* Loading Skeleton */}
                        {(authLoading || loading) && <ProfileSkeleton />}

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
                            <div className="space-y-4">
                                {/* Back Button */}
                                <Button
                                    variant="ghost"
                                    onClick={() => router.back()}
                                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 -ml-4"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back
                                </Button>

                                <Card className="border-none shadow-sm rounded-2xl md:rounded-3xl">
                                    <CardContent className="p-4 sm:p-6 md:p-8 space-y-6">
                                        <ProfileHeader profile={profile} />
                                        {profile.wallet && <ProfileWallet wallet={profile.wallet} />}
                                        <ProfileInfoFields profile={profile} />
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}