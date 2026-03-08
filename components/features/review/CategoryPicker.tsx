"use client"

import { Check } from "lucide-react"
import type { ReviewCategory } from "@/types/review-types"
import { cn } from "@/lib/utils"

// ─── Category Picker ──────────────────────────────────────────────────────────

interface CategoryPickerProps {
    categories: ReviewCategory[]
    selectedIds: string[]
    onChange: React.Dispatch<React.SetStateAction<string[]>>
    disabled?: boolean
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
                "relative flex flex-col gap-1.5 rounded-2xl border-2 px-4 py-3.5 text-left transition-all duration-200 w-full",
                disabled && !selected && "opacity-40 cursor-not-allowed",
                selected
                    ? "border-purple-500 bg-purple-50/60 shadow-sm"
                    : "border-gray-100 bg-white hover:border-purple-200 hover:shadow-sm"
            )}
        >
            <span
                className={cn(
                    "text-sm font-semibold leading-snug",
                    selected ? "text-purple-700" : "text-gray-800"
                )}
            >
                {cat.category_name}
            </span>

            {cat.description && (
                <span className="text-[11px] text-gray-400 leading-snug line-clamp-1">
                    {cat.description}
                </span>
            )}

            {selected && (
                <span className="absolute top-2.5 right-2.5 w-5 h-5 bg-purple-700 rounded-full flex items-center justify-center">
                    <Check size={11} className="text-white" strokeWidth={3} />
                </span>
            )}
        </button>
    )
}

export default function CategoryPicker({
    categories,
    selectedIds,
    onChange,
    disabled,
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
                const atMax = selectedIds.length >= 5 && !isSelected
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
