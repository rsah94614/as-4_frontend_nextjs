import { SlidersHorizontal, Users, Shield, Bell, Database } from "lucide-react";

export default function AdminPage() {
    const controlPanelItems = [
        {
            title: "User Management",
            description: "Add, edit, or remove user accounts and permissions",
            icon: Users,
            status: "Active",
        },
        {
            title: "Role & Permissions",
            description: "Configure access levels and role-based controls",
            icon: Shield,
            status: "Active",
        },
        {
            title: "Notifications",
            description: "Configure email and push notification settings",
            icon: Bell,
            status: "Configured",
        },
        {
            title: "Data Management",
            description: "Export data, manage backups, and audit logs",
            icon: Database,
            status: "Active",
        },
        {
            title: "System Settings",
            description: "General application configuration and preferences",
            icon: SlidersHorizontal,
            status: "Active",
        },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Control Panel</h1>
            <p className="text-muted-foreground mt-1">
                Manage system settings and configurations.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {controlPanelItems.map((item) => (
                    <div
                        key={item.title}
                        className="bg-white rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                    >
                        <div className="flex items-start justify-between">
                            <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                                <item.icon className="w-6 h-6 text-orange-600" />
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {item.status}
                            </span>
                        </div>
                        <h3 className="text-lg font-semibold mt-4">{item.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}