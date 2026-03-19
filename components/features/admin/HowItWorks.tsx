"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────────────────
 * Types
 * ──────────────────────────────────────────────────────────────────────────── */
export interface HowItWorksStep {
    /** Step number label, e.g. "01" */
    n: string;
    /** Short title for the step */
    title: string;
    /** Longer description */
    desc: string;
}

interface HowItWorksProps {
    /** Array of step objects to render */
    steps: HowItWorksStep[];
    /** Extra wrapper className */
    className?: string;
    /** Whether to start expanded (default: false) */
    defaultOpen?: boolean;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Component
 * ──────────────────────────────────────────────────────────────────────────── */
export function HowItWorks({ steps, className, defaultOpen = false }: HowItWorksProps) {
    const [open, setOpen] = useState(defaultOpen);
    const contentRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<number>(0);

    /* Measure the inner content whenever it changes or opens */
    const measure = useCallback(() => {
        if (contentRef.current) {
            setHeight(contentRef.current.scrollHeight);
        }
    }, []);

    useEffect(() => {
        measure();
        // Re-measure on window resize (responsive grid changes height)
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, [measure, steps]);

    /* Dynamically pick grid columns based on step count */
    const gridCols =
        steps.length <= 2
            ? "sm:grid-cols-2"
            : steps.length === 3
              ? "sm:grid-cols-3"
              : steps.length <= 4
                ? "sm:grid-cols-2 lg:grid-cols-4"
                : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5";

    return (
        <div
            className={cn(
                "bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-6",
                className,
            )}
        >
            {/* ── Toggle button ── */}
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className={cn(
                    "w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5",
                    "hover:bg-gray-50 transition-colors group",
                )}
            >
                <div className="flex items-center">
                    <span className="text-[11px] font-bold text-[#004C8F] uppercase tracking-widest">
                        How It Works
                    </span>
                </div>
                <ChevronDown
                    size={15}
                    className={cn(
                        "text-gray-400 shrink-0 transition-transform duration-300",
                        open && "rotate-180",
                    )}
                />
            </button>

            {/* ── Animated collapse wrapper ── */}
            <div
                className="transition-[max-height,opacity] duration-400  overflow-hidden"
                style={{
                    maxHeight: open ? `${height}px` : "0px",
                    opacity: open ? 1 : 0,
                }}
            >
                <div ref={contentRef} className="border-t border-gray-100">
                    <div
                        className={cn(
                            "grid grid-cols-1 divide-y sm:divide-y-0 sm:divide-x divide-gray-100",
                            gridCols,
                        )}
                    >
                        {steps.map((step, idx) => (
                            <div
                                key={step.n}
                                className="flex gap-3 px-4 sm:px-5 py-3 sm:py-4"
                                style={{
                                    animationName: open ? "hiw-fade-up" : "none",
                                    animationDuration: "0.35s",
                                    animationTimingFunction: "cubic-bezier(.4,0,.2,1)",
                                    animationFillMode: "both",
                                    animationDelay: `${idx * 60}ms`,
                                }}
                            >
                                <span className="text-[10px] font-black text-[#000000] w-6 shrink-0 tabular-nums pt-0.5">
                                    {step.n}
                                </span>
                                <div>
                                    <p className="text-xs font-semibold text-[#004C8F] mb-0.5">
                                        {step.title}
                                    </p>
                                    <p className="text-[11px] text-gray-500 leading-relaxed">
                                        {step.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Inline keyframe animation for the staggered fade-up */}
            <style jsx>{`
                @keyframes hiw-fade-up {
                    from {
                        opacity: 0;
                        transform: translateY(8px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}

export default HowItWorks;
