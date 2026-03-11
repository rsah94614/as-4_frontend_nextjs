"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminTeamDetailSection, { AdminTeamDetailSkeleton } from "@/components/features/dashboard/AdminTeamDetailSection";
import { fetchTeamReport } from "@/services/analytics-service";
import type { TeamReportResponse } from "@/types/dashboard-types";

type FetchState =
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "ok"; data: TeamReportResponse };

export default function TeamReportPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [state, setState] = useState<FetchState>({ status: "loading" });

    useEffect(() => {
        if (!id) return;
        let cancelled = false;
        fetchTeamReport(id).then((data) => {
            if (cancelled) return;
            setState(
                data
                    ? { status: "ok", data }
                    : { status: "error", message: "Could not load this team's report. Please try again." }
            );
        });
        return () => { cancelled = true; };
    }, [id]);

    return (
        <div className="space-y-6 p-4 sm:p-6">
            {/* Back + header */}
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.back()}
                    className="gap-1.5 rounded-lg border-gray-300 font-semibold h-9"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        {state.status === "loading"
                            ? "Loading…"
                            : state.status === "ok"
                                ? (state.data.department_name ?? "Team Report")
                                : "Team Report"}
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium">Team Performance Report</p>
                </div>
            </div>

            {/* Content */}
            {state.status === "loading" && <AdminTeamDetailSkeleton />}

            {state.status === "error" && (
                <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <div className="space-y-1.5">
                        <p className="text-base font-bold text-gray-900">Something went wrong</p>
                        <p className="text-sm text-gray-500 max-w-xs">{state.message}</p>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => router.back()}
                        className="gap-2 font-bold rounded-lg bg-gray-900 text-white hover:bg-gray-700 px-5"
                    >
                        Go back
                    </Button>
                </div>
            )}

            {state.status === "ok" && <AdminTeamDetailSection report={state.data} />}
        </div>
    );
}