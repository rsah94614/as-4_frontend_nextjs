import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileSkeleton() {
    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Back Button Skeleton */}
            <div className="flex items-center gap-2 -ml-4">
                <Skeleton className="w-32 h-10 rounded-xl" />
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs">
                <div className="p-6 sm:p-8 md:p-10">
                    {/* Header skeleton */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-gray-100">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 w-full">
                            <Skeleton className="w-24 h-24 sm:w-28 sm:h-28 rounded-full shrink-0" />
                            <div className="space-y-4 pt-2 w-full max-w-sm">
                                <div className="space-y-2">
                                    <Skeleton className="h-8 w-48" />
                                    <Skeleton className="h-4 w-64" />
                                </div>
                                <div className="flex gap-2">
                                    <Skeleton className="h-6 w-20 rounded-md" />
                                    <Skeleton className="h-6 w-24 rounded-md" />
                                </div>
                                <Skeleton className="h-4 w-40 mt-2" />
                            </div>
                        </div>
                    </div>

                    {/* Stats skeleton */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-8 border-b border-gray-100">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 border border-gray-100 rounded-2xl p-5 shadow-xs">
                                <Skeleton className="w-14 h-14 rounded-xl shrink-0" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-7 w-12" />
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Sections skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-8">
                        {/* Left Column */}
                        <div className="space-y-6 lg:col-span-1">
                            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
                                <Skeleton className="h-4 w-32 mb-6" />
                                <div className="space-y-6">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="flex gap-3">
                                            <Skeleton className="w-4 h-4 shrink-0 rounded-full" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-3 w-16" />
                                                <Skeleton className="h-4 w-32" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
                                <Skeleton className="h-4 w-32 mb-6" />
                                <div className="space-y-6">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex gap-3">
                                            <Skeleton className="w-4 h-4 shrink-0 rounded-full" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-3 w-20" />
                                                <Skeleton className="h-4 w-36" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6 lg:col-span-2">
                            <div className="rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-xs h-64">
                                <Skeleton className="h-4 w-40 mb-6" />
                                <div className="flex gap-5">
                                    <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
                                    <div className="space-y-3 w-full">
                                        <Skeleton className="h-6 w-1/2" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-4/5" />
                                        <Skeleton className="h-4 w-32 mt-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
