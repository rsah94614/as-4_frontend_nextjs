"use client";

import React, { useState } from "react";
import { Loader2, Archive } from "lucide-react";
import { fetchWithAuth } from "@/services/auth-service";
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

const API = process.env.NEXT_PUBLIC_REWARDS_API_URL ?? "http://localhost:8006";

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
            const r = await fetchWithAuth(`${API}/v1/rewards/catalog/${item.catalog_id}/stock`, {
                method: "PATCH",
                body: JSON.stringify({ amount }),
            });
            if (!r.ok) {
                const d = await r.json();
                throw new Error(d.detail ?? "Request failed");
            }
            onSave();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Request failed");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="max-w-md p-0 border-none bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <DialogHeader className="flex flex-row items-center justify-between px-8 py-6 border-b border-slate-50 bg-slate-50/50">
                    <div className="flex items-center gap-3 text-left">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-amber-100 text-amber-600 shadow-inner">
                            <Archive className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">
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
                        <strong className="text-purple-700">{item.available_stock}</strong> units.
                    </p>

                    <RewardField label="UNITS TO ADD">
                        <Input
                            type="number"
                            className="w-full h-12 px-5 rounded-2xl border-2 border-slate-100 text-sm font-bold text-black focus-visible:ring-purple-50 focus-visible:border-purple-300 bg-white transition-all"
                            value={amount}
                            min={1}
                            onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
                        />
                    </RewardField>

                    <Card className="flex items-center justify-between p-5 rounded-2xl border-2 border-slate-100 bg-slate-50">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                            New stock level
                        </span>
                        <span className="text-3xl font-black text-purple-700 tracking-tight">
                            {item.available_stock + amount}
                        </span>
                    </Card>

                    {error && (
                        <div className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl text-red-600 text-[10px] font-black animate-in shake-in duration-300 uppercase tracking-widest">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="flex gap-4 pt-4 border-t border-slate-50">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="flex-1 h-14 rounded-2xl text-xs font-black text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all tracking-widest uppercase"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={saving}
                            className="flex-1 h-14 rounded-2xl text-xs font-black text-white bg-black hover:bg-slate-800 transition-all tracking-widest uppercase flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none"
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
