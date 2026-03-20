"use client";

import ProtectedRoute from "@/components/features/auth/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <ProtectedRoute adminOnly>

            <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#eef0f8" }}>
                <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
                    <Navbar onMenuClick={() => { }} />
                    <main className="flex-1 min-h-0 overflow-auto">
                        {children}
                    </main>
                </div>
            </div>

        </ProtectedRoute>
    );
}
