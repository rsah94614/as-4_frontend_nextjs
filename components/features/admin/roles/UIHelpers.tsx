"use client";

import { useState, useCallback } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

export type ToastType = "success" | "error";
export interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const show = useCallback((message: string, type: ToastType = "success") => {
        const id = Date.now() + Math.random();
        setToasts((t) => [...t, { id, message, type }]);
        setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
    }, []);
    return { toasts, show };
}

// Matches ReviewToast style exactly — white card, left border accent
export function ToastContainer({ toasts }: { toasts: Toast[] }) {
    if (!toasts || !Array.isArray(toasts)) return null;
    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white shadow-2xl shadow-black/10 ring-1 ring-gray-100 min-w-[260px] border-l-4 animate-in slide-in-from-bottom-4 fade-in duration-300"
                    style={{ borderLeftColor: t.type === "success" ? "#004C8F" : "#E31837" }}
                >
                    {t.type === "success"
                        ? <CheckCircle2 size={16} className="shrink-0" style={{ color: "#004C8F" }} />
                        : <AlertCircle  size={16} className="shrink-0" style={{ color: "#E31837" }} />}
                    <p className="text-sm font-medium text-gray-800">{String(t.message || "")}</p>
                </div>
            ))}
        </div>
    );
}

const METHOD_COLORS: Record<string, { bg: string; color: string }> = {
    GET:    { bg: "#DBEAFE", color: "#1E40AF" },
    POST:   { bg: "#D1FAE5", color: "#065F46" },
    PATCH:  { bg: "#FEF3C7", color: "#92400E" },
    PUT:    { bg: "#FEF3C7", color: "#92400E" },
    DELETE: { bg: "#FEE2E2", color: "#B91C1C" },
};

export function MethodBadge({ routeKey }: { routeKey: string }) {
    const method = routeKey.split(":")[0] ?? "";
    const path   = routeKey.split(":").slice(1).join(":") ?? routeKey;
    const c      = METHOD_COLORS[method] ?? { bg: "#F3F4F6", color: "#374151" };
    return (
        <div className="flex items-center gap-2 min-w-0">
            <span className="shrink-0 text-[9px] font-black font-mono px-1.5 py-0.5 rounded"
                style={{ background: c.bg, color: c.color }}>
                {method}
            </span>
            <span className="font-mono text-[11px] text-gray-500 truncate">{path}</span>
        </div>
    );
}