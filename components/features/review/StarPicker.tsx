"use client"

import { useState } from "react"
import { Star } from "lucide-react"

// ─── Star Rating Picker ───────────────────────────────────────────────────────

interface StarPickerProps {
    value: number
    onChange: (v: number) => void
    disabled?: boolean
}

export default function StarPicker({ value, onChange, disabled }: StarPickerProps) {
    const [hover, setHover] = useState(0)

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
                <button
                    key={i}
                    type="button"
                    disabled={disabled}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => onChange(i)}
                    className="p-1.5 rounded-xl hover:bg-amber-50 transition-colors disabled:cursor-not-allowed"
                >
                    <Star
                        size={22}
                        className={`transition-transform duration-150
              ${i <= (hover || value)
                                ? "fill-amber-400 text-amber-400 scale-110"
                                : "fill-gray-100 text-gray-200"
                            }`}
                    />
                </button>
            ))}
        </div>
    )
}
