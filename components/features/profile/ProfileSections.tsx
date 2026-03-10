import { User, Mail, Calendar, Briefcase, Building2, UserCircle, Tag, Award, Gift, Clock, Trophy, Target, TrendingUp } from "lucide-react";
import type { EmployeeDetail } from "@/types/profile-types";
import { useEffect, useState } from "react";
import { fetchDashboardLeaderboard } from "@/services/analytics-service";
import type { LeaderboardEntryResponse } from "@/types/dashboard-types";

interface ProfileSectionsProps {
    profile: EmployeeDetail;
}

export default function ProfileSections({ profile }: ProfileSectionsProps) {
    const [rank, setRank] = useState<number | null>(null);

    useEffect(() => {
        async function loadRank() {
            try {
                const leaderboard = await fetchDashboardLeaderboard();
                if (leaderboard) {
                    const myEntry = leaderboard.find(entry => entry.employee_id === profile.employee_id);
                    if (myEntry) setRank(myEntry.rank);
                }
            } catch (error) {
                console.error("Failed to load leaderboard rank:", error);
            }
        }
        if (profile?.employee_id) loadRank();
    }, [profile?.employee_id]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-8">
            {/* Left Column: Info & Org */}
            <div className="space-y-6 lg:col-span-1">
                {/* Basic Information */}
                <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs relative overflow-hidden group hover:border-indigo-100 hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity" />

                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
                        <User className="w-4 h-4 text-indigo-500" />
                        Basic Information
                    </h3>

                    <div className="space-y-5 relative z-10">
                        <InfoRow icon={<User className="w-4 h-4" />} label="Username" value={profile.username} />
                        <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={profile.email} />
                        <InfoRow icon={<Calendar className="w-4 h-4" />} label="Joined" value={new Date(profile.date_of_joining).toLocaleDateString("en-US", { month: "long", year: "numeric", day: "numeric" })} />
                        <InfoRow icon={<Tag className="w-4 h-4" />} label="Status" value={profile.status?.status_name || (profile.is_active ? "Active" : "Inactive")} />
                    </div>
                </section>

                {/* Organization */}
                <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs relative overflow-hidden group hover:border-purple-100 hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity" />

                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
                        <Building2 className="w-4 h-4 text-purple-500" />
                        Organization
                    </h3>

                    <div className="space-y-5 relative z-10">
                        <InfoRow
                            icon={<Briefcase className="w-4 h-4" />}
                            label="Designation"
                            value={profile.designation ? `${profile.designation.designation_name}` : "—"}
                            subValue={profile.designation ? `Level ${profile.designation.level} • Code: ${profile.designation.designation_code}` : undefined}
                        />
                        <InfoRow
                            icon={<Building2 className="w-4 h-4" />}
                            label="Department"
                            value={profile.department ? profile.department.department_name : "—"}
                            subValue={profile.department?.department_type?.type_name}
                        />
                        <InfoRow
                            icon={<UserCircle className="w-4 h-4" />}
                            label="Reporting Manager"
                            value={profile.manager ? profile.manager.username : "—"}
                            subValue={profile.manager?.email}
                        />
                    </div>
                </section>
            </div>

            {/* Right Column: Activity & Highlights */}
            <div className="space-y-6 lg:col-span-2">
                {/* Leaderboard Highlight */}
                <section className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-3xl border border-amber-100 p-6 sm:p-8 shadow-sm relative overflow-hidden text-gray-900 group transition-all hover:shadow-md hover:border-amber-200">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-amber-500 transition-transform group-hover:scale-110 duration-500">
                        <Trophy className="w-56 h-56 -mr-16 -mt-16 transform rotate-12" />
                    </div>

                    <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        Leaderboard Status
                    </h3>

                    <div className="relative z-10 flex flex-col md:flex-row gap-8 md:items-end justify-between bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white shadow-sm hover:shadow-md transition-all duration-300">
                        <div>
                            <p className="text-gray-500 text-sm font-medium mb-1 tracking-wide">Current Rank</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-500 drop-shadow-sm">
                                    {rank !== null ? `#${rank}` : "—"}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-8 pb-1">
                            <div className="flex flex-col gap-1">
                                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                                    <Target className="w-3.5 h-3.5 text-amber-500" /> Total Points
                                </p>
                                <p className="text-2xl font-bold text-gray-900 drop-shadow-sm">{profile.wallet?.total_earned_points?.toLocaleString() ?? 0}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Recent Activity */}
                <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-500" />
                        Recent Activity
                    </h3>

                    <div className="space-y-4">
                        <ActivityRow
                            icon={<Award className="w-4 h-4" />}
                            iconColor="text-emerald-600"
                            iconBg="bg-emerald-100"
                            title="Recognized a Colleague"
                            time="2 days ago"
                            desc={
                                <>You gave +500 points to <span className="font-medium text-gray-800">john.doe</span> for &quot;Excellent teamwork on the migration project.&quot;</>
                            }
                        />
                        <ActivityRow
                            icon={<Gift className="w-4 h-4" />}
                            iconColor="text-fuchsia-600"
                            iconBg="bg-fuchsia-100"
                            title="Reward Redeemed"
                            time="Last Week"
                            desc={
                                <>Redeemed a <span className="font-medium text-gray-800">$50 Amazon Voucher</span>.</>
                            }
                        />
                        <ActivityRow
                            icon={<User className="w-4 h-4" />}
                            iconColor="text-indigo-600"
                            iconBg="bg-indigo-100"
                            title="Profile Updated"
                            time="1 month ago"
                            desc="Updated your designation and contact information."
                            isLast
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value, subValue }: { icon: React.ReactNode, label: string, value: string, subValue?: string }) {
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                <div className="opacity-70">{icon}</div>
                <span>{label}</span>
            </div>
            <div className="pl-6">
                <p className="text-sm font-medium text-gray-900 break-words">{value}</p>
                {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
            </div>
        </div>
    )
}

function ActivityRow({ icon, iconColor, iconBg, title, time, desc, isLast = false }: { icon: React.ReactNode, iconColor: string, iconBg: string, title: string, time: string, desc: React.ReactNode, isLast?: boolean }) {
    return (
        <div className="relative flex items-start gap-4">
            {!isLast && (
                <div className="absolute left-[19px] top-10 bottom-[-24px] w-px bg-gray-100" />
            )}
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white shadow-sm ring-4 ring-gray-50 shrink-0 z-10 ${iconBg} ${iconColor}`}>
                {icon}
            </div>
            <div className="flex-1 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                    <h4 className="font-semibold text-gray-900 text-sm tracking-tight">{title}</h4>
                    <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">{time}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}
