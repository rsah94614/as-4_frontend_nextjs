"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isSuperDev } from "@/lib/role-utils";

interface SuperdevGuardProps {
    children: React.ReactNode;
    /** Where to redirect if the guard fails. Defaults to /dashboard */
    fallbackUrl?: string;
}

/**
 * Protects children from rendering unless:
 *  1. The environment is NOT production
 *  2. The current user has role=SUPER_DEV AND permission=VIEW_INTERNAL_LOGGER
 */
export default function SuperdevGuard({
    children,
    fallbackUrl = "/dashboard",
}: SuperdevGuardProps) {
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "allowed" | "denied">(
        "loading"
    );

    useEffect(() => {
        // Gate 1: Environment check
        if (process.env.NODE_ENV === "production") {
            setStatus("denied");
            return;
        }

        // Gate 2: RBAC check
        if (!isSuperDev()) {
            setStatus("denied");
            return;
        }

        setStatus("allowed");
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
