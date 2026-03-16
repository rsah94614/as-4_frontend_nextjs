"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, ArrowDownRight, Trophy, Users, UserCheck, AlertTriangle, RefreshCw } from "lucide-react";
import { fetchRecognitionUsers, fetchRecognitionTeams } from "@/services/analytics-service";
import type { UserRecognition, TeamRecognition } from "@/types/dashboard-types";

type Range    = "week" | "month" | "quarter" | "year";
type Layout   = "user" | "team";
type UserSort = "givers" | "receivers";

const TEAM_COLORS = ["#004C8F", "#1D6EC5", "#5B9BD5", "#93C5FD", "#1E40AF", "#2563EB", "#3B82F6", "#60A5FA"];

const DATE_RANGES: { value: Range; label: string }[] = [
    { value: "week",    label: "This Week"     },
    { value: "month",   label: "This Month"    },
    { value: "quarter", label: "Last 3 Months" },
    { value: "year",    label: "This Year"     },
];

function AggSkeleton() {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border bg-muted/30">
                    <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
                    <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-5 w-10 rounded" />
                        <Skeleton className="h-3 w-24 rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function TableSkeleton() {
    return (
        <div className="space-y-2 mt-2">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center px-3 py-2 rounded-xl">
                    <div className="col-span-5 flex items-center gap-2">
                        <Skeleton className="w-4 h-3 rounded" />
                        <Skeleton className="w-6 h-6 rounded-md" />
                        <Skeleton className="h-3 w-24 rounded" />
                    </div>
                    <Skeleton className="col-span-3 h-3 rounded mx-auto w-16" />
                    <Skeleton className="col-span-2 h-5 w-8 rounded-full ml-auto" />
                    <Skeleton className="col-span-2 h-5 w-8 rounded-full ml-auto" />
                </div>
            ))}
        </div>
    );
}

