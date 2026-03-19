"use client"

import { useState, useRef, useEffect } from "react"
import { Users, ChevronDown, Search, X, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TeamMember } from "@/services/employee-service"

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

    useEffect(() => {
        if (open && searchRef.current) {
            setTimeout(() => searchRef.current?.focus(), 50)
        }
    }, [open])

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

    const filteredReceivers = allReceivers.filter((m) => {
        if (!search.trim()) return true
        const q = search.toLowerCase()
        return (
            m.name.toLowerCase().includes(q) ||
            (m.designation?.toLowerCase().includes(q) ?? false)
        )
    })

    function getInitials(name: string) {
        return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
    }

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
                    "w-full flex items-center gap-3 rounded-lg border bg-white px-4 py-3.5 text-left transition-all",
                    open
                        ? "border-[#004C8F] ring-2 ring-[#004C8F]/10"
                        : "border-gray-200 hover:border-gray-300"
                )}
            >
                {selected ? (
                    <>
                        <div className="w-9 h-9 rounded-lg bg-[#004C8F] flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {getInitials(selected.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#004C8F]">{selected.name}</p>
                            <p className="text-xs text-gray-400">
                                {selected.designation ?? (selected.isManager ? "Manager" : "Team Member")}
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            <Users size={15} className="text-gray-400" />
                        </div>
                        <span className="text-sm text-gray-400">Select a team member…</span>
                    </>
                )}
                <ChevronDown
                    size={15}
                    className={cn(
                        "text-gray-400 ml-auto shrink-0 transition-transform duration-200",
                        open && "rotate-180"
                    )}
                />
            </button>

            {open && (
                <div className="absolute z-40 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl shadow-black/10 overflow-hidden">
                    {/* Search */}
                    <div className="p-3 border-b border-gray-100">
                        <div className="relative">
                            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                ref={searchRef}
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search members…"
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-8 text-sm
                                    placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004C8F]/15 focus:border-[#004C8F]/40"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-60 overflow-y-auto">
                        {filteredReceivers.length === 0 ? (
                            <p className="text-sm text-gray-400 p-5 text-center">
                                {allReceivers.length === 0 ? "No team members found." : `No match for "${search}"`}
                            </p>
                        ) : (
                            filteredReceivers.map((m) => {
                                const done = reviewedThisMonth.has(m.id)
                                const isSelected = receiverId === m.id
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
                                            done ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50 cursor-pointer",
                                            isSelected && "bg-[#E31837]/5"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0",
                                            m.isManager ? "bg-[#004C8F] text-white" : "bg-gray-200 text-gray-600"
                                        )}>
                                            {getInitials(m.name)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-[#004C8F] truncate">{m.name}</p>
                                            <p className="text-xs text-gray-400">
                                                {m.designation ?? (m.isManager ? "Manager" : "Employee")}
                                            </p>
                                        </div>
                                        {isSelected && <Check size={14} className="text-[#E31837] shrink-0" />}
                                        {done && !isSelected && (
                                            <span className="text-[9px] font-bold bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                                Reviewed
                                            </span>
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