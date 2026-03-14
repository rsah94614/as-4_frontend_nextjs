"use client";

import { useEffect, useState } from "react";
import { isAdminUser } from "@/lib/role-utils";
import AdminDashboard from "@/components/layout/AdminDashboard";
import UserDashboard from "@/components/layout/UserDashboard";




export default function DashboardPage() {
    const [isAdmin, setIsAdmin] = useState(false);


    useEffect(() => {
        Promise.resolve().then(() => setIsAdmin(isAdminUser()));
    }, []);

    if (isAdmin) return <AdminDashboard />;


    return <UserDashboard />;
}
