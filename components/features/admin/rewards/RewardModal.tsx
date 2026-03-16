"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Save, Package, CheckCircle2 } from "lucide-react";
import { createAuthenticatedClient } from "@/lib/api-utils";

const rewardsApiClient = createAuthenticatedClient("/api/proxy/rewards");
import { extractErrorMessage } from "@/lib/error-utils";
import { Category, RewardItem } from "@/types/reward-types";
import { RewardField } from "./UIHelpers";
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


interface RewardModalProps {
    item?: RewardItem;
    categories: Category[];
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

export function RewardModal({ item, categories, isOpen, onClose, onSave }: RewardModalProps) {
    const isEdit = !!item;
    const [form, setForm] = useState({
        reward_name: item?.reward_name ?? "",
        reward_code: item?.reward_code ?? "",
        description: item?.description ?? "",
        category_id: item?.category?.category_id ?? "",
        default_points: item?.default_points ?? 100,
        min_points: item?.min_points ?? 50,
        max_points: item?.max_points ?? 500,
        available_stock: item?.available_stock ?? 0,
        is_active: item?.is_active ?? true,
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sync form state when item or isOpen changes
    useEffect(() => {
        if (isOpen) {
            setForm({
                reward_name: item?.reward_name ?? "",
                reward_code: item?.reward_code ?? "",
                description: item?.description ?? "",
                category_id: item?.category?.category_id ?? "",
                default_points: item?.default_points ?? 100,
                min_points: item?.min_points ?? 50,
                max_points: item?.max_points ?? 500,
                available_stock: item?.available_stock ?? 0,
                is_active: item?.is_active ?? true,
            });
            setError(null);
        }
    }, [item, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const body = isEdit
                ? {
                    reward_name: form.reward_name,
                    description: form.description,
                    default_points: form.default_points,
                    min_points: form.default_points,
                    max_points: form.default_points,
                    is_active: form.is_active,
                }
                : {
                    reward_name: form.reward_name,
                    reward_code: form.reward_code,
                    description: form.description,
                    category_id: form.category_id,
                    default_points: form.default_points,
                    min_points: form.default_points,
                    max_points: form.default_points,
                    available_stock: form.available_stock,
                };

            if (isEdit) {
                await rewardsApiClient.patch(`/catalog/${item!.catalog_id}`, body);
            } else {
                await rewardsApiClient.post(`/catalog`, body);
            }
            onSave();
        } catch (e: unknown) {
            setError(extractErrorMessage(e, "Request failed"));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="max-w-lg p-0 border-none bg-white rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                <DialogHeader className="flex flex-row items-center justify-between px-8 py-6 border-b border-slate-50 bg-slate-50/50 shrink-0">
                    <div className="flex items-center gap-3 text-left">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEdit ? "bg-blue-100 text-[#004C8F]" : "bg-green-100 text-green-600"} shadow-inner`}>
                            <Package className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-semibold text-slate-800 tracking-tight leading-none mb-1">
                                {isEdit ? "Update Reward" : "Create Reward"}
                            </DialogTitle>
                            <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                                REWARD CATALOG
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6 overflow-y-auto flex-1">
                    {!isEdit && (
                        <>
                            <RewardField label="REWARD CODE">
                                <Input
                                    className="w-full h-12 px-5 rounded-2xl border-2 border-slate-100 text-sm font-semibold text-black focus-visible:ring-0 focus-visible:border-[#004C8F] bg-white placeholder:text-slate-300 transition-all uppercase"
                                    value={form.reward_code}
                                    onChange={(e) => setForm({ ...form, reward_code: e.target.value.toUpperCase() })}
                                    placeholder="e.g. REW-AMZ-50"
                                    required
                                />
                            </RewardField>

                            <RewardField label="CATEGORY">
                                <Select
                                    value={form.category_id}
                                    onValueChange={(val) => setForm({ ...form, category_id: val })}
                                >
                                    <SelectTrigger className="w-full h-12 px-5 rounded-xl border-2 border-slate-100 text-sm font-semibold text-black focus-visible:ring-0 focus-visible:border-[#004C8F] bg-white">
                                        <SelectValue placeholder="Select category…" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {categories.filter((c) => c.is_active).map((c) => (
                                            <SelectItem key={c.category_id} value={c.category_id} className="font-semibold">
                                                {c.category_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </RewardField>
                        </>
                    )}

                    <RewardField label="REWARD NAME">
                        <Input
                            className="w-full h-12 px-5 rounded-xl border-2 border-slate-100 text-sm font-semibold text-black focus-visible:ring-0 focus-visible:border-[#004C8F] bg-white placeholder:text-slate-300 transition-all"
                            value={form.reward_name}
                            onChange={(e) => setForm({ ...form, reward_name: e.target.value })}
                            placeholder="e.g. Amazon Gift Card $50"
                            required
                        />
                    </RewardField>

                    <RewardField label="DESCRIPTION">
                        <Textarea
                            className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-100 text-sm font-semibold text-black focus-visible:ring-0 focus-visible:border-[#004C8F] bg-white placeholder:text-slate-300 transition-all min-h-[100px] resize-none"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Optional description…"
                        />
                    </RewardField>

                    <div className="max-w-xs">
                        <RewardField label="POINTS">
                            <Input
                                type="number"
                                className="w-full h-12 px-5 rounded-2xl border-2 border-slate-100 text-sm font-semibold text-black focus-visible:ring-0 focus-visible:border-[#004C8F] bg-white transition-all"
                                value={form.default_points}
                                onChange={(e) => setForm({ 
                                    ...form, 
                                    default_points: Number(e.target.value),
                                    min_points: Number(e.target.value),
                                    max_points: Number(e.target.value)
                                })}
                            />
                        </RewardField>
                    </div>

                    {!isEdit && (
                        <RewardField label="INITIAL STOCK">
                            <Input
                                type="number"
                                className="w-full h-12 px-5 rounded-2xl border-2 border-slate-100 text-sm font-semibold text-black focus-visible:ring-0 focus-visible:border-[#004C8F] bg-white transition-all"
                                value={form.available_stock}
                                min={0}
                                onChange={(e) => setForm({ ...form, available_stock: Number(e.target.value) })}
                            />
                        </RewardField>
                    )}

                    {isEdit && (
                        <RewardField label="REWARD STATUS">
                            <label className="flex items-center gap-4 cursor-pointer select-none bg-slate-50 p-4 rounded-xl border border-slate-100 group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={form.is_active}
                                        onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                        className="peer h-6 w-11 cursor-pointer appearance-none rounded-full bg-slate-300 transition-all focus:outline-none checked:bg-[#004C8F]"
                                    />
                                    <div className="absolute left-1 h-4 w-4 transform rounded-full bg-white transition-transform peer-checked:translate-x-5" />
                                </div>
                                <span className={`text-sm font-semibold transition-colors ${form.is_active ? "text-[#004C8F]" : "text-slate-400"}`}>
                                    {form.is_active ? "REWARD IS ACTIVE" : "REWARD IS HIDDEN"}
                                </span>
                                {form.is_active && (
                                    <CheckCircle2 className="w-5 h-5 text-[#004C8F] ml-auto animate-in zoom-in" />
                                )}
                            </label>
                        </RewardField>
                    )}

                    {error && (
                        <div className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl text-red-600 text-[10px] font-semibold animate-in shake-in duration-300 uppercase tracking-wider">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="flex gap-4 pt-4 border-t border-slate-50">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
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
                                    {isEdit ? "Update" : "Create"}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
