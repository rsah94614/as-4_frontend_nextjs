"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAdminUser } from "@/lib/role-utils";

interface AdminGuardProps {
    children: React.ReactNode;
    /** Where to redirect if the guard fails. Defaults to /dashboard */
    fallbackUrl?: string;
}

/**
 * Protects children from rendering unless the current user has an admin role
 * (HR_ADMIN, ADMIN, or SUPER_ADMIN).
 *
 * Works in both development and production environments.
 */
export default function SuperdevGuard({
    children,
    fallbackUrl = "/dashboard",
}: AdminGuardProps) {
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "allowed" | "denied">(
        "loading"
    );

    useEffect(() => {
        // Check if the current user has admin privileges
        const nextStatus: "allowed" | "denied" = isAdminUser()
            ? "allowed"
            : "denied";

        const id = setTimeout(() => setStatus(nextStatus), 0);
        return () => clearTimeout(id);
    }, []);

    // Redirect on denial
    useEffect(() => {
        if (status === "denied") {
            router.replace(fallbackUrl);
        }
    }, [status, router, fallbackUrl]);

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-gray-300 border-t-violet-500 rounded-full animate-spin" />
                    <p className="text-sm text-gray-500">Verifying access…</p>
                </div>
            </div>
        );
    }

    if (status === "denied") {
        return null; // Will redirect momentarily
    }

    return <>{children}</>;
}
