"use client";

import React, { useState, useRef } from "react";
import {
    X,
    FileSpreadsheet,
    Download,
    Upload,
    CheckCircle2,
    AlertCircle,
    Loader2,
} from "lucide-react";
import axiosClient from "@/services/api-client";
import { BulkImportResult } from "@/types/team-types";

const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:8001";

interface BulkImportModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export function BulkImportModal({ onClose, onSuccess }: BulkImportModalProps) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<BulkImportResult | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);

    function downloadTemplate() {
        const csv = [
            "username,email,password,designation_id,department_id,manager_id",
            "jdoe,jdoe@company.com,Password123,550e8400-e29b-41d4-a716-446655440001,550e8400-e29b-41d4-a716-446655440002,",
        ].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "bulk_import_template.csv";
        a.click();
        URL.revokeObjectURL(url);
    }

    function pickFile(f: File) {
        const name = f.name.toLowerCase();
        if (!name.endsWith(".csv") && !name.endsWith(".xlsx")) {
            setUploadError("Only .csv and .xlsx files are supported.");
            return;
        }
        setFile(f);
        setUploadError(null);
        setResult(null);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragOver(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) pickFile(dropped);
    }

    async function handleUpload() {
        if (!file) return;
        setUploading(true);
        setUploadError(null);
        setResult(null);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await axiosClient.post(
                `${AUTH_API}/v1/auth/bulk-import`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            const data = res.data;
            setResult(data as BulkImportResult);
            if (data.succeeded > 0) onSuccess();
        } catch (err: unknown) {
            const axiosErr = err as {
                response?: {
                    data?: { detail?: string | { msg?: string; loc?: string[] }[] };
                };
                message?: string;
            };
            const data = axiosErr.response?.data;
            const detail = data?.detail;
            if (Array.isArray(detail)) {
                setUploadError(
                    detail
                        .map((e: { msg?: string; loc?: string[] }) =>
                            [e.loc?.slice(1).join(" → "), e.msg].filter(Boolean).join(": ")
                        )
                        .join(" | ")
                );
            } else if (typeof detail === "string") {
                setUploadError(detail);
            } else {
                setUploadError(axiosErr.message || "Upload failed");
            }
        } finally {
            setUploading(false);
        }
    }

    function reset() {
        setFile(null);
        setResult(null);
        setUploadError(null);
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                            <FileSpreadsheet className="w-4 h-4 text-purple-700" />
                        </div>
                        <div>
                            <p className="font-bold text-black text-sm">Bulk Import Employees</p>
                            <p className="text-[11px] text-slate-400">
                                Upload a CSV or XLSX file
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    {/* Required columns + template download */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-black">Required columns</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                                username, email, password, designation_id, department_id
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">
                                optional: manager_id
                            </p>
                        </div>
                        <button
                            onClick={downloadTemplate}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:border-purple-300 hover:text-purple-700 transition flex-shrink-0"
                        >
                            <Download className="w-3 h-3" /> Template
                        </button>
                    </div>

                    {/* Drop zone — hidden once results are shown */}
                    {!result && (
                        <div
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDragOver(true);
                            }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            onClick={() => fileRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition ${dragOver
                                    ? "border-purple-400 bg-purple-50"
                                    : file
                                        ? "border-green-300 bg-green-50"
                                        : "border-slate-200 hover:border-purple-300 hover:bg-purple-50/40"
                                }`}
                        >
                            <input
                                ref={fileRef}
                                type="file"
                                accept=".csv,.xlsx"
                                className="hidden"
                                onChange={(e) =>
                                    e.target.files?.[0] && pickFile(e.target.files[0])
                                }
                            />
                            {file ? (
                                <>
                                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-black truncate max-w-[260px]">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {(file.size / 1024).toFixed(1)} KB · click to change
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                        <Upload className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-slate-600">
                                            Drop file here or click to browse
                                        </p>
                                        <p className="text-xs text-slate-400">.csv or .xlsx</p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Error banner */}
                    {uploadError && (
                        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-red-600">{uploadError}</p>
                        </div>
                    )}

                    {/* Results */}
                    {result && (
                        <div className="space-y-3">
                            {/* Summary pills */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-3 py-1.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                                    Total <span className="text-black">{result.total}</span>
                                </span>
                                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-xs font-semibold text-green-700">
                                    <CheckCircle2 className="w-3 h-3" /> {result.succeeded} succeeded
                                </span>
                                {result.failed > 0 && (
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 text-xs font-semibold text-red-600">
                                        <AlertCircle className="w-3 h-3" /> {result.failed} failed
                                    </span>
                                )}
                            </div>

                            {/* Per-row list */}
                            <div className="border border-slate-100 rounded-xl divide-y divide-slate-50 max-h-56 overflow-y-auto text-black">
                                {result.results.map((r) => (
                                    <div
                                        key={r.row}
                                        className={`flex items-start gap-3 px-4 py-2.5 ${r.status === "error" ? "bg-red-50/50" : ""
                                            }`}
                                    >
                                        <span className="text-[10px] font-bold text-slate-300 w-8 flex-shrink-0 pt-0.5 font-mono">
                                            R{r.row}
                                        </span>
                                        {r.status === "success" ? (
                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-black truncate">
                                                {r.username || "—"}{" "}
                                                <span className="font-normal text-slate-400 font-mono">
                                                    {r.email}
                                                </span>
                                            </p>
                                            {r.status === "error" && (
                                                <p className="text-[11px] text-red-500 mt-0.5">
                                                    {r.error}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-3 flex-shrink-0">
                    {result ? (
                        <>
                            <button
                                onClick={reset}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                            >
                                Import Another
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl bg-purple-700 text-white text-sm font-semibold hover:bg-purple-800 transition"
                            >
                                Done
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={!file || uploading}
                                className="flex-1 py-2.5 rounded-xl bg-purple-700 text-white text-sm font-semibold hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Importing…
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4" /> Import
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
