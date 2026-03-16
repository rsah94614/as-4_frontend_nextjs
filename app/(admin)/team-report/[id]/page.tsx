"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminTeamDetailSection, { AdminTeamDetailSkeleton } from "@/components/features/admin/team-report/AdminTeamDetailSection";
import { fetchTeamReport } from "@/services/analytics-service";
import { extractErrorMessage } from "@/lib/error-utils";
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
            if (data) {
                setState({ status: "ok", data });
            } else {
                setState({ status: "error", message: "Could not load this team's report. Please try again." });
            }
        }).catch((err) => {
            if (cancelled) return;
            setState({ status: "error", message: extractErrorMessage(err) });
        });
        return () => { cancelled = true; };
    }, [id]);

    return (
        <div className="p-4 sm:p-6 space-y-5">


            {state.status === "loading" && <AdminTeamDetailSkeleton />}

            {state.status === "error" && (
                <div className="flex flex-col items-center justify-center py-32 gap-5 text-center">
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
                        <AlertTriangle className="w-8 h-8 text-red-400" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-base font-bold text-gray-900">Something went wrong</p>
                        <p className="text-sm text-gray-400 max-w-xs">{state.message}</p>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => router.back()}
                        className="gap-2 rounded-xl bg-[#004C8F] hover:bg-[#003A70] text-white font-semibold px-5"
                    >
                        Go back
                    </Button>
                </div>
            )}

            {state.status === "ok" && <AdminTeamDetailSection report={state.data} />}
        </div>
    );
}