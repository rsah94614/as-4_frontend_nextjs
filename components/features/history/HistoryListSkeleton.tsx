import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function HistoryListSkeleton() {
    return (
        <div className="space-y-3 sm:space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <div
                    key={i}
                    className="bg-white rounded-xl border p-3 sm:p-5 flex items-center justify-between gap-3"
                >
                    <div className="flex items-center gap-2 sm:gap-4 flex-1">
                        {/* Icon skeleton */}
                        <Skeleton className="h-5 w-5 rounded-full shrink-0" />

                        <div className="space-y-2 flex-1">
                            {/* Message skeleton */}
                            <Skeleton className="h-4 w-3/4 sm:w-1/2" />
                            {/* Date skeleton */}
                            <Skeleton className="h-3 w-20" />
                        </div>
                    </div>

                    {/* Points skeleton */}
                    <Skeleton className="h-5 w-12 shrink-0" />
                </div>
            ))}
        </div>
    );
}
