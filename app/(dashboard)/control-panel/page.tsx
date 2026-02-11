"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Building2, 
  UserRound, 
  Users, 
  Tags, 
  ShieldCheck 
} from 'lucide-react';

const categories = [
  { 
    title: "Rewards", 
    description: "Manage individual reward items and point values.", 
    href: "/rewards", 
    icon: Trophy,
    color: "bg-orange-100 text-orange-600"
  },
  { 
    title: "Departments", 
    description: "Configure organizational department structures.", 
    href: "/departments", 
    icon: Building2,
    color: "bg-blue-100 text-blue-600"
  },
  { 
    title: "Designations", 
    description: "Manage employee job titles and hierarchy levels.", 
    href: "/designations", 
    icon: UserRound,
    color: "bg-green-100 text-green-600"
  },
  { 
    title: "Employees", 
    description: "View and manage staff profiles and access.", 
    href: "/employees", 
    icon: Users,
    color: "bg-purple-100 text-purple-600"
  },
  { 
    title: "Reward Categories", 
    description: "Organize rewards into logical groupings.", 
    href: "/reward-categories", 
    icon: Tags,
    color: "bg-red-100 text-red-600"
  },
  { 
    title: "Approvals", 
    description: "Review and process pending recognition requests.", 
    href: "/approvals", 
    icon: ShieldCheck,
    color: "bg-slate-100 text-slate-600"
  },
];

export default function ControlPanelHub() {
  return (
    <div>
        <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-sans">Control Panel</h1>
            <p className="text-slate-500 font-medium">System Administration & Management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {categories.map((cat) => (
            <Link key={cat.href} href={cat.href}>
                <div className="group bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all cursor-pointer h-full flex flex-col items-start gap-6">
                    <div className={`p-4 rounded-2xl ${cat.color} group-hover:scale-110 transition-transform shadow-inner`}>
                        <cat.icon size={28} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">{cat.title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">{cat.description}</p>
                    </div>
                </div>
            </Link>
            ))}
        </div>
    </div>
  );
}