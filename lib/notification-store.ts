// lib/notification-store.ts
//
// Zustand store for notification state.
//
// WHY THIS FILE MANAGES AUTH HEADERS
// ────────────────────────────────────
// Tokens are stored in localStorage by auth-service.ts (STORAGE_KEYS.ACCESS_TOKEN).
// The Next.js proxy at /api/proxy/[...path]/route.ts forwards the token it receives
// in the Authorization header to the upstream microservice. The proxy has no access
// to localStorage — it can only see what the browser sends as HTTP headers.
//
// axiosClient handles this automatically via its request interceptor.
// This store uses raw fetch(), so it must read the token and attach it manually
// on every request using getAuthHeaders() below.
//
// BUG FIX: 401 RETRY AFTER SILENT REFRESH
// ─────────────────────────────────────────
// AuthProvider silently refreshes the access token when it expires. The 30-second
// background poll fires independently of that refresh cycle. If the poll fires with
// an expired token it receives a 401, logs a warning, and the badge goes stale for
// up to 30 seconds — harmless on its own, but the logs were flooded with hundreds
// of 401 warnings per session.
//
// Fix: apiFetch now detects a 401 response, calls auth.refreshAccessToken() once,
// and retries the original request with the new token. If the refresh also fails
// (truly unauthenticated), the error propagates normally. This eliminates the 401
// flood while keeping the existing "silently ignore poll failures" behaviour for
// all other error codes.

import { create } from "zustand";
import { auth } from "@/services/auth-service";
import { extractErrorMessage } from "@/lib/error-utils";
import type { Notification } from "@/types/notification-types";

// ─── Auth header helper ───────────────────────────────────────────────────────

/**
 * Read the JWT from localStorage (where auth-service.ts stores it) and return
 * a headers object ready to spread into any fetch() call.
 *
 * Must be called inside a function (not at module init) because localStorage
 * is only available in the browser, not during SSR.
 */
function getAuthHeaders(): Record<string, string> {
    if (typeof window === "undefined") return {};
    const token = localStorage.getItem("access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Store types ──────────────────────────────────────────────────────────────

interface NotificationState {
    notifications: Notification[];
    unreadCount:   number;
    loading:       boolean;
    error:         string | null;

    fetchNotifications: (limit?: number) => Promise<void>;
    fetchUnreadCount:   () => Promise<void>;
    markOneAsRead:      (id: string) => Promise<void>;
    markAllAsRead:      () => Promise<void>;
}

// ─── Internal fetch wrapper ───────────────────────────────────────────────────

/**
 * Fetch wrapper with one-shot 401 → refresh → retry behaviour.
 *
 * Flow:
 *   1. Make the request with the current token from localStorage.
 *   2. If the response is 401, call auth.refreshAccessToken() once.
 *      - If refresh succeeds, retry the original request with the new token.
 *      - If refresh fails, throw so callers can handle it (e.g. redirect to /login).
 *   3. For any non-401 error, throw immediately.
 *
 * This eliminates the token-expiry 401 flood in the server logs that occurred
 * when the 30-second poll timer fired with an expired token just before
 * AuthProvider completed a silent refresh.
 */
async function apiFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
    const makeHeaders = () => ({
        "Content-Type": "application/json",
        "Accept":       "application/json",
        ...getAuthHeaders(),
        ...(init.headers as Record<string, string> | undefined),
    });

    let res = await fetch(url, { ...init, headers: makeHeaders() });

    // ── One-shot 401 recovery ─────────────────────────────────────────────────
    if (res.status === 401) {
        // Token may have expired between the last AuthProvider refresh and this
        // request. Attempt a silent refresh, then retry once with the new token.
        const refreshed = await auth.refreshAccessToken().catch(() => false);
        if (!refreshed) {
            // Truly unauthenticated — let the caller decide what to do.
            // AuthProvider's interceptor will redirect to /login on its own cycle.
            const body = await res.json().catch(() => ({}));
            throw new Error(body?.detail ?? "Unauthorized");
        }
        // Retry with the freshly-written token now in localStorage.
        res = await fetch(url, { ...init, headers: makeHeaders() });
    }

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(extractErrorMessage(body, `Request failed (${res.status})`));
    }

    return res.json() as Promise<T>;
}

// ─── Store ────────────────────────────────────────────────────────────────────
//
// All URLs are routed through /api/proxy/employees/notifications/...
// The proxy strips "employees", looks up NEXT_PUBLIC_EMPLOYEE_API_URL, and
// forwards to: EMPLOYEE_API_URL/v1/employees/notifications/...

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    unreadCount:   0,
    loading:       false,
    error:         null,

    // ── GET /api/proxy/employees/notifications?limit=N&unread_only=false ──────
    fetchNotifications: async (limit = 50) => {
        set({ loading: true, error: null });
        try {
            const url = new URL("/api/proxy/employees/notifications", window.location.origin);
            url.searchParams.set("limit", String(limit));
            url.searchParams.set("unread_only", "false");

            const data = await apiFetch<{ notifications: Notification[]; total: number }>(
                url.toString()
            );

            set({
                notifications: data.notifications,
                // Derive the unread count from the list so it stays in sync
                unreadCount:   data.notifications.filter(n => !n.is_read).length,
                loading:       false,
            });
        } catch (err) {
            set({
                loading: false,
                error:   extractErrorMessage(err, "Failed to load notifications"),
            });
        }
    },

    // ── GET /api/proxy/employees/notifications/unread-count ───────────────────
    fetchUnreadCount: async () => {
        try {
            const data = await apiFetch<{ unread_count: number }>(
                "/api/proxy/employees/notifications/unread-count"
            );
            set({ unreadCount: data.unread_count });
        } catch {
            // Silently ignore background poll failures — a stale badge count is
            // far less disruptive than an error banner on a 30-second tick.
            // 401s are handled inside apiFetch (refresh → retry) before reaching here.
        }
    },

    // ── PUT /api/proxy/employees/notifications/{id}/read ──────────────────────
    markOneAsRead: async (id: string) => {
        try {
            const updated = await apiFetch<Notification>(
                `/api/proxy/employees/notifications/${id}/read`,
                { method: "PUT" }
            );
            set(state => ({
                notifications: state.notifications.map(n =>
                    n.notification_id === id ? { ...n, ...updated } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1),
            }));
        } catch (err) {
            set({ error: extractErrorMessage(err, "Failed to mark as read") });
        }
    },

    // ── PUT /api/proxy/employees/notifications/read-all ───────────────────────
    markAllAsRead: async () => {
        try {
            await apiFetch<{ marked_read: number }>(
                "/api/proxy/employees/notifications/read-all",
                { method: "PUT" }
            );
            set(state => ({
                notifications: state.notifications.map(n => ({ ...n, is_read: true })),
                unreadCount:   0,
            }));
        } catch (err) {
            set({ error: extractErrorMessage(err, "Failed to mark all as read") });
        }
    },
}));