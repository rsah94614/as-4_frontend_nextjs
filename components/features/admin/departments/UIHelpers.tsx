"use client";

import React from "react";

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
            <label
                className="block text-xs font-semibold uppercase tracking-wide"
                style={{ color: "#6b7280" }}
            >
                {label}
            </label>
            {children}
            {hint && (
                <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>
                    {hint}
                </p>
            )}
        </div>
    );
}