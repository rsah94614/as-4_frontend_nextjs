"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Trophy, Building2, UserRound, Users, Tags, Star,
    ShieldAlert, Loader2, Shield, ClipboardList,
    Activity, ArrowUpRight
} from 'lucide-react';
import { auth } from '@/services/auth-service';
import { isAdminUser } from '@/lib/role-utils';

const categories = [
    {
        title: 'Audit Logs',
        description: 'Track and review all system activity and admin actions.',
        href: '/audit-logs',
        icon: ClipboardList,
    },
    {
        title: 'Departments',
        description: 'Configure organisational department structures.',
        href: '/departments',
        icon: Building2,
    },
    {
        title: 'Designations',
        description: 'Manage employee job titles and hierarchy levels.',
        href: '/designations',
        icon: UserRound,
    },
    {
        title: 'Employees',
        description: 'View and manage staff profiles and access.',
        href: '/employees',
        icon: Users,
    },
    {
        title: 'Reward Categories',
        description: 'Organise rewards into logical groupings.',
        href: '/reward-categories',
        icon: Tags,
    },
    {
        title: 'Rewards',
        description: 'Manage individual reward items and point values.',
        href: '/rewards',
        icon: Trophy,
    },
    {
        title: 'Review Categories',
        description: 'Manage review category tags and their point multipliers.',
        href: '/review-categories',
        icon: Tags,
    },
    {
        title: 'Reviews',
        description: 'Monitor all peer reviews. Low ratings are flagged automatically.',
        href: '/reviews',
        icon: Star,
    },
    {
        title: 'Roles',
        description: 'Manage roles, assignments and route-level permissions.',
        href: '/roles',
        icon: Shield,
    },
    {
        title: 'Statuses',
        description: 'Define and manage employee and reward status types.',
        href: '/statuses',
        icon: Activity,
    },
];


export default function ControlPanelHub() {
    const router = useRouter();
    const user = auth.getUser();
    const allowed = user ? isAdminUser() : false;

    useEffect(() => {
        if (!auth.getUser()) router.replace('/login');
    }, [router]);

    if (!user) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#003580' }} />
            </div>
        );
    }

    if (!allowed) {
        return (
            <div className="flex-1 w-full min-h-screen bg-muted flex items-center justify-center">
                <div className="bg-white border border-border p-10 text-center space-y-4 max-w-sm shadow-sm">
                    <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
                        <ShieldAlert className="w-6 h-6 text-[#C0392B]" />
                    </div>
                    <h2 className="text-lg font-bold text-[#111827]">Access Restricted</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        You don&apos;t have permission to view the Control Panel.
                        Please contact your HR Admin.
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-block mt-2 px-6 py-2.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-[#002a6b] transition-colors"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 w-full bg-white shadow-[0_10px_50px_rgba(0,0,0,0.04)] overflow-hidden min-h-[calc(100vh-2rem)] sm:min-h-[calc(100vh-3rem)] transition-all">

            {/* ── Page Header ── */}
            <div className="bg-white border-b border-gray-100 px-4 sm:px-6 md:px-10 py-6 sm:py-7">
                <div className="w-full flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold leading-tight" style={{ color: '#004C8F' }}>
                            Control Panel
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            System administration &amp; configuration
                        </p>
                    </div>
                    <span className="hidden md:flex items-center text-2xl font-black tracking-tighter select-none opacity-90">
                        <span style={{ color: '#E31837' }}>A</span>
                        <span style={{ color: '#004C8F' }}>abhar</span>
                    </span>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="px-4 sm:px-6 md:px-10 py-6 sm:py-8 w-full">

                {/* Cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {categories.map((cat) => (
                        <Link key={cat.href} href={cat.href} className="group block">
                            <div
                                className="relative rounded-xl border border-slate-300 bg-white flex flex-col overflow-hidden
                                    transition-all duration-300 shadow-md shadow-slate-400
                                    cursor-pointer hover:shadow-xl hover:shadow-slate-300 hover:-translate-y-0.5"
                            >
                                <div className="flex flex-col flex-1 p-5">
                                    {/* Icon + arrow */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110">
                                            <cat.icon size={22} className="text-blue-600" />
                                        </div>
                                        <ArrowUpRight
                                            size={15}
                                            className="text-slate-300 group-hover:text-[#004C8F] transition-colors duration-200 mt-0.5"
                                        />
                                    </div>

                                    {/* Text */}
                                    <p className="font-semibold text-slate-800 text-sm leading-snug mb-1">
                                        {cat.title}
                                    </p>
                                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                                        {cat.description}
                                    </p>

                                    {/* Footer */}
                                    <div className="mt-auto pt-3 border-t border-slate-50">
                                        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-[#004C8F] transition-colors duration-200">
                                            Manage →
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}