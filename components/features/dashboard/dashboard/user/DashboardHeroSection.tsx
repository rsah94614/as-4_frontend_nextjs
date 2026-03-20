import { getGreeting } from "@/lib/dashboard-utils";
import { useAuth } from "@/providers/AuthProvider";
import { Sparkles } from "lucide-react";



export default function DashboardHeroSection() {
    const { user } = useAuth();

    const dateStr = new Date().toLocaleDateString("en-IN", {
        weekday: "long", day: "numeric", month: "long",
    });


    return <div className="relative  overflow-hidden bg-gradient-to-br from-[#003A70] via-[#004C8F] to-[#1D6EC5] px-6 py-7 text-white">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-20%] right-[-10%] w-72 h-72 rounded-full bg-white" />
            <div className="absolute bottom-[-30%] right-[20%]  w-40 h-40 rounded-full bg-white" />
        </div>

        <div className="relative flex items-end justify-between gap-4">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span className="text-white/70 text-sm font-medium">{getGreeting()}</span>
                </div>
                <h1 className="text-3xl font-black text-white leading-tight">
                    {user?.username}!
                </h1>
                <p className="text-white/60 text-sm mt-1.5">
                    Here&apos;s your recognition activity at a glance.
                </p>
            </div>
            <p className="hidden sm:block text-white/40 text-xs shrink-0 pb-1 text-right">
                {dateStr}
            </p>
        </div>
    </div>
}

