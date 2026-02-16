// lib/auth.ts - Authentication utility functions

/**
 * Storage keys for authentication tokens
 */
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  TOKEN_EXPIRES_AT: 'token_expires_at',
} as const

/**
 * API configuration
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

export const AUTH_ENDPOINTS = {
  LOGIN: `${API_URL}/v1/auth/login`,
  LOGOUT: `${API_URL}/v1/auth/logout`,
  REFRESH: `${API_URL}/v1/auth/refresh`,
  VALIDATE: `${API_URL}/v1/auth/validate`,
  FORGOT_PASSWORD: `${API_URL}/v1/auth/forgot-password`,
  RESET_PASSWORD: `${API_URL}/v1/auth/reset-password`,
} as const

/**
 * Token management functions
 */
export const auth = {
  /**
   * Store authentication tokens and user data
   */
  setTokens: (accessToken: string, refreshToken: string, user: any, expiresIn: number) => {
    if (typeof window === 'undefined') return

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
    
    const expiresAt = Date.now() + (expiresIn * 1000)
    localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRES_AT, expiresAt.toString())
  },

  /**
   * Get access token
   */
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  },

  /**
   * Get refresh token
   */
  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
  },

  /**
   * Get stored user data
   */
  getUser: () => {
    if (typeof window === 'undefined') return null
    const userStr = localStorage.getItem(STORAGE_KEYS.USER)
    return userStr ? JSON.parse(userStr) : null
  },

  /**
   * Check if token is expired
   */
  isTokenExpired: (): boolean => {
    if (typeof window === 'undefined') return true
    
    const expiresAt = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT)
    if (!expiresAt) return true
    
    return Date.now() >= parseInt(expiresAt)
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!auth.getAccessToken() && !auth.isTokenExpired()
  },

  /**
   * Clear all authentication data
   */
  clearTokens: () => {
    if (typeof window === 'undefined') return

    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRES_AT)
  },

  /**
   * Refresh access token using refresh token
   */
  refreshAccessToken: async (): Promise<boolean> => {
    const refreshToken = auth.getRefreshToken()
    if (!refreshToken) return false

    try {
      const response = await fetch(AUTH_ENDPOINTS.REFRESH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      if (response.ok) {
        const data = await response.json()
        auth.setTokens(
          data.access_token,
          data.refresh_token,
          data.employee,
          data.expires_in
        )
        return true
      }

      // Refresh failed - clear tokens
      auth.clearTokens()
      return false
    } catch (error) {
      console.error('Token refresh error:', error)
      auth.clearTokens()
      return false
    }
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    const refreshToken = auth.getRefreshToken()
    
    if (refreshToken) {
      try {
        await fetch(AUTH_ENDPOINTS.LOGOUT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.getAccessToken()}`,
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        })
      } catch (error) {
        console.error('Logout error:', error)
      }
    }

    auth.clearTokens()
  },
}

/**
 * Make authenticated API request
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Check if token is expired
  if (auth.isTokenExpired()) {
    // Try to refresh
    const refreshed = await auth.refreshAccessToken()
    if (!refreshed) {
      // Refresh failed - redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      throw new Error('Authentication required')
    }
  }

  const token = auth.getAccessToken()
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  // If we get 401, try to refresh token once
  if (response.status === 401) {
    const refreshed = await auth.refreshAccessToken()
    if (refreshed) {
      // Retry request with new token
      const newToken = auth.getAccessToken()
      return fetch(url, {
        ...options,
        headers: {
          ...headers,
          Authorization: `Bearer ${newToken}`,
        },
      })
    } else {
      // Refresh failed - redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      throw new Error('Authentication required')
    }
  }

  return response
}

/**
 * Login function
 */
export async function login(email: string, password: string) {
  const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: email,
      password: password,
    }),
  })

  const data = await response.json()

  if (response.ok) {
    auth.setTokens(
      data.access_token,
      data.refresh_token,
      data.employee,
      data.expires_in
    )
    return { success: true, data }
  }

  return { 
    success: false, 
    error: data.error?.message || data.detail || 'Login failed' 
  }
}

/**
 * Forgot password function
 */
export async function forgotPassword(email: string) {
  const response = await fetch(AUTH_ENDPOINTS.FORGOT_PASSWORD, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  })

  const data = await response.json()

  if (response.ok) {
    return { success: true, data }
  }

  return { 
    success: false, 
    error: data.error?.message || data.detail || 'Failed to send reset email' 
  }
}

/**
 * Reset password function
 */
export async function resetPassword(token: string, newPassword: string) {
  const response = await fetch(AUTH_ENDPOINTS.RESET_PASSWORD, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token,
      new_password: newPassword,
    }),
  })

  const data = await response.json()

  if (response.ok) {
    return { success: true, data }
  }

  return { 
    success: false, 
    error: data.error?.message || data.detail || 'Failed to reset password' 
  }
}

/**
 * TypeScript types
 */
export interface User {
  employee_id: string
  username: string
  email: string
  designation_id: string | null
  department_id: string | null
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  employee: User
}