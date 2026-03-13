import { CheckCircle2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { SubmittedReviewData } from "@/types/review-types"
import { fmtDate } from "@/lib/review-utils"

export default function ReviewSuccessView({ data, onStartNew }: { data: SubmittedReviewData; onStartNew?: () => void }) {
    return (
        <Card className="rounded-xl overflow-hidden shadow-sm border-gray-200">
            <div className="h-1 bg-[#E31837]" />
            <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-50 border-4 border-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-bold text-[#004C8F] mb-1">Recognition Submitted!</h3>
                <p className="text-sm text-gray-500 mb-6">Your feedback has been recorded and points credited.</p>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-left space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Recognised</span>
                        <span className="font-semibold text-[#004C8F]">{data.receiverName}</span>
                    </div>
                    {data.categoryNames?.length > 0 && (
                        <div className="flex justify-between text-sm items-start gap-4">
                            <span className="text-gray-500 shrink-0">Categories</span>
                            <div className="flex flex-wrap gap-1 justify-end">
                                {data.categoryNames.map((c: string) => (
                                    <span key={c} className="text-[10px] font-bold bg-[#004C8F]/8 text-[#004C8F] px-2 py-0.5 rounded">{c}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    {data.submittedAt && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Submitted</span>
                            <span className="text-gray-600 text-xs">{fmtDate(data.submittedAt)}</span>
                        </div>
                    )}
                </div>
                <Button type="button" onClick={onStartNew} className="w-full h-12 bg-[#004C8F] hover:bg-[#003a6e] font-semibold">
                    Write Another Recognition
                </Button>
            </div>
        </Card>
    )
}
