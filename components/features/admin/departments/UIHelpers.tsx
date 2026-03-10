"use client";

import React from "react";
import { Label } from "@/components/ui/label";

export function Field({
    label, hint, children,
}: {
    label: string; hint?: string; children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
                {label}
            </Label>
            {children}
            {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
        </div>
    );
}
