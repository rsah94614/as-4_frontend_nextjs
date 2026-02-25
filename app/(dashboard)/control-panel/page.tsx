"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trophy, Building2, UserRound, Users, Tags, Star, ShieldAlert, Loader2 } from 'lucide-react';
import { auth } from '@/services/auth-service';
import { isAdminUser } from '@/lib/role-utils';

const categories = [
  { title: 'Rewards', description: 'Manage individual reward items and point values.', href: '/rewards', icon: Trophy, color: 'bg-orange-100 text-orange-600', accent: 'group-hover:border-orange-200' },
  { title: 'Departments', description: 'Configure organisational department structures.', href: '/departments', icon: Building2, color: 'bg-blue-100 text-blue-600', accent: 'group-hover:border-blue-200' },
  { title: 'Designations', description: 'Manage employee job titles and hierarchy levels.', href: '/designations', icon: UserRound, color: 'bg-green-100 text-green-600', accent: 'group-hover:border-green-200' },
  { title: 'Employees', description: 'View and manage staff profiles and access.', href: '/employees', icon: Users, color: 'bg-purple-100 text-purple-600', accent: 'group-hover:border-purple-200' },
  { title: 'Reward Categories', description: 'Organise rewards into logical groupings.', href: '/reward-categories', icon: Tags, color: 'bg-red-100 text-red-600', accent: 'group-hover:border-red-200' },
  { title: 'Reviews', description: 'Monitor all peer reviews. Low ratings are flagged automatically.', href: '/reviews', icon: Star, color: 'bg-amber-100 text-amber-600', accent: 'group-hover:border-amber-200' },
];

export default function ControlPanelHub() {
  const router = useRouter();

  const user = auth.getUser();
  const allowed = user ? isAdminUser() : false;

  useEffect(() => {
    if (!auth.getUser()) {
      router.replace('/login');
    }
  }, [router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center space-y-4 max-w-sm">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-black">Access Denied</h2>
          <p className="text-sm text-slate-500">
            You don&apos;t have permission to view the Control Panel.<br />
            Please contact your HR Admin.
          </p>
          <Link
            href="/dashboard"
            className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-black">Control Panel</h1>
        <p className="text-slate-500 font-medium">System Administration &amp; Management</p>
      </div>

      {/* Admin badge */}
      <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-sm font-semibold">
        <ShieldAlert className="w-4 h-4" />
        Admin Access
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link key={cat.href} href={cat.href}>
            <div className={`group bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg ${cat.accent} transition-all cursor-pointer h-full flex flex-col items-start gap-6`}>
              <div className={`p-4 rounded-2xl ${cat.color} group-hover:scale-110 transition-transform shadow-inner`}>
                <cat.icon size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-black tracking-tight">{cat.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{cat.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}