// components/ProtectedRoute.tsx - Wrapper component for protected pages

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/Skeleton'
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
      <div className="min-h-screen flex bg-gray-100">
        {/* Sidebar skeleton */}
        <div className="hidden md:block w-64 bg-white border-r border-gray-200 p-4 space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <div className="space-y-2 pt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
        </div>
        {/* Main area */}
        <div className="flex-1 flex flex-col">
          {/* Navbar skeleton */}
          <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-lg md:hidden" />
            <Skeleton className="h-5 w-40" />
            <div className="ml-auto flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
          {/* Content skeleton */}
          <div className="flex-1 p-6">
            <Skeleton className="h-8 w-48 mb-6" />
            <Skeleton className="h-[60vh] w-full rounded-2xl" />
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