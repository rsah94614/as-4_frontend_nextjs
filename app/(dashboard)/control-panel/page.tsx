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
        title: 'Rewards',
        description: 'Manage individual reward items and point values.',
        href: '/rewards',
        icon: Trophy,
        accent: '#F97316',
        lightBg: '#FFF7ED',
    },
    {
        title: 'Departments',
        description: 'Configure organisational department structures.',
        href: '/departments',
        icon: Building2,
        accent: '#004C8F',
        lightBg: '#E8F1FA',
    },
    {
        title: 'Designations',
        description: 'Manage employee job titles and hierarchy levels.',
        href: '/designations',
        icon: UserRound,
        accent: '#059669',
        lightBg: '#ECFDF5',
    },
    {
        title: 'Employees',
        description: 'View and manage staff profiles and access.',
        href: '/employees',
        icon: Users,
        accent: '#7C3AED',
        lightBg: '#F5F3FF',
    },
    {
        title: 'Reward Categories',
        description: 'Organise rewards into logical groupings.',
        href: '/reward-categories',
        icon: Tags,
        accent: '#DB2777',
        lightBg: '#FDF2F8',
    },
    {
        title: 'Reviews',
        description: 'Monitor all peer reviews. Low ratings are flagged automatically.',
        href: '/reviews',
        icon: Star,
        accent: '#D97706',
        lightBg: '#FFFBEB',
    },
    {
        title: 'Roles',
        description: 'Manage roles, assignments and route-level permissions.',
        href: '/roles',
        icon: Shield,
        accent: '#E31837',
        lightBg: '#FDEAED',
    },
    {
        title: 'Audit Logs',
        description: 'Track and review all system activity and admin actions.',
        href: '/audit-logs',
        icon: ClipboardList,
        accent: '#0F766E',
        lightBg: '#F0FDFA',
    },
    {
        title: 'Review Categories',
        description: 'Manage review category tags and their point multipliers.',
        href: '/review-categories',
        icon: Tags,
        accent: '#7C3AED',
        lightBg: '#F5F3FF',
    },
    {
        title: 'Statuses',
        description: 'Define and manage employee and reward status types.',
        href: '/statuses',
        icon: Activity,
        accent: '#0284C7',
        lightBg: '#F0F9FF',
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
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#004C8F' }} />
            </div>
        );
    }

    if (!allowed) {
        return (
            <div className="flex-1 w-full min-h-screen bg-white flex items-center justify-center">
                <div className="text-center space-y-4 max-w-sm px-6">
                    <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: '#FDEAED' }}>
                        <ShieldAlert className="w-8 h-8" style={{ color: '#E31837' }} />
                    </div>
                    <h2 className="text-xl font-bold" style={{ color: '#004C8F' }}>Access Denied</h2>
                    <p className="text-sm text-gray-500">
                        You don&apos;t have permission to view the Control Panel.
                        Please contact your HR Admin.
                    </p>
                    <Link href="/dashboard"
                        className="inline-block mt-2 px-5 py-2.5 rounded-lg text-white text-sm font-bold transition-opacity hover:opacity-90"
                        style={{ background: '#004C8F' }}>
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 w-full min-h-screen bg-white">

            {/* ── Page Header ── */}
            <div className="bg-white border-b border-gray-200 px-8 md:px-10 py-5">
                <div className="max-w-[1200px] mx-auto flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#E31837' }}>
                            Admin · System
                        </p>
                        <h1 className="text-2xl font-bold leading-tight" style={{ color: '#004C8F' }}>
                            Control Panel
                        </h1>
                        <p className="text-sm text-gray-400 mt-1">
                            System administration &amp; management
                        </p>
                    </div>
                    <span className="hidden md:flex items-center text-xl font-black tracking-tight select-none">
                        <span style={{ color: '#E31837' }}>A</span>
                        <span style={{ color: '#004C8F' }}>abhar</span>
                    </span>
                </div>
            </div>

            {/* Red accent line */}
            <div className="h-0.5 shrink-0" style={{ background: '#E31837' }} />

            {/* ── Content ── */}
            <div className="px-8 md:px-10 py-8" style={{ background: '#F7F9FC' }}>
                <div className="max-w-[1200px] mx-auto">

                    {/* Admin access badge */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-bold"
                            style={{ background: '#FDEAED', borderColor: '#f8c4cc', color: '#E31837' }}>
                            <ShieldAlert size={13} />
                            Admin Access
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <LayoutGrid size={12} />
                            <span>{categories.length} modules</span>
                        </div>
                    </div>

                    {/* Cards grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map((cat) => (
                            <Link key={cat.href} href={cat.href} className="group block">
                                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm
                                    hover:shadow-md hover:border-gray-300 transition-all duration-200 h-full">

                                    {/* Top accent bar */}
                                    <div className="h-0.5 w-full" style={{ background: cat.accent }} />

                                    <div className="p-5 flex flex-col h-full">
                                        {/* Icon + arrow row */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                                style={{ background: cat.lightBg }}>
                                                <cat.icon size={18} style={{ color: cat.accent }} />
                                            </div>
                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center border border-gray-100
                                                opacity-0 group-hover:opacity-100 transition-all duration-150 -translate-x-1 group-hover:translate-x-0"
                                                style={{ background: cat.lightBg }}>
                                                <ArrowUpRight size={13} style={{ color: cat.accent }} />
                                            </div>
                                        </div>

                                        {/* Text */}
                                        <h3 className="text-sm font-bold mb-1 transition-colors duration-150"
                                            style={{ color: '#004C8F' }}>
                                            {cat.title}
                                        </h3>
                                        <p className="text-[12px] text-gray-500 leading-relaxed flex-1">
                                            {cat.description}
                                        </p>

                                        {/* Footer */}
                                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                                            <span className="text-[10px] font-bold uppercase tracking-widest"
                                                style={{ color: cat.accent }}>
                                                Manage
                                            </span>
                                            <div className="h-1 w-8 rounded-full" style={{ background: cat.lightBg }}>
                                                <div className="h-1 w-0 rounded-full group-hover:w-full transition-all duration-300"
                                                    style={{ background: cat.accent }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}