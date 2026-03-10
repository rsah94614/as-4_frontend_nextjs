"use client";

import { useState, useEffect, useCallback } from "react";
import orgApiClient from "@/services/org-api-client";
import { Multiplier, Quarter } from "@/types/multiplier-types";

export function useMultipliers(filterQuarter: Quarter | 0) {
    const [multipliers, setMultipliers] = useState<Multiplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMultipliers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params: Record<string, string | number> = {};
            if (filterQuarter) params.quarter = filterQuarter;
            const res = await orgApiClient.get<Multiplier[]>("/seasonal-multipliers", { params });
            setMultipliers(Array.isArray(res.data) ? res.data : []);
        } catch (e: unknown) {
            const status = (e as { response?: { status?: number } })?.response?.status;
            setError(status === 401 ? "Your session expired. Please log in again." : "Could not load multipliers.");
        } finally {
            setLoading(false);
        }
    }, [filterQuarter]);

    useEffect(() => {
        fetchMultipliers();
    }, [fetchMultipliers]);

    const createMultiplier = async (payload: Record<string, unknown>) => {
        await orgApiClient.post("/seasonal-multipliers", payload);
        await fetchMultipliers();
    };

    const updateMultiplier = async (id: string, payload: Record<string, unknown>) => {
        await orgApiClient.put(`/seasonal-multipliers/${id}`, payload);
        await fetchMultipliers();
    };

    const deleteMultiplier = async (id: string) => {
        await orgApiClient.delete(`/seasonal-multipliers/${id}`);
        await fetchMultipliers();
    };

    return {
        multipliers,
        loading,
        error,
        refresh: fetchMultipliers,
        createMultiplier,
        updateMultiplier,
        deleteMultiplier,
    };
}
