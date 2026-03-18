"use client";

import Link from "next/link";
import { MoveLeft, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-[#F7F9FC] flex items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Visual Element */}
        <div className="relative h-64 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent rounded-full blur-3xl" />
          
          <div className="relative">
            <h1 className="text-[180px] font-black text-primary/5 leading-none select-none italic">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="relative">
                  <div className="w-32 h-32 bg-white rounded-[40px] shadow-2xl border border-blue-50 flex items-center justify-center rotate-12 transition-transform hover:rotate-0 duration-500">
                    <Search className="w-16 h-16 text-destructive" strokeWidth={1.5} />
                  </div>
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary rounded-2xl shadow-lg flex items-center justify-center animate-bounce">
                    <span className="text-white text-xl font-bold">?</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h2 className="text-4xl font-extrabold text-primary tracking-tight">
            Page Not Found
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
            Oops! It seems the page you&apos;re looking for has wandered off the map. 
            Let&apos;s get you back to familiar territory.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => window.history.back()}
            className="group flex items-center gap-2 px-8 py-4 bg-white border border-border text-primary font-bold rounded-2xl shadow-sm hover:shadow-md hover:border-blue-100 transition-all active:scale-95"
          >
            <MoveLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>
          
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl hover:shadow-[#004C8F]/20 hover:scale-[1.02] transition-all active:scale-95 no-underline"
          >
            <Home className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </div>

        {/* Brand Footer */}
        <div className="pt-12">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="h-px w-8 bg-secondary" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Aabhar portal</span>
            <span className="h-px w-8 bg-secondary" />
          </div>
        </div>
      </div>
    </div>
  );
}
