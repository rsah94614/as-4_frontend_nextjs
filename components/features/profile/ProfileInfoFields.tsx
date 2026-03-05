import {
    User,
    Mail,
    Briefcase,
    Building2,
    Shield,
    CalendarDays,
    UserCheck,
} from "lucide-react";
import type { EmployeeDetail } from "@/types/profile-types";

interface ProfileInfoFieldsProps {
    profile: EmployeeDetail;
}

export default function ProfileInfoFields({ profile }: ProfileInfoFieldsProps) {
    const fields = [
        {
            icon: <User className="w-4 h-4 text-gray-400" />,
            label: "Username",
            value: profile.username,
        },
        {
            icon: <Mail className="w-4 h-4 text-gray-400" />,
            label: "Email",
            value: profile.email,
        },
        {
            icon: <Briefcase className="w-4 h-4 text-gray-400" />,
            label: "Designation",
            value: profile.designation
                ? `${profile.designation.designation_name} (Level ${profile.designation.level})`
                : "—",
        },
        {
            icon: <Building2 className="w-4 h-4 text-gray-400" />,
            label: "Department",
            value: profile.department
                ? `${profile.department.department_name}${profile.department.department_type ? ` · ${profile.department.department_type.type_name}` : ""}`
                : "—",
        },
        {
            icon: <UserCheck className="w-4 h-4 text-gray-400" />,
            label: "Manager",
            value: profile.manager
                ? `${profile.manager.username} (${profile.manager.email})`
                : "—",
        },
        {
            icon: <CalendarDays className="w-4 h-4 text-gray-400" />,
            label: "Date of Joining",
            value: new Date(profile.date_of_joining).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
        },
        {
            icon: <Shield className="w-4 h-4 text-gray-400" />,
            label: "Roles",
            value: profile.roles.length > 0
                ? profile.roles.map((r) => r.role_name).join(", ")
                : "—",
        },
    ];

    return (
        <div className="space-y-3">
            {fields.map((field) => (
                <div key={field.label} className="flex items-start gap-3 p-4 rounded-xl border bg-white">
                    <div className="mt-0.5 shrink-0">{field.icon}</div>
                    <div className="min-w-0">
                        <p className="text-xs text-gray-400">{field.label}</p>
                        <p className="text-sm font-medium text-gray-800 break-words">{field.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
