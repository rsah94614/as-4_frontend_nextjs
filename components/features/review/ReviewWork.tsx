import { BookOpen } from "lucide-react"
import { Card } from "@/components/ui/card"
import ReviewActivity from "./ReviewActivity"

const HOW_IT_WORKS = [
    { n: "01", title: "Select a Teammate", desc: "Choose who you'd like to recognise. Each person can be reviewed once per month." },
    { n: "02", title: "Pick Categories", desc: "Select 1–5 categories that best describe their contribution. Points are calculated based on your selections." },
    { n: "03", title: "Write Feedback", desc: "Describe what they did, the impact it had, and why it matters. Min 10, max 2000 characters." },
    { n: "04", title: "Attach Evidence", desc: "Optionally add an image or video to support your feedback. Max 2 files." },
    { n: "05", title: "Submit", desc: "Points are auto-credited to the receiver's wallet on submission." },
]

export default function ReviewSidebar({ givenThisMonth, uniquePeopleCount, totalReviews, loadingStats }: {
    givenThisMonth: number; uniquePeopleCount: number; totalReviews: number; loadingStats?: boolean
}) {
    return (
        <div className="space-y-3">
            <ReviewActivity
                givenThisMonth={givenThisMonth}
                uniquePeopleCount={uniquePeopleCount}
                totalReviews={totalReviews}
                loadingStats={loadingStats}
            />

            <Card className="rounded-xl overflow-hidden shadow-sm border-gray-200 !py-0 !gap-0">
                <div className="px-5 py-3 bg-white border-b border-gray-200 flex items-center gap-2">
                    <BookOpen size={13} className="text-[#E31837]" />
                    <h3 className="text-[11px] font-bold text-[#004C8F] uppercase tracking-widest m-0 leading-none">How It Works</h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {HOW_IT_WORKS.map(s => (
                        <div key={s.n} className="flex gap-3 px-5 py-2.5 hover:bg-gray-50 transition-colors">
                            <span className="text-[11px] font-black text-[#E31837] w-5 shrink-0 tabular-nums pt-0.5">{s.n}</span>
                            <div>
                                <p className="text-xs font-semibold text-[#004C8F] mb-0.5">{s.title}</p>
                                <p className="text-[11px] text-gray-500 leading-snug">{s.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    )
}
