// lib/api-utils.ts
//
// Shared utilities used across service files.
// Centralises repeated patterns: Axios client creation, error extraction,
// input validation, auth guards, and file-upload categorisation.

import axios, { type AxiosInstance } from "axios";
import { auth } from "@/services/auth-service";
import { extractErrorMessage } from "@/lib/error-utils";

// ─── Axios Client Factory ─────────────────────────────────────────────────────

import { type InternalAxiosRequestConfig } from "axios";
import { useLoggerStore } from "@/lib/logger-store";

interface LoggerMeta {
    __loggerStartTime?: number;
}

/**
 * Creates an Axios instance with:
 *   • Content-Type: application/json
 *   • Request interceptor that attaches the Bearer token
 *   • Response interceptor that handles 401 → refresh → retry → redirect
 *   • Built-in DevLogger interceptors that log every request/response
 *
 * Every API-client file can now be a one-liner.
 */
export function createAuthenticatedClient(baseURL: string): AxiosInstance {
    const client = axios.create({
        baseURL,
        headers: { "Content-Type": "application/json" },
    });

    // ── Request: attach Bearer token ──────────────────────────────────────────
    client.interceptors.request.use(
        (config) => {
            const token = auth.getAccessToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // ── Response: handle 401 (token expiry) ───────────────────────────────────
    client.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    const refreshed = await auth.refreshAccessToken();
                    if (refreshed) {
                        const newToken = auth.getAccessToken();
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return client(originalRequest);
                    }
                } catch {
                    // fall through to redirect
                }

                auth.clearTokens();
                if (typeof window !== "undefined") window.location.href = "/login";
            }

            return Promise.reject(error);
        }
    );

    // ── DevLogger: log every request/response to the logger store ─────────────
    // Baked directly into every client — no separate provider needed.
    client.interceptors.request.use(
        (config: InternalAxiosRequestConfig & LoggerMeta) => {
            config.__loggerStartTime = Date.now();
            return config;
        },
        (error) => Promise.reject(error)
    );

    client.interceptors.response.use(
        (response) => {
            const config = response.config as InternalAxiosRequestConfig & LoggerMeta;
            const startTime = config.__loggerStartTime ?? Date.now();
            const duration = Date.now() - startTime;

            const cfgBaseURL = config.baseURL ?? "";
            const fullUrl = config.url?.startsWith("http")
                ? config.url
                : `${cfgBaseURL}${config.url ?? ""}`;

            useLoggerStore.getState().addLog({
                id: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                method: (config.method ?? "GET").toUpperCase(),
                url: fullUrl,
                requestHeaders: config.headers
                    ? Object.fromEntries(
                        Object.entries(config.headers).filter(
                            ([, v]) => typeof v === "string"
                        )
                    )
                    : {},
                requestBody: config.data ?? null,
                requestParams: config.params ?? {},
                status: response.status,
                responseData: response.data,
                responseHeaders: response.headers
                    ? Object.fromEntries(
                        Object.entries(response.headers).filter(
                            ([, v]) => typeof v === "string"
                        )
                    )
                    : {},
                duration,
                error: null,
                errorStack: null,
            });

            return response;
        },
        (error) => {
            const config = (error.config ?? {}) as InternalAxiosRequestConfig & LoggerMeta;
            const startTime = config.__loggerStartTime ?? Date.now();
            const duration = Date.now() - startTime;

            const cfgBaseURL = config.baseURL ?? "";
            const fullUrl = config.url?.startsWith("http")
                ? config.url
                : `${cfgBaseURL}${config.url ?? ""}`;

            useLoggerStore.getState().addLog({
                id: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                method: (config.method ?? "GET").toUpperCase(),
                url: fullUrl,
                requestHeaders: config.headers
                    ? Object.fromEntries(
                        Object.entries(config.headers).filter(
                            ([, v]) => typeof v === "string"
                        )
                    )
                    : {},
                requestBody: config.data ?? null,
                requestParams: config.params ?? {},
                status: error.response?.status ?? null,
                responseData: error.response?.data ?? null,
                responseHeaders: error.response?.headers
                    ? (Object.fromEntries(
                        Object.entries(error.response.headers).filter(
                            ([, v]) => typeof v === "string"
                        )
                    ) as Record<string, string>)
                    : {},
                duration,
                error: error.message ?? "Unknown error",
                errorStack: error.stack ?? null,
            });

            return Promise.reject(error);
        }
    );

    return client;
}


// ─── Error Extraction ─────────────────────────────────────────────────────────

/**
 * Extracts a human-readable message from an Axios error (or any unknown error).
 * Falls back to the provided `fallback` string.
 */
export function extractApiError(
    error: unknown,
    fallback = "Request failed"
): string {
    return extractErrorMessage(error, fallback);
}

// ─── Review Input Validation ──────────────────────────────────────────────────

/**
 * Validates rating + comment before sending to the backend.
 * Throws a descriptive Error on invalid input.
 */
export function validateReviewInput(rating: number, comment: string): void {
    if (rating < 1 || rating > 5)
        throw new Error("Rating must be between 1 and 5.");
    if (comment.trim().length < 10)
        throw new Error("Comment must be at least 10 characters.");
    if (comment.trim().length > 2000)
        throw new Error("Comment must not exceed 2000 characters.");
}

// ─── Auth Guard ───────────────────────────────────────────────────────────────

/**
 * Returns the current user's employee_id from localStorage.
 * Throws if not authenticated.
 */
export function requireAuthenticatedUserId(): string {
    const user = auth.getUser();
    if (!user?.employee_id) throw new Error("Authentication required.");
    return user.employee_id as string;
}

// ─── File Upload Categorisation ───────────────────────────────────────────────

/**
 * Given uploaded file results (each with a `kind` like "image"/"video" and a
 * `url`), returns the first image URL and first video URL found.
 */
export function categorizeFileUrls(
    uploads: { kind: string; url: string }[]
): { imageUrl?: string; videoUrl?: string } {
    let imageUrl: string | undefined;
    let videoUrl: string | undefined;

    for (const { kind, url } of uploads) {
        if (kind === "image" && !imageUrl) imageUrl = url;
        if (kind === "video" && !videoUrl) videoUrl = url;
    }

    return { imageUrl, videoUrl };
}
