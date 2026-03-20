"use client";

import React from "react";
import { Check, AlertCircle, X, Info, HelpCircle, } from "lucide-react";
import { AdminPageHeader as PageHeader } from "@/components/features/admin/AdminControlPanelPageHeader";

// Re-export the shared header so existing imports work unchanged
export { PageHeader };

// ─── Page Shell ───────────────────────────────────────────────────────────────

export function PageShell({ children }: { children: React.ReactNode }) {
    return (
        <main className="flex-1 overflow-y-auto flex flex-col bg-white">
            {children}
        </main>
    );
}

// ─── Content Wrapper ──────────────────────────────────────────────────────────

export function ContentWrapper({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex-1 px-8 md:px-10 py-8 flex flex-col" style={{ background: "#F7F9FC" }}>
            <div className="w-full mx-auto flex-1 flex flex-col">
                <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}

// ─── Stats Pills ──────────────────────────────────────────────────────────────

export function StatusStats({
    stats,
}: {
    stats: { label: string; value: number; color: string }[];
}) {
    return (
        <div className="flex flex-wrap items-center gap-2 mb-6">
            {stats.map((s) => (
                <div
                    key={s.label}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50"
                >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${s.color}`} />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                        {s.label}
                    </span>
                    <span className="text-xs font-black text-gray-800 tabular-nums">
                        {s.value}
                    </span>
                </div>
            ))}
        </div>
    );
}

// ─── Info Banner ──────────────────────────────────────────────────────────────

export function InfoBanner({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex gap-3 items-start bg-blue-50 border border-blue-100 rounded-xl px-4 py-3.5 mb-6">
            <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <p className="text-sm text-blue-700 leading-relaxed">{children}</p>
        </div>
    );
}

// ─── Flash Banner ─────────────────────────────────────────────────────────────

export function FlashBanner({
    type,
    msg,
    onDismiss,
}: {
    type: "success" | "error";
    msg: string;
    onDismiss: () => void;
}) {
    const ok = type === "success";
    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm mb-6 ${ok
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
                }`}
        >
            {ok ? (
                <Check className="w-4 h-4 shrink-0" />
            ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span className="flex-1 font-medium">{msg}</span>
            <button
                onClick={onDismiss}
                className="p-0.5 hover:opacity-60 transition-opacity"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}

// ─── Field ────────────────────────────────────────────────────────────────────

export const inputCls =
    "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#004C8F]/10 focus:border-[#004C8F]/40 transition placeholder-gray-300 text-gray-800";

export function Field({
    label,
    hint,
    children,
}: {
    label: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {label}
                </label>
                {hint && (
                    <span className="group relative cursor-default">
                        <HelpCircle className="w-3 h-3 text-gray-300" />
                        <span className="absolute left-5 top-0 z-10 w-52 bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 hidden group-hover:block shadow-xl leading-relaxed">
                            {hint}
                        </span>
                    </span>
                )}
            </div>
            {children}
        </div>
    );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

export function SkeletonRow() {
    return (
        <tr className="border-b border-gray-100 animate-pulse">
            <td className="px-5 py-4">
                <div className="h-6 w-20 bg-gray-100 rounded-lg" />
            </td>
            <td className="px-5 py-4">
                <div className="h-4 w-32 bg-gray-100 rounded" />
            </td>
            <td className="px-5 py-4">
                <div className="h-4 w-48 bg-gray-100 rounded" />
            </td>
            <td className="px-5 py-4">
                <div className="h-7 w-7 bg-gray-100 rounded-lg ml-auto" />
            </td>
        </tr>
    );
}

export function SkeletonSection({ index }: { index: number }) {
    return (
        <div
            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-pulse"
            style={{ animationDelay: `${index * 80}ms` }}
        >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                <div className="h-4 w-28 bg-gray-200 rounded" />
                <div className="ml-auto h-4 w-16 bg-gray-100 rounded" />
            </div>
            <table className="w-full">
                <tbody>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                </tbody>
            </table>
        </div>
    );
}
