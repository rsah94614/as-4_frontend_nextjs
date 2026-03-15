"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
// 1. Swap fetchWithAuth for your proxy-enabled client factory
import { createAuthenticatedClient } from "@/lib/api-utils";
import { Category } from "@/types/reward-types";

// 2. Instantiate the proxy client right here (or import it if you have it exported globally)
const rewardsClient = createAuthenticatedClient("/api/proxy/rewards");

export type CategoryFilter = "all" | "active" | "inactive";

export function useRewardCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [filterState, setFilterState] = useState<CategoryFilter>("all");

    // Modal states
    const [modal, setModal] = useState<null | "create" | "edit">(null);
    const [selected, setSelected] = useState<Category | undefined>();

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // 3. Make the call using relative paths! No more double-proxy or CORS issues.
            const res = await rewardsClient.get(`/categories?active_only=false`);
            
            // Axios automatically resolves JSON into the `.data` property
            setCategories(res.data);
            
        } catch (e: unknown) {
            // Type assertion for Axios errors to pull out clean backend error messages
            const err = e as { response?: { data?: { detail?: string } }, message?: string };
            setError(err.response?.data?.detail || err.message || "Failed to load categories.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const filtered = useMemo(() => {
        return categories
            .filter(c => {
                if (filterState === "active") return c.is_active;
                if (filterState === "inactive") return !c.is_active;
                return true;
            })
            .filter(c =>
                c.category_name.toLowerCase().includes(search.toLowerCase()) ||
                c.category_code.toLowerCase().includes(search.toLowerCase())
            );
    }, [categories, search, filterState]);

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
        filterState,
        setFilterState,
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