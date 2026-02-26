// lib/logger-utils.ts — Utility functions for the Developer Logger

import type { LogEntry } from "./logger-store";

/* ------------------------------------------------------------------ */
/*  Generate a cURL command from a log entry                           */
/* ------------------------------------------------------------------ */

export function generateCurl(log: LogEntry): string {
    const parts: string[] = ["curl"];

    // Method
    if (log.method.toUpperCase() !== "GET") {
        parts.push(`-X ${log.method.toUpperCase()}`);
    }

    // URL
    parts.push(`'${log.url}'`);

    // Headers (masked)
    const masked = maskHeaders(log.requestHeaders);
    for (const [key, value] of Object.entries(masked)) {
        parts.push(`-H '${key}: ${value}'`);
    }

    // Body
    if (log.requestBody && typeof log.requestBody === "object") {
        const body = JSON.stringify(log.requestBody);
        parts.push(`-d '${body}'`);
    } else if (log.requestBody) {
        parts.push(`-d '${String(log.requestBody)}'`);
    }

    return parts.join(" \\\n  ");
}

/* ------------------------------------------------------------------ */
/*  Mask sensitive headers (Authorization tokens)                      */
/* ------------------------------------------------------------------ */

export function maskHeaders(
    headers: Record<string, string>
): Record<string, string> {
    if (!headers || typeof headers !== "object") return {};

    const masked: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
        if (key.toLowerCase() === "authorization") {
            // Keep the scheme (Bearer, Basic, etc.) but mask the token
            const parts = value.split(" ");
            if (parts.length >= 2) {
                masked[key] = `${parts[0]} ***MASKED***`;
            } else {
                masked[key] = "***MASKED***";
            }
        } else {
            masked[key] = value;
        }
    }
    return masked;
}

/* ------------------------------------------------------------------ */
/*  Pretty-print JSON with error handling                              */
/* ------------------------------------------------------------------ */

export function prettifyJson(obj: unknown): string {
    if (obj === null || obj === undefined) return "null";
    try {
        return JSON.stringify(obj, null, 2);
    } catch {
        return String(obj);
    }
}

/* ------------------------------------------------------------------ */
/*  Format a duration in milliseconds to a human-readable string       */
/* ------------------------------------------------------------------ */

export function formatDuration(ms: number | null): string {
    if (ms === null || ms === undefined) return "—";
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
}
