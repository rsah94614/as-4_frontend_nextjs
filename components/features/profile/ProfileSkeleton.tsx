import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function ProfileSkeleton() {
    return (
        <Card className="border-none shadow-sm rounded-2xl md:rounded-3xl">
            <CardContent className="p-4 sm:p-6 md:p-8 space-y-6">
                {/* Header skeleton */}
                <div className="flex items-center gap-4">
                    <Skeleton className="w-16 h-16 rounded-full shrink-0" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-56" />
                        <div className="flex gap-2 mt-1">
                            <Skeleton className="h-5 w-16 mb-0 rounded-full" />
                            <Skeleton className="h-5 w-20 mb-0 rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Wallet skeleton */}
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-4 border text-center space-y-2">
                            <Skeleton className="w-4 h-4 mx-auto" />
                            <Skeleton className="h-6 w-12 mx-auto" />
                            <Skeleton className="h-3 w-20 mx-auto" />
                        </div>
                    ))}
                </div>

                {/* Info fields skeleton */}
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <div key={i} className="flex items-start gap-3 p-4 rounded-xl border bg-white">
                            <Skeleton className="w-4 h-4 mt-0.5 shrink-0" />
                            <div className="space-y-1.5 flex-1">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
