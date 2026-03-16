// components/ProtectedRoute.tsx - Wrapper component for protected pages

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { auth } from '@/services/auth-service'

import { isAdminUser } from '@/lib/role-utils'
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  adminOnly?: boolean
}

export default function ProtectedRoute({
  children,
  redirectTo = '/login',
  adminOnly = false
}: ProtectedRouteProps) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      let authed = false

      // 1. Check current token
      if (auth.isAuthenticated()) {
        authed = true
      } 
      // 2. Try refresh if expired
      else if (auth.getRefreshToken()) {
        const refreshed = await auth.refreshAccessToken()
        if (refreshed) authed = true
      }

      if (authed) {
        setIsAuthenticated(true)
        setIsAdmin(isAdminUser())
        setIsChecking(false)
      } else {
        router.push(redirectTo)
      }
    }

    checkAuth()
  }, [router, redirectTo])

  // ── Loading state ──
  if (isChecking) {
    return (
      <div className="min-h-screen flex bg-gray-100">
        <div className="hidden md:block w-64 bg-white border-r border-gray-200 p-4 space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <div className="space-y-2 pt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-lg md:hidden" />
            <Skeleton className="h-5 w-40" />
            <div className="ml-auto flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
          <div className="flex-1 p-6">
            <Skeleton className="h-8 w-48 mb-6" />
            <Skeleton className="h-[60vh] w-full rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  // ── Role Gate ──
  if (adminOnly && !isAdmin) {
    return (
      <div className="min-h-screen w-full bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-red-100 rounded-full blur-2xl opacity-50" />
            <div className="relative w-24 h-24 bg-white rounded-3xl shadow-xl border border-red-50 flex items-center justify-center mx-auto">
              <ShieldAlert size={48} className="text-[#E31837]" strokeWidth={1.5} />
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-[#004C8F] tracking-tight mb-2">
              Access Restricted
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed px-4">
              It looks like you don&apos;t have the necessary administrative permissions to view this section. 
              Please contact your HR manager if you believe this is an error.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
            <button
               onClick={() => router.back()}
              className="px-6 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <ArrowLeft size={16} />
              Go Back
            </button>
            <Link
              href="/dashboard"
              className="px-6 py-2.5 rounded-xl bg-[#004C8F] text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md active:scale-95 no-underline"
            >
              <Home size={16} />
              Dashboard
            </Link>
          </div>

          <p className="text-[11px] text-gray-400 font-medium pt-8 uppercase tracking-[0.2em]">
            Aabhar • Security Portal
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}