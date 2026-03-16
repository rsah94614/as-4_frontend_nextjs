// components/ProtectedRoute.tsx - Wrapper component for protected pages

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { auth } from '@/services/auth-service'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export default function ProtectedRoute({
  children,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      // Check if user has valid token
      if (auth.isAuthenticated()) {
        setIsAuthenticated(true)
        setIsChecking(false)
        return
      }

      // Token expired - try to refresh
      if (auth.getRefreshToken()) {
        const refreshed = await auth.refreshAccessToken()
        if (refreshed) {
          setIsAuthenticated(true)
          setIsChecking(false)
          return
        }
      }

      // Not authenticated - redirect to login
      router.push(redirectTo)
    }

    checkAuth()
  }, [router, redirectTo])

  // Show skeleton while checking authentication
  if (isChecking) {
    return (
      <div className="flex min-h-screen bg-[#F0F4F8]">
        {/* Sidebar skeleton */}
        <div className="hidden lg:block w-64 bg-white border-r border-gray-200 p-4 space-y-4">
          <Skeleton className="h-10 w-3/4 mb-8" />
          <div className="space-y-2 pt-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
        </div>
        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0 w-full">
          {/* Navbar skeleton */}
          <div className="h-14 bg-[#004C8F] px-4 sm:px-6 flex items-center justify-between gap-4">
            <Skeleton className="h-8 w-8 rounded-lg lg:hidden bg-white/20" />
            <div className="ml-auto flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-md bg-white/20" />
              <div className="h-7 w-px bg-white/20" />
              <Skeleton className="h-8 w-8 rounded-full bg-white/20" />
              <Skeleton className="h-4 w-24 rounded bg-white/20 hidden md:block" />
            </div>
          </div>
          {/* Content skeleton */}
          <div className="flex-1 p-4 sm:p-6 overflow-auto">
            <div className="space-y-6">
                <Skeleton className="h-32 w-full rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Skeleton className="h-24 rounded-2xl" />
                    <Skeleton className="h-24 rounded-2xl" />
                    <Skeleton className="h-24 rounded-2xl" />
                    <Skeleton className="h-24 rounded-2xl" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <Skeleton className="lg:col-span-3 h-[400px] rounded-2xl" />
                    <Skeleton className="lg:col-span-2 h-[400px] rounded-2xl" />
                </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Don't render children until authenticated
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}