"use client";

import { useAuth } from "@/providers/AuthProvider";
import { ADMIN_ROLES } from "@/lib/role-utils";
import AdminDashboard from "@/components/layout/AdminDashboard";
import UserDashboard from "@/components/layout/UserDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-32 w-full rounded-3xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Skeleton className="h-24 rounded-2xl" />
                    <Skeleton className="h-24 rounded-2xl" />
                    <Skeleton className="h-24 rounded-2xl" />
                    <Skeleton className="h-24 rounded-2xl" />
                </div>
                <Skeleton className="h-96 w-full rounded-3xl" />
            </div>
        );
    }

    const isAdmin = user?.roles?.some(role => (ADMIN_ROLES as readonly string[]).includes(role.toUpperCase()));

    if (isAdmin === null) return null;
    if (isAdmin) return <AdminDashboard />;
    return <UserDashboard />;
}