function UserTable({ users, sort, onSortChange }: {
    users: UserRecognition[];
    sort: UserSort;
    onSortChange: (s: UserSort) => void;
}) {
    const sorted = sort === "givers"
        ? [...users].sort((a, b) => b.given - a.given)
        : [...users].sort((a, b) => b.received - a.received);

    const sortOptions: { value: UserSort; label: string; icon: React.ElementType; activeClass: string }[] = [
        { value: "givers",    label: "Top Givers",    icon: ArrowUpRight,   activeClass: "bg-[#004C8F] text-white shadow-sm" },
        { value: "receivers", label: "Top Receivers", icon: ArrowDownRight, activeClass: "bg-[#1D6EC5] text-white shadow-sm" },
    ];

    return (
        <div className="space-y-3">
            <div className="flex justify-end">
                <div className="flex items-center gap-1.5 p-1 bg-muted rounded-xl">
                    <span className="text-[11px] text-muted-foreground font-medium px-1.5">Sort by</span>
                    {sortOptions.map(({ value, label, icon: Icon, activeClass }) => (
                        <button key={value} onClick={() => onSortChange(value)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${sort === value ? activeClass : "text-muted-foreground hover:text-gray-700 hover:bg-background/60"}`}>
                            <Icon className="w-3.5 h-3.5" />{label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-12 gap-2 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                <span className="col-span-5">Employee</span>
                <span className="col-span-3 text-center">Dept</span>
                <span className="col-span-2 text-right">Given</span>
                <span className="col-span-2 text-right">Rcvd</span>
            </div>
            <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                {sorted.map((u, i) => (
                    <div key={u.employee_id} className="grid grid-cols-12 gap-2 items-center px-3 py-2 rounded-xl hover:bg-muted/40 transition-colors animate-in fade-in duration-200" style={{ animationDelay: `${i * 30}ms` }}>
                        <div className="col-span-5 flex items-center gap-2 min-w-0">
                            <span className="text-[10px] text-muted-foreground w-4 flex-shrink-0">{i + 1}</span>
                            <div className="w-6 h-6 rounded-md bg-[#EEF4FB] text-[#004C8F] flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                {u.username.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs font-semibold text-gray-900 truncate">{u.username}</span>
                        </div>
                        <span className="col-span-3 text-[10px] text-muted-foreground text-center truncate">{u.department}</span>
                        <div className="col-span-2 flex justify-end">
                            <span className="text-xs font-bold text-[#004C8F] bg-[#EEF4FB] px-2 py-0.5 rounded-full">{u.given}</span>
                        </div>
                        <div className="col-span-2 flex justify-end">
                            <span className="text-xs font-bold text-[#1D6EC5] bg-[#DBEAFE] px-2 py-0.5 rounded-full">{u.received}</span>
                        </div>
                    </div>
                ))}
                {sorted.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No data for this period.</p>}
            </div>
        </div>
    );
}

function TeamBreakdown({ teams }: { teams: TeamRecognition[] }) {
    return (
        <div className="space-y-3">
            {teams.map((t, i) => {
                const total    = t.given + t.received;
                const givenPct = total > 0 ? Math.round((t.given / total) * 100) : 50;
                const color    = TEAM_COLORS[i % TEAM_COLORS.length];
                return (
                    <div key={t.department_id} className="space-y-1.5 animate-in fade-in duration-200" style={{ animationDelay: `${i * 40}ms` }}>
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                                <span className="font-semibold text-gray-900">{t.name}</span>
                                <span className="text-muted-foreground">({t.members})</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px]">
                                <span className="font-bold text-purple-700">↑{t.given}</span>
                                <span className="font-bold text-blue-600">↓{t.received}</span>
                            </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden flex">
                            <div className="h-full rounded-l-full transition-all" style={{ width: `${givenPct}%`, backgroundColor: color + "cc" }} />
                            <div className="h-full rounded-r-full flex-1" style={{ backgroundColor: color + "33" }} />
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>{givenPct}% given</span>
                            <span>{100 - givenPct}% received</span>
                        </div>
                    </div>
                );
            })}
            {teams.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No data for this period.</p>}
        </div>
    );
}

type RecognitionState = {
    users: UserRecognition[];
    teams: TeamRecognition[];
    loading: boolean;
    error: boolean;
};

export default function AdminRecognitionSection({ 
    initialUsers, 
    initialTeams 
}: { 
    initialUsers?: UserRecognition[] | null; 
    initialTeams?: TeamRecognition[] | null; 
}) {
    const [range,    setRange]    = useState<Range>("month");
    const [layout,   setLayout]   = useState<Layout>("user");
    const [userSort, setUserSort] = useState<UserSort>("givers");

    const [recog, setRecog] = useState<RecognitionState>({
        users: initialUsers ?? [],
        teams: initialTeams ?? [],
        loading: initialUsers === undefined || initialTeams === undefined,
        error: false,
    });

    // Sync prop to state during render
    const [prevInitial, setPrevInitial] = useState({ u: initialUsers, t: initialTeams });
    if (initialUsers !== prevInitial.u || initialTeams !== prevInitial.t) {
        setPrevInitial({ u: initialUsers, t: initialTeams });
        if (range === "month") {
            setRecog({
                users: initialUsers ?? [],
                teams: initialTeams ?? [],
                loading: false,
                error: false
            });
        }
    }

    // loadAll only touches state in .then() — never synchronously.
    const loadAll = useCallback((r: Range) => {
        Promise.all([
            fetchRecognitionUsers(r),
            fetchRecognitionTeams(r),
        ]).then(([usersRes, teamsRes]) => {
            setRecog({
                users:   usersRes ? usersRes.items : [],
                teams:   teamsRes ? teamsRes.items : [],
                loading: false,
                error:   !usersRes || !teamsRes,
            });
        });
    }, []);

    const handleRangeChange = useCallback((v: Range) => {
        setRecog(prev => ({ ...prev, loading: true }));
        setRange(v);
    }, []);

    useEffect(() => {
        if (range === "month" && initialUsers && initialTeams) return;
        loadAll(range);
    }, [range, loadAll, initialUsers, initialTeams]);

    const { users, teams, loading, error } = recog;

    const totalGiven    = users.reduce((s, u) => s + u.given,    0);
    const totalReceived = users.reduce((s, u) => s + u.received, 0);
    const giverCount    = users.filter(u => u.given    > 0).length;
    const receiverCount = users.filter(u => u.received > 0).length;

    const aggCards = [
        { label: "Total Given",      value: totalGiven,    icon: ArrowUpRight,   color: "bg-[#EEF4FB] text-[#004C8F]"  },
        { label: "Total Received",   value: totalReceived, icon: ArrowDownRight, color: "bg-[#DBEAFE] text-[#1D6EC5]"   },
        { label: "Unique Givers",    value: giverCount,    icon: UserCheck,      color: "bg-[#BFDBFE] text-[#004C8F]"   },
        { label: "Unique Receivers", value: receiverCount, icon: Users,          color: "bg-[#EEF4FB] text-[#1D6EC5]"   },
    ];

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
                    <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wide">
                        <Trophy className="w-4 h-4 text-[#004C8F]" />
                        Recognition
                    </CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground font-medium">View by</span>
                            <Tabs value={layout} onValueChange={v => setLayout(v as Layout)}>
                                <TabsList className="h-8">
                                    <TabsTrigger value="user" className="text-xs px-3 h-7">Per User</TabsTrigger>
                                    <TabsTrigger value="team" className="text-xs px-3 h-7">Per Team</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                        <Select value={range} onValueChange={v => handleRangeChange(v as Range)}>
                            <SelectTrigger size="sm" className="w-36">
                                <SelectValue placeholder="Date range" />
                            </SelectTrigger>
                            <SelectContent>
                                {DATE_RANGES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {loading ? <AggSkeleton /> : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {aggCards.map(({ label, value, icon: Icon, color }, i) => (
                            <div key={label} className="flex items-center gap-3 p-3 rounded-xl border bg-muted/30 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${i * 60}ms` }}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
                                    <p className="text-[11px] font-medium text-muted-foreground truncate">{label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {error && !loading && (
                    <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                            <AlertTriangle className="w-6 h-6 text-red-500" />
                        </div>
                        <p className="text-sm text-gray-500">Could not load recognition data.</p>
                        <Button size="sm" onClick={() => loadAll(range)} className="gap-2 font-bold rounded-lg bg-[#004C8F] text-white hover:bg-[#003A70] px-4">
                            <RefreshCw className="w-3.5 h-3.5" />
                            Retry
                        </Button>
                    </div>
                )}

                {!error && (
                    <>
                        {layout === "user"  && (loading ? <TableSkeleton /> : <UserTable users={users} sort={userSort} onSortChange={setUserSort} />)}
                        {layout === "team"  && (loading ? <TableSkeleton /> : <TeamBreakdown teams={teams} />)}
                    </>
                )}
            </CardContent>
        </Card>
    );
}