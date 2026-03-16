"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw, Home, LifeBuoy } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if available
    console.error("Unhandle Error Captured:", error);
  }, [error]);

  return (
    <div className="min-h-screen w-full bg-[#FCFDFE] flex items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full text-center space-y-10 animate-in fade-in slide-in-from-top-4 duration-700">
        
        {/* Warning Icon with Glow */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-red-100 rounded-full blur-3xl opacity-60 animate-pulse" />
          <div className="relative w-28 h-28 bg-white rounded-[40px] shadow-2xl border border-red-50 flex items-center justify-center mx-auto">
            <AlertTriangle size={56} className="text-[#E31837]" strokeWidth={1.5} />
          </div>
        </div>

        {/* Textual Content */}
        <div className="space-y-4">
          <h1 className="text-4xl font-black text-[#004C8F] tracking-tight">
            Something went wrong
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed px-4">
            We encountered an unexpected error while rendering this page. 
            Our team has been notified and we&apos;re working on it.
          </p>
          {error.digest && (
             <p className="text-[10px] font-mono text-gray-300 uppercase tracking-widest mt-2">
               Error ID: {error.digest}
             </p>
          )}
        </div>

        {/* Recovery Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <button
            onClick={() => reset()}
            className="group flex items-center justify-center gap-2 px-8 py-4 bg-[#E31837] text-white font-bold rounded-2xl shadow-lg shadow-red-200 hover:shadow-red-300 hover:scale-[1.02] transition-all active:scale-95"
          >
            <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            Try Again
          </button>
          
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-white border border-gray-200 text-[#004C8F] font-bold rounded-2xl shadow-sm hover:shadow-md hover:border-blue-100 transition-all active:scale-95 no-underline"
          >
            <Home className="w-5 h-5" />
            Take Me Home
          </Link>
        </div>

        {/* Help Link */}
        <div className="pt-8 opacity-60 flex items-center justify-center gap-2 text-sm text-gray-400 font-medium">
          <LifeBuoy size={18} />
          <span>Need help? Contact IT Support</span>
        </div>

      </div>
    </div>
  );
}
