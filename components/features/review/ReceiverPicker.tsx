"use client"

import { useState, useRef, useEffect } from "react"
import { Users, ChevronDown, Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { TeamMember } from "@/types"

// ─── Receiver Picker (with search) ────────────────────────────────────────────

interface ReceiverPickerProps {
    allReceivers: (TeamMember & { isManager: boolean })[]
    receiverId: string
    onSelect: (id: string) => void
    reviewedThisMonth: Set<string>
}

export default function ReceiverPicker({
    allReceivers,
    receiverId,
    onSelect,
    reviewedThisMonth,
}: ReceiverPickerProps) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState("")
    const selected = allReceivers.find((x) => x.id === receiverId)
    const searchRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // Auto-focus search input when dropdown opens
    useEffect(() => {
        if (open && searchRef.current) {
            setTimeout(() => searchRef.current?.focus(), 50)
        }
    }, [open])

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
                setSearch("")
            }
        }
        if (open) {
            document.addEventListener("mousedown", handleClickOutside)
            return () => document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [open])

    // Filter receivers by search term
    const filteredReceivers = allReceivers.filter((m) => {
        if (!search.trim()) return true
        const q = search.toLowerCase()
        return (
            m.name.toLowerCase().includes(q) ||
            (m.designation?.toLowerCase().includes(q) ?? false)
        )
    })

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => {
                    setOpen((o) => {
                        if (o) setSearch("")
                        return !o
                    })
                }}
                className={cn(
                    "w-full flex items-center gap-3 rounded-xl border bg-gray-50 px-4 py-3 text-left transition-all",
                    open
                        ? "ring-2 ring-purple-300 border-transparent"
                        : "border-gray-200 hover:border-gray-300"
                )}
            >
                {selected ? (
                    <>
                        <div
                            className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0",
                                selected.isManager
                                    ? "bg-purple-200 text-purple-700"
                                    : "bg-purple-100 text-purple-700"
                            )}
                        >
                            {selected.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800">{selected.name}</p>
                            <p className="text-xs text-gray-400">
                                {selected.designation ?? (selected.isManager ? "Manager" : "Team Member")}
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Users size={14} className="text-gray-400" />
                        </div>
                        <span className="text-sm text-gray-400">Select a team member…</span>
                    </>
                )}
                <ChevronDown
                    size={16}
                    className={cn(
                        "text-gray-400 ml-auto flex-shrink-0 transition-transform duration-200",
                        open && "rotate-180"
                    )}
                />
            </button>

            {open && (
                <div className="absolute z-40 top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">

                    {/* Search input */}
                    <div className="px-3 pt-3 pb-2">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                ref={searchRef}
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name…"
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-8 text-sm text-gray-800
                                    placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-transparent
                                    transition-all"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Results list */}
                    <div className="max-h-56 overflow-y-auto">
                        {filteredReceivers.length === 0 ? (
                            <p className="text-sm text-gray-400 p-5 text-center">
                                {allReceivers.length === 0
                                    ? "No team members found."
                                    : `No match for "${search}"`}
                            </p>
                        ) : (
                            filteredReceivers.map((m) => {
                                const done = reviewedThisMonth.has(m.id)
                                return (
                                    <button
                                        key={m.id}
                                        type="button"
                                        disabled={done}
                                        onClick={() => {
                                            onSelect(m.id)
                                            setOpen(false)
                                        }}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                                            done
                                                ? "opacity-40 cursor-not-allowed bg-gray-50"
                                                : "hover:bg-purple-50 cursor-pointer",
                                            receiverId === m.id && "bg-purple-50"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0",
                                                m.isManager
                                                    ? "bg-purple-200 text-purple-700"
                                                    : "bg-purple-100 text-purple-700"
                                            )}
                                        >
                                            {m.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{m.name}</p>
                                            <p className="text-xs text-gray-400">
                                                {m.designation ?? (m.isManager ? "Manager" : "")}
                                            </p>
                                        </div>
                                        {done && (
                                            <Badge variant="secondary" className="text-[9px] font-bold">
                                                Reviewed
                                            </Badge>
                                        )}
                                    </button>
                                )
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
