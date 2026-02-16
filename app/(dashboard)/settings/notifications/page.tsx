"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Bell,
    Mail,
    MessageSquare,
    Volume2,
    BadgeCheck,
    Eye,
    Trophy,
    Clock,
    Users,
    Megaphone,
    Moon,
    ArrowLeft,
} from "lucide-react";

interface ToggleItemProps {
    icon: React.ElementType;
    label: string;
    description: string;
    enabled: boolean;
    onToggle: () => void;
    accentColor?: string;
}

function ToggleItem({ icon: Icon, label, description, enabled, onToggle, accentColor = "bg-orange-500" }: ToggleItemProps) {
    return (
        <div className="flex items-center justify-between py-4 group">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${enabled ? accentColor : "bg-gray-100"}`}>
                    <Icon className={`w-4.5 h-4.5 transition-colors ${enabled ? "text-white" : "text-gray-500"}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{description}</p>
                </div>
            </div>
            <button
                onClick={onToggle}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${enabled ? "bg-orange-500" : "bg-gray-200"}`}
                role="switch"
                aria-checked={enabled}
            >
                <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${enabled ? "translate-x-5" : "translate-x-0"}`}
                />
            </button>
        </div>
    );
}

export default function NotificationsPage() {
    const [settings, setSettings] = useState({
        // Push Notifications
        newRewards: true,
        reviewReminders: true,
        teamUpdates: false,

        // Email Notifications
        weeklyDigest: true,
        rewardConfirmations: true,
        announcements: false,

        // In-App Notifications
        soundAlerts: true,
        badgeCounts: true,
        previewPopups: false,

        // Do Not Disturb
        quietHours: false,
    });

    const toggle = (key: keyof typeof settings) => {
        setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="max-w-2xl">
            {/* Header with Back Navigation */}
            <div className="mb-8">
                <Link
                    href="/settings"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600 transition-colors mb-4 group no-underline"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Back to Settings
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                <p className="text-muted-foreground mt-1">
                    Choose how and when you want to be notified.
                </p>
            </div>

            {/* Push Notifications */}
            <div className="bg-white rounded-xl border shadow-sm mb-6 overflow-hidden">
                <div className="px-6 py-4 border-b bg-gradient-to-r from-orange-50 to-amber-50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                            <Bell className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900">Push Notifications</h2>
                            <p className="text-xs text-gray-500">Alerts delivered to your device</p>
                        </div>
                    </div>
                </div>
                <div className="px-6 divide-y divide-gray-100">
                    <ToggleItem
                        icon={Trophy}
                        label="New Rewards"
                        description="Get notified when you receive a new reward"
                        enabled={settings.newRewards}
                        onToggle={() => toggle("newRewards")}
                    />
                    <ToggleItem
                        icon={Clock}
                        label="Review Reminders"
                        description="Reminders for pending peer reviews"
                        enabled={settings.reviewReminders}
                        onToggle={() => toggle("reviewReminders")}
                    />
                    <ToggleItem
                        icon={Users}
                        label="Team Updates"
                        description="Activity from your team members"
                        enabled={settings.teamUpdates}
                        onToggle={() => toggle("teamUpdates")}
                    />
                </div>
            </div>

            {/* Email Notifications */}
            <div className="bg-white rounded-xl border shadow-sm mb-6 overflow-hidden">
                <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Mail className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900">Email Notifications</h2>
                            <p className="text-xs text-gray-500">Updates sent to your email inbox</p>
                        </div>
                    </div>
                </div>
                <div className="px-6 divide-y divide-gray-100">
                    <ToggleItem
                        icon={MessageSquare}
                        label="Weekly Digest"
                        description="A summary of your activity every week"
                        enabled={settings.weeklyDigest}
                        onToggle={() => toggle("weeklyDigest")}
                        accentColor="bg-blue-500"
                    />
                    <ToggleItem
                        icon={BadgeCheck}
                        label="Reward Confirmations"
                        description="Email confirmation when rewards are redeemed"
                        enabled={settings.rewardConfirmations}
                        onToggle={() => toggle("rewardConfirmations")}
                        accentColor="bg-blue-500"
                    />
                    <ToggleItem
                        icon={Megaphone}
                        label="Announcements"
                        description="Organization-wide news and updates"
                        enabled={settings.announcements}
                        onToggle={() => toggle("announcements")}
                        accentColor="bg-blue-500"
                    />
                </div>
            </div>

            {/* In-App Notifications */}
            <div className="bg-white rounded-xl border shadow-sm mb-6 overflow-hidden">
                <div className="px-6 py-4 border-b bg-gradient-to-r from-emerald-50 to-teal-50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <Bell className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900">In-App Notifications</h2>
                            <p className="text-xs text-gray-500">Control how notifications appear in the app</p>
                        </div>
                    </div>
                </div>
                <div className="px-6 divide-y divide-gray-100">
                    <ToggleItem
                        icon={Volume2}
                        label="Sound Alerts"
                        description="Play a sound for new notifications"
                        enabled={settings.soundAlerts}
                        onToggle={() => toggle("soundAlerts")}
                        accentColor="bg-emerald-500"
                    />
                    <ToggleItem
                        icon={BadgeCheck}
                        label="Badge Counts"
                        description="Show unread count badges on the sidebar"
                        enabled={settings.badgeCounts}
                        onToggle={() => toggle("badgeCounts")}
                        accentColor="bg-emerald-500"
                    />
                    <ToggleItem
                        icon={Eye}
                        label="Preview Popups"
                        description="Show notification previews as toast popups"
                        enabled={settings.previewPopups}
                        onToggle={() => toggle("previewPopups")}
                        accentColor="bg-emerald-500"
                    />
                </div>
            </div>

            {/* Do Not Disturb */}
            <div className="bg-white rounded-xl border shadow-sm mb-6 overflow-hidden">
                <div className="px-6 py-4 border-b bg-gradient-to-r from-violet-50 to-purple-50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                            <Moon className="w-4 h-4 text-violet-600" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900">Do Not Disturb</h2>
                            <p className="text-xs text-gray-500">Pause all notifications during set hours</p>
                        </div>
                    </div>
                </div>
                <div className="px-6">
                    <ToggleItem
                        icon={Moon}
                        label="Quiet Hours"
                        description="Mute all notifications from 10 PM to 7 AM"
                        enabled={settings.quietHours}
                        onToggle={() => toggle("quietHours")}
                        accentColor="bg-violet-500"
                    />
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-orange-50 rounded-xl border border-orange-100 p-5 flex items-start gap-3">
                <Bell className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                <div>
                    <p className="text-sm font-medium text-orange-800">
                        Notification preferences are saved automatically.
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                        Changes apply instantly across all your devices.
                    </p>
                </div>
            </div>
        </div>
    );
}
