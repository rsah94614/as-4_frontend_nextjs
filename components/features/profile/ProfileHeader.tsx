import type { EmployeeDetail } from "@/types/profile-types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ProfileHeaderProps {
    profile: EmployeeDetail;
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
                {/* Avatar */}
                <Avatar className="w-16 h-16 shrink-0">
                    <AvatarFallback className="bg-indigo-600 text-white text-xl font-bold">
                        {profile.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">
                        {profile.username}
                    </h1>
                    <p className="text-sm text-gray-500">{profile.email}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <Badge variant={profile.is_active ? "default" : "destructive"} className={`gap-1 ${profile.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${profile.is_active ? "bg-green-500" : "bg-red-500"}`} />
                            {profile.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {profile.roles.map((r) => (
                            <Badge key={r.role_id} variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                                {r.role_name}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}
