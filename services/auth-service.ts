// services/auth-service.ts - Authentication utility functions

import axios from 'axios' // 1. Import bare axios to bypass interceptors!
import axiosClient from './api-client'

/**
 * Storage keys for authentication tokens
 */
const STORAGE_KEYS = {
    ACCESS_TOKEN:     'access_token',
    REFRESH_TOKEN:    'refresh_token',
    USER:             'user',
    TOKEN_EXPIRES_AT: 'token_expires_at',
} as const

export const AUTH_ENDPOINTS = {
    LOGIN:           '/login',
    LOGOUT:          '/logout',
    REFRESH:         '/refresh',
    VALIDATE:        '/validate',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD:  '/reset-password',
} as const

// 2. Create a module-level lock for concurrency
let refreshPromise: Promise<boolean> | null = null;

/**
 * Token management functions
 */
export const auth = {
    setTokens: (accessToken: string, refreshToken: string, user: Record<string, unknown>, expiresIn: number) => {
        if (typeof window === 'undefined') return

        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))

        const expiresAt = Date.now() + (expiresIn * 1000)
        localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRES_AT, expiresAt.toString())
    },

    getAccessToken: (): string | null => {
        if (typeof window === 'undefined') return null
        return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    },

    getRefreshToken: (): string | null => {
        if (typeof window === 'undefined') return null
        return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
    },

    getUser: (): User | null => {
        if (typeof window === 'undefined') return null
        const userStr = localStorage.getItem(STORAGE_KEYS.USER)
        return userStr ? JSON.parse(userStr) : null
    },

    isTokenExpired: (): boolean => {
        if (typeof window === 'undefined') return true
        const expiresAt = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT)
        if (!expiresAt) return true
        return Date.now() >= parseInt(expiresAt)
    },

    isAuthenticated: (): boolean => {
        return !!auth.getAccessToken() && !auth.isTokenExpired()
    },

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

        // 3. The Concurrency Lock: If a refresh is already happening, just wait for it!
        if (refreshPromise) {
            return refreshPromise;
        }

        // 4. Create the refresh promise
        refreshPromise = (async () => {
            try {
                // 5. Use BARE axios, NOT axiosClient, to avoid infinite 401 loops!
                // We must provide the full proxy path since bare axios doesn't have the baseURL.
                const response = await axios.post(
                    '/api/proxy/auth/refresh',
                    { refresh_token: refreshToken },
                    { headers: { "Content-Type": "application/json" } }
                )

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

                // If refresh completely fails, gracefully kick the user to login
                if (typeof window !== 'undefined') window.location.href = '/login';
                return false
            } finally {
                // 6. Release the lock when done
                refreshPromise = null;
            }
        })();

        return refreshPromise;
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
 * Make authenticated API request — Axios-backed for interceptor support.
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    try {
        const response = await axiosClient({
            url,
            method: options.method || 'GET',
            data: options.body ? JSON.parse(options.body as string) : undefined,
            headers: options.headers as Record<string, string>,
        });

        return {
            ok: true,
            status: response.status,
            json: async () => response.data,
            headers: {
                get: (name: string) => response.headers[name.toLowerCase()],
            },
        } as unknown as Response;
    } catch (error: unknown) {
        const axiosErr = error as { response?: { status: number; data: unknown; headers: Record<string, string> } };
        if (axiosErr.response) {
            return {
                ok: false,
                status: axiosErr.response.status,
                json: async () => axiosErr.response!.data,
                headers: {
                    get: (name: string) => axiosErr.response!.headers[name.toLowerCase()],
                },
            } as unknown as Response;
        }
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
    } catch (error: unknown) {
        const axiosErr = error as { response?: { data?: { error?: { message?: string }; detail?: string } } };
        return {
            success: false,
            error: axiosErr.response?.data?.error?.message || axiosErr.response?.data?.detail || 'Login failed'
        }
    }
}

export async function forgotPassword(email: string) {
    try {
        const response = await axiosClient.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email })
        return { success: true, data: response.data }
    } catch (error: unknown) {
        const axiosErr = error as { response?: { data?: { error?: { message?: string }; detail?: string } } };
        return {
            success: false,
            error: axiosErr.response?.data?.error?.message || axiosErr.response?.data?.detail || 'Failed to send reset email'
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
    } catch (error: unknown) {
        const axiosErr = error as { response?: { data?: { error?: { message?: string }; detail?: string } } };
        return {
            success: false,
            error: axiosErr.response?.data?.error?.message || axiosErr.response?.data?.detail || 'Failed to reset password'
        }
    }
}

/**
 * The User object stored in localStorage after login / token refresh.
 * Matches the `employee` field returned by the auth service on every
 * successful login or refresh response.
 *
 * FIX: Added `roles` — the backend includes the employee's role codes
 * (e.g. ["SUPER_ADMIN", "HR_ADMIN"] or ["EMPLOYEE"]) in the employee
 * payload. Without this field, useAuth() returned a user with no roles,
 * making every role check in page.tsx evaluate to false and hiding the
 * admin controls for all users regardless of their actual permissions.
 */
export interface User {
    employee_id:    string
    username:       string
    email:          string
    designation_id: string | null
    department_id:  string | null
    // Role codes assigned to this employee, e.g. ["SUPER_ADMIN", "EMPLOYEE"].
    // Populated from the login / refresh response and persisted in localStorage
    // so role-gating works without a separate API call on every page load.
    roles:          string[]
}

export interface LoginResponse {
    access_token:  string
    refresh_token: string
    token_type:    string
    expires_in:    number
    employee:      User
}