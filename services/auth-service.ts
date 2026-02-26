// services/auth-service.ts - Authentication utility functions

import axiosClient from './api-client'

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
    setTokens: (accessToken: string, refreshToken: string, user: Record<string, unknown>, expiresIn: number) => {
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

    refreshAccessToken: async (): Promise<boolean> => {
        const refreshToken = auth.getRefreshToken()
        if (!refreshToken) return false

        try {
            const response = await axiosClient.post(AUTH_ENDPOINTS.REFRESH, {
                refresh_token: refreshToken
            })

            const data = response.data
            auth.setTokens(
                data.access_token,
                data.refresh_token,
                data.employee,
                data.expires_in
            )
            return true
        } catch (error) {
            console.error('Token refresh error:', error)
            auth.clearTokens()
            return false
        }
    },

    logout: async (): Promise<void> => {
        const refreshToken = auth.getRefreshToken()

        if (refreshToken) {
            try {
                await axiosClient.post(AUTH_ENDPOINTS.LOGOUT, {
                    refresh_token: refreshToken
                })
            } catch (error) {
                console.error('Logout error:', error)
            }
        }

        auth.clearTokens()
    },
}
/**
 * Make authenticated API request - now using Axios internally for 
 * consistency and to trigger Developer Logger interceptors.
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    try {
        // Map Fetch options to Axios config
        const response = await axiosClient({
            url,
            method: options.method || 'GET',
            data: options.body ? JSON.parse(options.body as string) : undefined,
            headers: options.headers as any,
        });

        // Return a Fetch-compatible response shim so existing code doesn't break
        return {
            ok: true,
            status: response.status,
            json: async () => response.data,
            headers: {
                get: (name: string) => response.headers[name.toLowerCase()],
            },
        } as unknown as Response;
    } catch (error: any) {
        // If it's an Axios error with a response
        if (error.response) {
            return {
                ok: false,
                status: error.response.status,
                json: async () => error.response.data,
                headers: {
                    get: (name: string) => error.response.headers[name.toLowerCase()],
                },
            } as unknown as Response;
        }
        // Network errors or other issues
        throw error;
    }
}

export async function login(email: string, password: string) {
    try {
        const response = await axiosClient.post(AUTH_ENDPOINTS.LOGIN, {
            username: email,
            password: password,
        })

        const data = response.data
        auth.setTokens(
            data.access_token,
            data.refresh_token,
            data.employee,
            data.expires_in
        )
        return { success: true, data }
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.response?.data?.detail || 'Login failed'
        }
    }
}

export async function forgotPassword(email: string) {
    try {
        const response = await axiosClient.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email })
        return { success: true, data: response.data }
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.response?.data?.detail || 'Failed to send reset email'
        }
    }
}

export async function resetPassword(token: string, newPassword: string) {
    try {
        const response = await axiosClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, {
            token,
            new_password: newPassword,
        })
        return { success: true, data: response.data }
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.response?.data?.detail || 'Failed to reset password'
        }
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
