"use client";

import React, { useState } from "react";
import { Loader2, Archive } from "lucide-react";
import { createAuthenticatedClient } from "@/lib/api-utils";

const rewardsApiClient = createAuthenticatedClient("/api/proxy/rewards");
import { extractErrorMessage } from "@/lib/error-utils";
import { RewardItem } from "@/types/reward-types";
import { RewardField } from "./UIHelpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";


interface RestockModalProps {
    item: RewardItem;
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

export function RestockModal({ item, isOpen, onClose, onSave }: RestockModalProps) {
    const [amount, setAmount] = useState(10);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await rewardsApiClient.patch(`/catalog/${item.catalog_id}/stock`, { amount });
            onSave();
        } catch (e: unknown) {
            setError(extractErrorMessage(e, "Request failed"));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
            <DialogContent 
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="max-w-md p-0 border-none bg-white rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
            >
                <DialogHeader className="flex flex-row items-center justify-between px-8 py-6 border-b border-slate-50 bg-slate-50/50">
                    <div className="flex items-center gap-3 text-left">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-100 text-[#004C8F] shadow-inner">
                            <Archive className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-semibold text-slate-800 tracking-tight leading-none mb-1">
                                Add Stock
                            </DialogTitle>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                                INVENTORY MANAGEMENT
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
                    <p className="text-sm font-bold text-slate-500 leading-relaxed">
                        Restocking{" "}
                        <strong className="text-slate-800">{item.reward_name}</strong>.{" "}
                        Current inventory:{" "}
                        <strong className="text-[#004C8F]">{item.available_stock}</strong> units.
                    </p>

                    <RewardField label="UNITS TO ADD">
                        <Input
                            type="number"
                            className="w-full h-12 px-5 rounded-xl border-2 border-slate-100 text-sm font-bold text-black focus-visible:ring-blue-50 focus-visible:border-blue-300 bg-white transition-all"
                            value={amount}
                            min={1}
                            onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
                        />
                    </RewardField>

                    <Card className="flex items-center justify-between p-5 rounded-xl border-2 border-slate-100 bg-slate-50">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            New stock level
                        </span>
                        <span className="text-3xl font-bold text-[#004C8F] tracking-tight">
                            {item.available_stock + amount}
                        </span>
                    </Card>

                    {error && (
                        <div className="p-4 bg-red-50 border-2 border-red-100 rounded-xl text-red-600 text-[10px] font-semibold animate-in shake-in duration-300 uppercase tracking-wider">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="flex gap-4 pt-4 border-t border-slate-50">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="flex-1 h-14 rounded-2xl text-xs font-semibold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all tracking-wider uppercase"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={saving}
                            className="flex-1 h-14 rounded-2xl text-xs font-semibold text-white bg-black hover:bg-slate-800 transition-all tracking-wider uppercase flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none"
                        >
                            {saving ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Archive className="w-4 h-4" />
                                    Add Stock
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
