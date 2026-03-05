"use client";

import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            {/* Admin header */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-orange-100">
                        <ShieldCheck className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-sm text-muted-foreground">
                            Platform-wide overview and analytics
                        </p>
                    </div>
                </div>
                <Badge
                    variant="outline"
                    className="ml-2 border-orange-300 text-orange-600 bg-orange-50 font-semibold"
                >
                    Admin View
                </Badge>
            </div>


        </div>
    );
}
