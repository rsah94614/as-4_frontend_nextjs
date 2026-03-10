"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchWithAuth } from "@/services/auth-service";
import { Category } from "@/types/reward-types";

const API = process.env.NEXT_PUBLIC_REWARDS_API_URL ?? "http://localhost:8006";

export function useRewardCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [activeOnly, setActiveOnly] = useState(false);

    // Modal states
    const [modal, setModal] = useState<null | "create" | "edit">(null);
    const [selected, setSelected] = useState<Category | undefined>();

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const r = await fetchWithAuth(`${API}/v1/rewards/categories?active_only=${activeOnly}`);
            if (r.ok) {
                setCategories(await r.json());
            } else {
                setError("Failed to load categories. Check your connection or permissions.");
            }
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    }, [activeOnly]);

    useEffect(() => {
        load();
    }, [load]);

    const filtered = useMemo(() => {
        return categories.filter(c =>
            c.category_name.toLowerCase().includes(search.toLowerCase()) ||
            c.category_code.toLowerCase().includes(search.toLowerCase())
        );
    }, [categories, search]);

    const activeCount = useMemo(() => categories.filter(c => c.is_active).length, [categories]);

    const openCreate = () => setModal("create");
    const openEdit = (cat: Category) => {
        setSelected(cat);
        setModal("edit");
    };
    const closeModal = () => {
        setModal(null);
        setSelected(undefined);
    };

    const handleSaved = () => {
        closeModal();
        load();
    };

    return {
        categories,
        filtered,
        loading,
        error,
        search,
        setSearch,
        activeOnly,
        setActiveOnly,
        activeCount,
        modal,
        selected,
        openCreate,
        openEdit,
        closeModal,
        handleSaved,
        refresh: load
    };
}
