// lib/logger-store.ts — SUPER_DEV-only API logger Zustand store
// This entire module is a no-op in production builds.

import { create } from "zustand";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface LogEntry {
    id: string;
    timestamp: string;
    method: string;
    url: string;
    requestHeaders: Record<string, string>;
    requestBody: unknown;
    requestParams: Record<string, string>;
    status: number | null;
    responseData: unknown;
    responseHeaders: Record<string, string>;
    duration: number | null;
    error: string | null;
    errorStack: string | null;
}

export type MethodFilter = "ALL" | "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
export type StatusFilter = "ALL" | "2xx" | "4xx" | "5xx";

interface LoggerFilters {
    method: MethodFilter;
    status: StatusFilter;
}

interface LoggerState {
    logs: LogEntry[];
    filters: LoggerFilters;
    addLog: (entry: LogEntry) => void;
    clearLogs: () => void;
    setFilter: (filters: Partial<LoggerFilters>) => void;
    getFilteredLogs: () => LogEntry[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const matchesMethodFilter = (log: LogEntry, filter: MethodFilter) =>
    filter === "ALL" || log.method.toUpperCase() === filter;

const matchesStatusFilter = (log: LogEntry, filter: StatusFilter) => {
    if (filter === "ALL") return true;
    if (log.status === null) return false;
    if (filter === "2xx") return log.status >= 200 && log.status < 300;
    if (filter === "4xx") return log.status >= 400 && log.status < 500;
    if (filter === "5xx") return log.status >= 500 && log.status < 600;
    return true;
};

/* ------------------------------------------------------------------ */
/*  Store (only meaningful in non-production)                          */
/* ------------------------------------------------------------------ */

const MAX_LOGS = 500; // cap to prevent memory bloat
const IS_DEV = process.env.NODE_ENV !== "production";

export const useLoggerStore = create<LoggerState>((set, get) => ({
    logs: [],
    filters: { method: "ALL", status: "ALL" },

    addLog: (entry) => {
        if (!IS_DEV) return; // no-op in production
        set((state) => ({
            logs: [entry, ...state.logs].slice(0, MAX_LOGS),
        }));
    },

    clearLogs: () => set({ logs: [] }),

    setFilter: (partial) =>
        set((state) => ({
            filters: { ...state.filters, ...partial },
        })),

    getFilteredLogs: () => {
        const { logs, filters } = get();
        return logs.filter(
            (log) =>
                matchesMethodFilter(log, filters.method) &&
                matchesStatusFilter(log, filters.status)
        );
    },
}));
