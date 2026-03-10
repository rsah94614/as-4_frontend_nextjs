import type { EmployeeDetail } from "@/types/profile-types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Mail, Briefcase } from "lucide-react";

interface ProfileHeaderProps {
    profile: EmployeeDetail;
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
    const joinedDate = new Date(profile.date_of_joining).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric"
    });

    return (
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 text-center sm:text-left">
                {/* Avatar */}
                <Avatar className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 ring-4 ring-white shadow-xl">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-3xl sm:text-4xl font-bold">
                        {profile.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <div className="space-y-4 sm:pt-2">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                            {profile.username}
                        </h1>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1.5 text-gray-500 text-sm font-medium">
                            <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span>{profile.email}</span>
                            </div>
                            <div className="hidden sm:block text-gray-300">•</div>
                            <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                                <Briefcase className="w-4 h-4 text-gray-400" />
                                <span>{profile.designation?.designation_name || "Employee"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                        <Badge variant={profile.is_active ? "default" : "destructive"} className={`gap-1.5 px-2.5 py-0.5 rounded-md ${profile.is_active ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200' : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200'} border`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${profile.is_active ? "bg-emerald-500" : "bg-rose-500"}`} />
                            {profile.is_active ? "Active" : "Inactive"}
                        </Badge>

                        {profile.roles.map((r) => (
                            <Badge key={r.role_id} variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100 border px-2.5 py-0.5 rounded-md">
                                {r.role_name}
                            </Badge>
                        ))}
                    </div>

                    <div className="flex items-center gap-1.5 justify-center sm:justify-start text-xs text-gray-400 font-medium pt-1">
                        <CalendarDays className="w-3.5 h-3.5" />
                        <span>Member since {joinedDate}</span>
                    </div>
                </div>
            </div>

        </div>
    );
}
