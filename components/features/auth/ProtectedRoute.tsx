// components/ProtectedRoute.tsx - Wrapper component for protected pages

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
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

  // Show loading spinner while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-gray-600">Loading...</p>
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