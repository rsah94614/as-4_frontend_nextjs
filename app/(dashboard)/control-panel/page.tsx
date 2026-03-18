"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Trophy, Building2, UserRound, Users, Tags, Star,
    ShieldAlert, Loader2, Shield, ClipboardList,
    Activity, ArrowUpRight, LayoutGrid
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
            <div className="flex-1 w-full min-h-screen bg-[#F0F2F5] flex items-center justify-center">
                <div className="bg-white rounded-xl border border-gray-300 p-10 text-center space-y-4 max-w-sm shadow-sm">
                    <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                        <ShieldAlert className="w-6 h-6 text-[#C0392B]" />
                    </div>
                    <h2 className="text-lg font-bold text-[#111827]">Access Restricted</h2>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        You don&apos;t have permission to view the Control Panel.
                        Please contact your HR Admin.
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-block mt-2 px-6 py-2.5 rounded-md bg-[#003580] text-white text-sm font-semibold hover:bg-[#002a6b] transition-colors"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 w-full min-h-screen bg-[#F0F2F5]">

            {/* ── Page Header ── */}
            <div className="bg-white border border-gray-300 rounded-xl px-8 md:px-10 py-6 flex items-center justify-between">
                <div>
                    <h1 className="text-[20px] font-bold text-[#003580] leading-tight tracking-tight">
                        Control Panel
                    </h1>
                    <p className="text-[14px] text-gray-500 mt-1">
                        System administration &amp; configuration
                    </p>
                </div>
                <span className="hidden md:flex items-center text-xl font-black tracking-tight select-none">
                    <span className="text-[#E74C3C]">A</span>
                    <span className="text-[#003580]">abhar</span>
                </span>
            </div>

            {/* ── Content ── */}
            <div className="max-w-[1200px] mx-auto px-8 md:px-10 py-8">

                {/* Meta row */}
                <div className="flex items-center justify-between mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white border border-gray-300">
                        <div className="w-2 h-2 rounded-full bg-[#C0392B]" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-[#C0392B]">
                            Admin Access
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] text-gray-400 font-medium">
                        <LayoutGrid size={12} />
                        <span>{categories.length} modules</span>
                    </div>
                </div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((cat) => (
                        <Link key={cat.href} href={cat.href} className="group block">
                            <div
                                className="bg-white rounded-xl h-full flex flex-col p-6
                                    border border-gray-300
                                    hover:border-gray-400 hover:shadow-md
                                    transition-all duration-150"
                            >
                                {/* Icon + arrow */}
                                <div className="flex items-start justify-between mb-5">
                                    <div className="w-10 h-10 rounded-lg bg-[#EEF2F7] flex items-center justify-center shrink-0">
                                        <cat.icon size={18} className="text-[#003580]" />
                                    </div>
                                    <ArrowUpRight
                                        size={15}
                                        className="text-gray-300 group-hover:text-[#003580] transition-colors duration-150 mt-0.5"
                                    />
                                </div>

                                {/* Text */}
                                <h3 className="text-[14px] font-semibold text-[#111827] mb-2">
                                    {cat.title}
                                </h3>
                                <p className="text-[12.5px] text-gray-400 leading-relaxed flex-1">
                                    {cat.description}
                                </p>

                                {/* Footer */}
                                <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-center">
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-[#003580] transition-colors duration-150">
                                        Manage
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}