
// Access is controlled by DevLoggerProvider (admin role check) and the page guard.
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
    hideNotifications: boolean;
    urlSearch: string;
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
/*  Noise patterns — URLs that are excluded when "Hide Noise" is on    */
/* ------------------------------------------------------------------ */

const NOISE_PATTERNS = [
    "/notifications/unread-count",
    "/notifications",
];

const isNoiseUrl = (url: string) =>
    NOISE_PATTERNS.some((pattern) => url.includes(pattern));

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


const MAX_LOGS = 500; // cap to prevent memory bloat

export const useLoggerStore = create<LoggerState>((set, get) => ({
    logs: [],
    filters: { method: "ALL", status: "ALL", hideNotifications: true, urlSearch: "" },

    addLog: (entry) => {
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
        return logs.filter((log) => {
            // Method filter
            if (!matchesMethodFilter(log, filters.method)) return false;
            // Status filter
            if (!matchesStatusFilter(log, filters.status)) return false;
            // Hide notification noise
            if (filters.hideNotifications && isNoiseUrl(log.url)) return false;
            // URL search
            if (filters.urlSearch && !log.url.toLowerCase().includes(filters.urlSearch.toLowerCase())) return false;
            return true;
        });
    },
}));
