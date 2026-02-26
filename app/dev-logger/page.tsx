"use client";

import { useState } from "react";
import SuperdevGuard from "@/components/features/SuperdevGuard";
import {
    useLoggerStore,
    type LogEntry,
    type MethodFilter,
    type StatusFilter,
} from "@/lib/logger-store";
import {
    generateCurl,
    maskHeaders,
    prettifyJson,
    formatDuration,
} from "@/lib/logger-utils";
import {
    Trash2,
    ChevronDown,
    ChevronUp,
    Copy,
    Check,
    Terminal,
    AlertTriangle,
    Clock,
    ArrowUpDown,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const METHOD_FILTERS: MethodFilter[] = [
    "ALL",
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
];
const STATUS_FILTERS: StatusFilter[] = ["ALL", "2xx", "4xx", "5xx"];

const METHOD_COLORS: Record<string, string> = {
    GET: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    POST: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    PUT: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    DELETE: "bg-red-500/20 text-red-400 border-red-500/30",
    PATCH: "bg-violet-500/20 text-violet-400 border-violet-500/30",
};

const statusColor = (status: number | null) => {
    if (status === null) return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    if (status >= 200 && status < 300)
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    if (status >= 400 && status < 500)
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    if (status >= 500)
        return "bg-red-500/20 text-red-400 border-red-500/30";
    return "bg-gray-500/20 text-gray-400 border-gray-500/30";
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function JsonBlock({ label, data }: { label: string; data: unknown }) {
    if (data === null || data === undefined) return null;
    const json = prettifyJson(data);
    if (json === "null" || json === "{}" || json === "[]") return null;

    return (
        <div className="mt-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                {label}
            </p>
            <pre className="bg-gray-950 rounded-lg p-3 text-xs text-gray-300 overflow-x-auto max-h-64 overflow-y-auto leading-relaxed font-mono border border-gray-800">
                {json}
            </pre>
        </div>
    );
}

function CopyButton({ text, label }: { text: string; label: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* clipboard not available */
        }
    };

    return (
        <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors border border-gray-700"
        >
            {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
                <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? "Copied!" : label}
        </button>
    );
}

/* ------------------------------------------------------------------ */
/*  Log Card                                                           */
/* ------------------------------------------------------------------ */

function LogCard({ log }: { log: LogEntry }) {
    const [expanded, setExpanded] = useState(false);
    const maskedHeaders = maskHeaders(log.requestHeaders);
    const curl = generateCurl(log);

    const urlPath = (() => {
        try {
            const u = new URL(log.url);
            return u.pathname + u.search;
        } catch {
            return log.url;
        }
    })();

    const time = new Date(log.timestamp).toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    return (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden transition-all hover:border-gray-700">
            {/* Summary row */}
            <button
                onClick={() => setExpanded((e) => !e)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left group"
            >
                {/* Method badge */}
                <span
                    className={`shrink-0 px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wider border ${METHOD_COLORS[log.method] ?? "bg-gray-700 text-gray-300 border-gray-600"
                        }`}
                >
                    {log.method}
                </span>

                {/* Status */}
                <span
                    className={`shrink-0 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${statusColor(
                        log.status
                    )}`}
                >
                    {log.status ?? "ERR"}
                </span>

                {/* URL */}
                <span className="flex-1 truncate text-sm text-gray-300 font-mono">
                    {urlPath}
                </span>

                {/* Duration */}
                <span className="shrink-0 flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDuration(log.duration)}
                </span>

                {/* Timestamp */}
                <span className="shrink-0 text-xs text-gray-600 hidden sm:block">
                    {time}
                </span>

                {/* Chevron */}
                {expanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500 shrink-0 group-hover:text-gray-400" />
                )}
            </button>

            {/* Expanded detail */}
            {expanded && (
                <div className="border-t border-gray-800 px-4 py-4 space-y-4">
                    {/* Full URL + Timestamp */}
                    <div className="flex flex-wrap items-start gap-x-4 gap-y-1">
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                Full URL
                            </p>
                            <p className="text-sm text-gray-300 font-mono break-all">
                                {log.url}
                            </p>
                        </div>
                        <div className="shrink-0">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                Timestamp
                            </p>
                            <p className="text-sm text-gray-300">
                                {new Date(log.timestamp).toLocaleString()}
                            </p>
                        </div>
                        <div className="shrink-0">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                Duration
                            </p>
                            <p className="text-sm text-gray-300">
                                {formatDuration(log.duration)}
                            </p>
                        </div>
                    </div>

                    {/* Error */}
                    {log.error && (
                        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                                <p className="text-sm text-red-300 font-medium">{log.error}</p>
                                {log.errorStack && (
                                    <pre className="text-xs text-red-400/70 mt-1.5 whitespace-pre-wrap break-all">
                                        {log.errorStack}
                                    </pre>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Request */}
                    <div>
                        <p className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-1">
                            Request
                        </p>
                        <JsonBlock label="Headers" data={maskedHeaders} />
                        <JsonBlock label="Body" data={log.requestBody} />
                        <JsonBlock label="Params" data={log.requestParams} />
                    </div>

                    {/* Response */}
                    <div>
                        <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
                            Response
                        </p>
                        <JsonBlock label="Headers" data={log.responseHeaders} />
                        <JsonBlock label="Data" data={log.responseData} />
                    </div>

                    {/* cURL */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Terminal className="w-3.5 h-3.5" />
                                cURL
                            </p>
                            <CopyButton text={curl} label="Copy cURL" />
                        </div>
                        <pre className="bg-gray-950 rounded-lg p-3 text-xs text-emerald-300 overflow-x-auto max-h-40 overflow-y-auto font-mono border border-gray-800">
                            {curl}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function DevLoggerPage() {
    return (
        <SuperdevGuard>
            <DevLoggerContent />
        </SuperdevGuard>
    );
}

function DevLoggerContent() {
    const logs = useLoggerStore((s) => s.logs);
    const filters = useLoggerStore((s) => s.filters);
    const setFilter = useLoggerStore((s) => s.setFilter);
    const clearLogs = useLoggerStore((s) => s.clearLogs);
    const getFilteredLogs = useLoggerStore((s) => s.getFilteredLogs);

    const filteredLogs = getFilteredLogs();

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                            <Terminal className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white tracking-tight">
                                Developer Logger
                            </h1>
                            <p className="text-xs text-gray-500">SUPER_DEV internal tool</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Log count */}
                        <span className="px-2.5 py-1 rounded-full bg-gray-800 text-xs font-medium text-gray-400 border border-gray-700">
                            {filteredLogs.length}
                            <span className="text-gray-600">
                                {" "}
                                / {logs.length} logs
                            </span>
                        </span>

                        {/* Clear */}
                        <button
                            onClick={clearLogs}
                            disabled={logs.length === 0}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Clear All
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                    {/* Method filter */}
                    <div className="flex items-center gap-1.5">
                        <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-xs text-gray-500 font-medium mr-1">
                            Method
                        </span>
                        {METHOD_FILTERS.map((m) => (
                            <button
                                key={m}
                                onClick={() => setFilter({ method: m })}
                                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors border ${filters.method === m
                                    ? "bg-violet-500/20 text-violet-300 border-violet-500/40"
                                    : "bg-gray-900 text-gray-500 border-gray-800 hover:text-gray-300 hover:border-gray-700"
                                    }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>

                    {/* Status filter */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-500 font-medium mr-1">
                            Status
                        </span>
                        {STATUS_FILTERS.map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilter({ status: s })}
                                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors border ${filters.status === s
                                    ? "bg-violet-500/20 text-violet-300 border-violet-500/40"
                                    : "bg-gray-900 text-gray-500 border-gray-800 hover:text-gray-300 hover:border-gray-700"
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Log list */}
                {filteredLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-600">
                        <Terminal className="w-12 h-12 mb-4 opacity-30" />
                        <p className="text-sm font-medium">No API logs yet</p>
                        <p className="text-xs mt-1 text-gray-700">
                            Make some API calls and they will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredLogs.map((log) => (
                            <LogCard key={log.id} log={log} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
