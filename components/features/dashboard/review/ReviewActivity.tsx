import { BarChart3 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ReviewActivity({ givenThisMonth, uniquePeopleCount, totalReviews, loadingStats }: {
    givenThisMonth: number; uniquePeopleCount: number; totalReviews: number; loadingStats?: boolean
}) {
    return (
        <Card className="rounded-xl overflow-hidden shadow-sm border-gray-200 !py-0 !gap-0">
            <div className="px-5 py-3 bg-white border-b border-gray-200 flex items-center gap-2">
                <BarChart3 size={13} className="text-[#E31837]" />
                <h3 className="text-[11px] font-bold text-[#004C8F] uppercase tracking-widest m-0 leading-none">Your Activity</h3>
            </div>
            {loadingStats ? (
                <div className="p-5 space-y-3">
                    {[0,1,2].map(i => (
                        <div key={i} className="flex items-center justify-between">
                            <Skeleton className="h-4 w-28" /><Skeleton className="h-5 w-8" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {[
                        { label: "Given This Month", value: givenThisMonth, sub: "Reviews submitted" },
                        { label: "Unique People", value: uniquePeopleCount, sub: "Teammates recognised" },
                        { label: "Total Reviews", value: totalReviews, sub: "Given & received" },
                    ].map(row => (
                        <div key={row.label} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                            <div>
                                <p className="text-xs font-semibold text-[#004C8F]">{row.label}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{row.sub}</p>
                            </div>
                            <span className="text-xl font-bold text-[#004C8F] tabular-nums">{row.value}</span>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    )
}
