"use client"

import { useEffect } from "react"
import { X, CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react"
import type { ToastKind } from "@/types/review-types"

interface ReviewToastProps {
    msg: string
    kind: ToastKind
    onClose: () => void
}

const KIND_CONFIG: Record<ToastKind, { bg: string; border: string; icon: React.ReactNode; text: string }> = {
    success: {
        bg: "bg-white",
        border: "border-l-4 border-l-[#22c55e]",
        text: "text-[#0A1628]",
        icon: <CheckCircle2 size={18} className="text-[#22c55e] shrink-0" />,
    },
    error: {
        bg: "bg-white",
        border: "border-l-4 border-l-[#E31837]",
        text: "text-[#0A1628]",
        icon: <AlertCircle size={18} className="text-[#E31837] shrink-0" />,
    },
    warning: {
        bg: "bg-white",
        border: "border-l-4 border-l-[#f59e0b]",
        text: "text-[#0A1628]",
        icon: <AlertTriangle size={18} className="text-[#f59e0b] shrink-0" />,
    },
}

export default function ReviewToast({ msg, kind, onClose }: ReviewToastProps) {
    useEffect(() => {
        const t = setTimeout(onClose, 4500)
        return () => clearTimeout(t)
    }, [onClose])

    const config = KIND_CONFIG[kind]

    return (
        <div
            className={`fixed bottom-6 right-6 z-50 ${config.bg} ${config.border} rounded-xl
                shadow-2xl shadow-black/10 flex items-center gap-3 px-4 py-3.5 min-w-[280px] max-w-[360px]
                animate-in slide-in-from-bottom-4 fade-in duration-300 ring-1 ring-gray-100`}
        >
            {config.icon}
            <p className={`text-sm font-medium flex-1 ${config.text}`}>{msg}</p>
            <button
                onClick={onClose}
                className="text-gray-300 hover:text-gray-500 transition-colors ml-1 shrink-0"
            >
                <X size={14} />
            </button>
        </div>
    )
}