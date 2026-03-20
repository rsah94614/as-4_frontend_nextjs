"use client";

import React from "react";

interface AdminPageHeaderProps {
    title: string;
    subtitle: string;
}

export function AdminPageHeader({ title, subtitle }: AdminPageHeaderProps) {
    return (
        <div className="bg-white border-b border-border px-8 md:px-10 py-5">
            <div className="mx-auto flex items-center justify-between">
                <div>
                    <h1
                        className="text-2xl font-bold leading-tight"
                        style={{ color: "#004C8F" }}
                    >
                        {title}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {subtitle}
                    </p>
                </div>
                <span className="hidden md:flex items-center text-xl font-black tracking-tight select-none">
                    <span style={{ color: "#E31837" }}>A</span>
                    <span style={{ color: "#004C8F" }}>abhar</span>
                </span>
            </div>
        </div>
    );
}
