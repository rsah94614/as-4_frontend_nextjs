"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import type { ToastKind } from "@/types"

// ─── Toast Notification ───────────────────────────────────────────────────────

interface ReviewToastProps {
    msg: string
    kind: ToastKind
    onClose: () => void
}

const KIND_COLORS: Record<ToastKind, string> = {
    success: "bg-green-600",
    error: "bg-red-600",
    warning: "bg-amber-500",
}

export default function ReviewToast({ msg, kind, onClose }: ReviewToastProps) {
    useEffect(() => {
        const t = setTimeout(onClose, 4000)
        return () => clearTimeout(t)
    }, [onClose])

    return (
        <div
            className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-white text-sm font-medium
        shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-4 fade-in duration-300
        ${KIND_COLORS[kind]}`}
        >
            {msg}
            <button onClick={onClose} className="hover:opacity-70">
                <X size={14} />
            </button>
        </div>
    )
}
