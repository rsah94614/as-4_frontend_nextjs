"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { fetchAdminDashboardData, type AdminDashboardData } from "@/services/analytics-service";
import { Skeleton } from "@/components/ui/skeleton";

const AdminParticipationSection = dynamic(() => import("../features/dashboard/admin/AdminParticipationSection"), {
    loading: () => <Skeleton className="h-[500px] w-full rounded-3xl" />,
});
const AdminRecognitionTrendSection = dynamic(() => import("../features/dashboard/admin/AdminRecognitionTrendSection"), {
    loading: () => <Skeleton className="h-[400px] w-full rounded-3xl" />,
});
const AdminRecognitionSection = dynamic(() => import("../features/dashboard/admin/AdminRecognitionSection"), {
    loading: () => <Skeleton className="h-[600px] w-full rounded-3xl" />,
});
const AdminTeamReportsSection = dynamic(() => import("../features/dashboard/admin/AdminTeamReportsSection"), {
    loading: () => <Skeleton className="h-[500px] w-full rounded-3xl" />,
});

export default function AdminDashboard() {
    const [data, setData] = useState<AdminDashboardData | null>(null);

    useEffect(() => {
        async function load() {
            const result = await fetchAdminDashboardData();
            setData(result);
        }
        load();
    }, []);

    return (
        <div className="space-y-6">
            <AdminParticipationSection initialData={data?.participation} />
            <AdminRecognitionTrendSection initialData={data?.recognitionTrend} />
            <AdminRecognitionSection 
                initialUsers={data?.recognitionUsers?.items} 
                initialTeams={data?.recognitionTeams?.items} 
            />
            <AdminTeamReportsSection initialTeams={data?.teams} />
        </div>
    );
}