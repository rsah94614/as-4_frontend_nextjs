"use client";

import { Info } from "lucide-react";

export function PageShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </div>
        </div>
    );
}

export function InfoBanner({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex gap-3 items-start bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3.5 mb-6">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Info className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-sm text-blue-700 leading-relaxed pt-1">{children}</p>
        </div>
    );
}
