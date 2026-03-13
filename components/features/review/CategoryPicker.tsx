"use client"

import { Zap } from "lucide-react"
import type { ReviewCategory } from "@/types/review-types"
import { cn } from "@/lib/utils"

interface CategoryPickerProps {
    categories: ReviewCategory[]
    selectedIds: string[]
    onChange: React.Dispatch<React.SetStateAction<string[]>>
    disabled?: boolean
    maxSelectable?: number
}

function CategoryCard({
    cat,
    selected,
    onClick,
    disabled,
}: {
    cat: ReviewCategory
    selected: boolean
    onClick: () => void
    disabled?: boolean
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "relative flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all duration-150 w-full group",
                disabled && !selected && "opacity-40 cursor-not-allowed",
                selected
                    ? "border-[#E31837] bg-[#E31837]/5 shadow-sm"
                    : "border-gray-200 bg-white hover:border-[#004C8F]/30 hover:bg-gray-50"
            )}
        >
            {/* Left accent bar */}
            <div className={cn(
                "w-0.5 self-stretch rounded-full transition-all",
                selected ? "bg-[#E31837]" : "bg-gray-200 group-hover:bg-gray-300"
            )} />

            <div className="flex-1 min-w-0">
                <span className={cn(
                    "text-sm font-semibold leading-snug block",
                    selected ? "text-[#004C8F]" : "text-gray-700"
                )}>
                    {cat.category_name}
                </span>
                {cat.description && (
                    <span className="text-[11px] text-gray-400 leading-snug mt-0.5 block truncate">
                        {cat.description}
                    </span>
                )}
            </div>

            {/* Multiplier badge */}
            <span className={cn(
                "inline-flex items-center gap-0.5 text-[10px] font-black rounded px-2 py-1 shrink-0",
                selected
                    ? "bg-[#E31837] text-white"
                    : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
            )}>
                <Zap size={8} />
                ×{cat.multiplier}
            </span>
        </button>
    )
}

export default function CategoryPicker({
    categories,
    selectedIds,
    onChange,
    disabled,
    maxSelectable = 5,
}: CategoryPickerProps) {
    function toggleCategory(id: string) {
        onChange((prev) =>
            prev.includes(id)
                ? prev.filter((cid) => cid !== id)
                : [...prev, id]
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {categories.map((cat) => {
                const isSelected = selectedIds.includes(cat.category_id)
                const atMax = selectedIds.length >= maxSelectable && !isSelected
                return (
                    <CategoryCard
                        key={cat.category_id}
                        cat={cat}
                        selected={isSelected}
                        disabled={disabled || atMax}
                        onClick={() => toggleCategory(cat.category_id)}
                    />
                )
            })}
        </div>
    )
}