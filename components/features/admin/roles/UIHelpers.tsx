"use client";

import { useState, useCallback } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

// ─── Toast Types ──────────────────────────────────────────────────────────────

export type ToastType = "success" | "error";
export interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

// ─── useToast Hook ────────────────────────────────────────────────────────────

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const show = useCallback((message: string, type: ToastType = "success") => {
        const id = Date.now();
        setToasts((t) => [...t, { id, message, type }]);
        setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
    }, []);
    return { toasts, show };
}

// ─── Toast Container ──────────────────────────────────────────────────────────

export function ToastContainer({ toasts }: { toasts: Toast[] }) {
    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-right-4 duration-300
                        ${t.type === "success"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-red-50 text-red-800 border border-red-200"
                        }`}
                >
                    {t.type === "success"
                        ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                        : <AlertCircle className="w-4 h-4 shrink-0" />}
                    {t.message}
                </div>
            ))}
        </div>
    );
}

// ─── Method Badge ─────────────────────────────────────────────────────────────

const METHOD_COLORS: Record<string, string> = {
    GET: "bg-blue-50 text-blue-700 border-blue-200",
    POST: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PATCH: "bg-amber-50 text-amber-700 border-amber-200",
    PUT: "bg-amber-50 text-amber-700 border-amber-200",
    DELETE: "bg-red-50 text-red-700 border-red-200",
};

export function MethodBadge({ routeKey }: { routeKey: string }) {
    const method = routeKey.split(":")[0] ?? "";
    const path = routeKey.split(":").slice(1).join(":") ?? routeKey;
    return (
        <div className="flex items-center gap-2 min-w-0">
            <span
                className={`shrink-0 text-xs font-bold font-mono px-2 py-0.5 rounded border ${METHOD_COLORS[method] ?? "bg-gray-100 text-gray-700 border-gray-200"
                    }`}
            >
                {method}
            </span>
            <span className="font-mono text-sm text-gray-800 truncate">{path}</span>
        </div>
    );
}
