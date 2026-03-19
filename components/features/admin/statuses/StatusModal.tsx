"use client";

import React, { useState } from "react";
import { Loader2, Save, ClipboardList, AlertTriangle } from "lucide-react";
import { EntityType, ENTITY_TYPES, ENTITY_META } from "@/types/status-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface StatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (form: {
        status_code: string;
        status_name: string;
        description: string;
        entity_type: EntityType;
    }) => Promise<void>;
    saving: boolean;
}

export function StatusModal({ isOpen, onClose, onCreate, saving }: StatusModalProps) {
    const [form, setForm] = useState({
        status_code: "",
        status_name: "",
        description: "",
        entity_type: "EMPLOYEE" as EntityType,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onCreate(form);
        setForm({ status_code: "", status_name: "", description: "", entity_type: "EMPLOYEE" });
    };

    const handleClose = () => {
        onClose();
        setForm({ status_code: "", status_name: "", description: "", entity_type: "EMPLOYEE" });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="max-w-lg p-0 border-none bg-white rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] selection:bg-[#004C8F] selection:text-white"
            >
                <DialogHeader className="flex flex-row items-center justify-between px-8 py-6 border-b border-slate-50 bg-slate-50/50 shrink-0">
                    <div className="flex items-center gap-3 text-left">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-100 text-green-600 shadow-inner">
                            <ClipboardList className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-semibold text-slate-800 tracking-tight leading-none mb-1">
                                Add Status
                            </DialogTitle>
                            <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                                STATUS MANAGEMENT
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6 overflow-y-auto flex-1">
                    <div className="space-y-1.5 mb-5 group">
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1 group-focus-within:text-[#004C8F] transition-colors">
                            CATEGORY
                        </label>
                        <Select
                            value={form.entity_type}
                            onValueChange={(val) =>
                                setForm((p) => ({
                                    ...p,
                                    entity_type: val as EntityType,
                                }))
                            }
                        >
                            <SelectTrigger className="w-full h-12 px-5 rounded-xl border-2 border-slate-100 text-sm font-semibold text-black focus-visible:ring-0 focus-visible:border-[#004C8F] bg-white">
                                <SelectValue placeholder="Select category…" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {ENTITY_TYPES.map((t) => (
                                    <SelectItem key={t} value={t} className="font-semibold">
                                        {ENTITY_META[t].label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5 mb-5 group">
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1 group-focus-within:text-[#004C8F] transition-colors">
                            STATUS CODE
                        </label>
                        <Input
                            value={form.status_code}
                            onChange={(e) =>
                                setForm((p) => ({
                                    ...p,
                                    status_code: e.target.value
                                        .toUpperCase()
                                        .replace(/\s/g, "_"),
                                }))
                            }
                            placeholder="e.g. ON_LEAVE"
                            maxLength={50}
                            className="w-full h-12 px-5 rounded-xl border-2 border-slate-100 text-sm font-semibold text-black focus-visible:ring-0 focus-visible:border-[#004C8F] bg-white placeholder:text-slate-300 transition-all uppercase"
                        />
                        <div className="flex items-center gap-1.5 mt-2 ml-1">
                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                            <p className="text-[10px] text-slate-500 font-medium">
                                This code is permanent and used by the system internally. Choose carefully.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-1.5 mb-5 group">
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1 group-focus-within:text-[#004C8F] transition-colors">
                            DISPLAY NAME
                        </label>
                        <Input
                            value={form.status_name}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, status_name: e.target.value }))
                            }
                            placeholder="e.g. On Leave"
                            maxLength={100}
                            className="w-full h-12 px-5 rounded-xl border-2 border-slate-100 text-sm font-semibold text-black focus-visible:ring-0 focus-visible:border-[#004C8F] bg-white placeholder:text-slate-300 transition-all"
                        />
                    </div>

                    <div className="space-y-1.5 mb-5 group">
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1 group-focus-within:text-[#004C8F] transition-colors">
                            DESCRIPTION
                        </label>
                        <Textarea
                            value={form.description}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, description: e.target.value }))
                            }
                            className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-100 text-sm font-semibold text-black focus-visible:ring-0 focus-visible:border-[#004C8F] bg-white placeholder:text-slate-300 transition-all min-h-[100px] resize-none"
                            rows={2}
                            placeholder="e.g. Employee is temporarily on approved leave."
                        />
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-slate-50">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleClose}
                            disabled={saving}
                            className="flex-1 h-14 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all tracking-wider uppercase"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={saving}
                            className="flex-1 h-14 rounded-xl text-xs font-semibold text-white bg-[#004C8F] hover:bg-[#003d73] transition-all tracking-wider uppercase flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none"
                        >
                            {saving ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Create
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

