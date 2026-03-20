import { Skeleton } from "@/components/ui/skeleton";

export default function HistoryListSkeleton() {
    return (
        <div className="space-y-4 sm:space-y-5">
            {Array.from({ length: 5 }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-[22px] border border-slate-200/80 bg-white p-4 sm:p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
                >
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 sm:gap-4 flex-1">
                            <Skeleton className="h-11 w-11 rounded-2xl shrink-0" />

                            <div className="space-y-3 flex-1">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-6 w-24 rounded-full" />
                                    <Skeleton className="h-6 w-24 rounded-full" />
                                </div>
                                <Skeleton className="h-5 w-4/5 sm:w-3/5" />
                                <Skeleton className="h-4 w-2/5" />
                            </div>
                        </div>

                        <Skeleton className="h-14 w-24 rounded-2xl shrink-0" />
                    </div>
                </div>
            ))}
        </div>
    );
}
