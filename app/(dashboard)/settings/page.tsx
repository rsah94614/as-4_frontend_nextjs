import { User, Bell, Lock, Palette, Globe } from "lucide-react";

export default function SettingsPage() {
    const settingsSections = [
        { label: "Profile", icon: User, description: "Manage your personal information" },
        { label: "Notifications", icon: Bell, description: "Configure notification preferences" },
        { label: "Security", icon: Lock, description: "Password and authentication settings" },
        { label: "Appearance", icon: Palette, description: "Theme and display preferences" },
        { label: "Language", icon: Globe, description: "Language and regional settings" },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground mt-1">
                Manage your account preferences.
            </p>

            <div className="mt-8 space-y-4 max-w-3xl">
                {settingsSections.map((section) => (
                    <div
                        key={section.label}
                        className="bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center gap-4"
                    >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <section.icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold">{section.label}</h3>
                            <p className="text-sm text-gray-500">{section.description}</p>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                ))}
            </div>
        </div>
    );
}
