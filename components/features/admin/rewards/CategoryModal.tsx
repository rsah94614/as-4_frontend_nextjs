"use client";

import React, { useState } from "react";
import { fetchWithAuth } from "@/services/auth-service";
import { Category, CreateCategoryPayload, UpdateCategoryPayload } from "@/types/reward-types";
import { RewardField } from "./UIHelpers";
import { Loader2, Save, Tag, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const API = process.env.NEXT_PUBLIC_REWARDS_API_URL ?? "http://localhost:8006";

interface CategoryModalProps {
    category?: Category;
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

export function CategoryModal({ category, isOpen, onClose, onSave }: CategoryModalProps) {
    const isEdit = !!category;
    const [form, setForm] = useState({
        category_name: category?.category_name ?? "",
        category_code: category?.category_code ?? "",
        description: category?.description ?? "",
        is_active: category?.is_active ?? true,
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const url = isEdit
                ? `${API}/v1/rewards/categories/${category!.category_id}`
                : `${API}/v1/rewards/categories`;
            const method = isEdit ? "PATCH" : "POST";
            const body = isEdit
                ? {
                    category_name: form.category_name,
                    description: form.description,
                    is_active: form.is_active,
                } as UpdateCategoryPayload
                : {
                    category_name: form.category_name,
                    category_code: form.category_code,
                    description: form.description,
                } as CreateCategoryPayload;

            const r = await fetchWithAuth(url, { method, body: JSON.stringify(body) });
            if (!r.ok) {
                const d = await r.json();
                throw new Error(
                    Array.isArray(d.detail)
                        ? d.detail.map((e: { msg?: string }) => e.msg).join(", ")
                        : d.detail ?? "Request failed"
                );
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
            <DialogContent className="max-w-lg p-0 border-none bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <DialogHeader className="flex flex-row items-center justify-between px-8 py-6 border-b border-slate-50 bg-slate-50/50">
                    <div className="flex items-center gap-3 text-left">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isEdit ? "bg-purple-100 text-purple-600" : "bg-green-100 text-green-600"} shadow-inner`}>
                            <Tag className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">
                                {isEdit ? "Update Category" : "Build Category"}
                            </DialogTitle>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                                REWARD MANAGEMENT SYSTEM
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
                    {!isEdit && (
                        <RewardField label="CATEGORY CODE">
                            <Input
                                className="w-full h-12 px-5 rounded-2xl border-2 border-slate-100 text-sm font-bold text-black focus-visible:ring-purple-50 focus-visible:border-purple-300 bg-white placeholder:text-slate-300 transition-all uppercase"
                                value={form.category_code}
                                onChange={(e) => setForm({ ...form, category_code: e.target.value.toUpperCase() })}
                                placeholder="e.g. CAT-GIFT"
                                required
                            />
                        </RewardField>
                    )}

                    <RewardField label="CATEGORY NAME">
                        <Input
                            className="w-full h-12 px-5 rounded-2xl border-2 border-slate-100 text-sm font-bold text-black focus-visible:ring-purple-50 focus-visible:border-purple-300 bg-white placeholder:text-slate-300 transition-all"
                            value={form.category_name}
                            onChange={(e) => setForm({ ...form, category_name: e.target.value })}
                            placeholder="e.g. Amazon Gift Cards"
                            required
                        />
                    </RewardField>

                    <RewardField label="DESCRIPTION">
                        <Textarea
                            className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 text-sm font-bold text-black focus-visible:ring-purple-50 focus-visible:border-purple-300 bg-white placeholder:text-slate-300 transition-all min-h-[120px] resize-none"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Tell us what this category covers..."
                        />
                    </RewardField>

                    {isEdit && (
                        <RewardField label="CATEGORY STATUS">
                            <label className="flex items-center gap-4 cursor-pointer select-none bg-slate-50 p-4 rounded-2xl border border-slate-100 group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={form.is_active}
                                        onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                        className="peer h-6 w-11 cursor-pointer appearance-none rounded-full bg-slate-300 transition-all focus:outline-none checked:bg-purple-600"
                                    />
                                    <div className="absolute left-1 h-4 w-4 transform rounded-full bg-white transition-transform peer-checked:translate-x-5" />
                                </div>
                                <span className={`text-sm font-bold transition-colors ${form.is_active ? "text-purple-700" : "text-slate-400"}`}>
                                    {form.is_active ? "CATEGORY IS ACTIVE" : "CATEGORY IS HIDDEN"}
                                </span>
                                {form.is_active && (
                                    <CheckCircle2 className="w-5 h-5 text-purple-600 ml-auto animate-in zoom-in" />
                                )}
                            </label>
                        </RewardField>
                    )}

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
