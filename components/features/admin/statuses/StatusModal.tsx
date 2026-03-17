"use client";

import React, { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { EntityType, ENTITY_TYPES, ENTITY_META } from "@/types/status-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Field } from "./UIHelpers";

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

    const handleSubmit = async () => {
        await onCreate(form);
        setForm({ status_code: "", status_name: "", description: "", entity_type: "EMPLOYEE" });
    };

    const handleClose = () => {
        onClose();
        setForm({ status_code: "", status_name: "", description: "", entity_type: "EMPLOYEE" });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-xl border-0 [&>button]:hidden">
                {/* Blue header */}
                <div className="px-6 py-4" style={{ background: "#004C8F" }}>
                    <DialogHeader>
                        <DialogTitle className="text-white font-bold text-sm">
                            Add New Status
                        </DialogTitle>
                        <DialogDescription className="text-blue-200 text-xs mt-0.5">
                            Create a status label that can be assigned to employees, reviews,
                            transactions, or rewards.
                        </DialogDescription>
                    </DialogHeader>
                </div>
                {/* Red accent line */}
                <div className="h-0.5" style={{ background: "#E31837" }} />

                <div className="space-y-4 p-6 bg-white">
                    <Field
                        label="Category *"
                        hint="Which area of the system will this status be used for?"
                    >
                        <select
                            value={form.entity_type}
                            onChange={(e) =>
                                setForm((p) => ({
                                    ...p,
                                    entity_type: e.target.value as EntityType,
                                }))
                            }
                            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#004C8F]/10 focus:border-[#004C8F]/40 transition text-gray-800"
                        >
                            {ENTITY_TYPES.map((t) => (
                                <option key={t} value={t}>
                                    {ENTITY_META[t].label}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field
                        label="Status Code *"
                        hint="A short unique identifier. Use ALL_CAPS with underscores (e.g. ON_LEAVE). Cannot be changed after creation."
                    >
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
                            className="border-gray-200 focus-visible:ring-0 focus-visible:border-[#004C8F]"
                        />
                        <p className="text-xs text-gray-400 mt-1.5">
                            ⚠ This code is permanent and used by the system internally.
                            Choose carefully.
                        </p>
                    </Field>

                    <Field
                        label="Display Name *"
                        hint="The human-readable name shown to employees and managers in the app."
                    >
                        <Input
                            value={form.status_name}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, status_name: e.target.value }))
                            }
                            placeholder="e.g. On Leave"
                            maxLength={100}
                            className="border-gray-200 focus-visible:ring-0 focus-visible:border-[#004C8F]"
                        />
                    </Field>

                    <Field
                        label="Description"
                        hint="Optional. Helps admins understand when to apply this status."
                    >
                        <Textarea
                            value={form.description}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, description: e.target.value }))
                            }
                            className="resize-none border-gray-200 focus-visible:ring-0 focus-visible:border-[#004C8F]"
                            rows={2}
                            placeholder="e.g. Employee is temporarily on approved leave."
                        />
                    </Field>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={saving}
                        className="border-gray-200 text-xs font-semibold"
                    >
                        Cancel
                    </Button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ background: "#E31837" }}
                    >
                        {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Plus className="w-4 h-4" />
                        )}
                        {saving ? "Creating…" : "Create Status"}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
