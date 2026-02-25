// services/org-api-client.ts
//
// Dedicated Axios instance for the Organization Service (port 8007).
// Base URL includes /v1/org so service files can use relative paths like
// /departments, /designations, /department-types directly.

import axios from "axios";
import { auth } from "./auth-service";

const ORG_API_BASE =
    process.env.NEXT_PUBLIC_ORG_API_URL || "http://localhost:8007";

const orgApiClient = axios.create({
    baseURL: `${ORG_API_BASE}/v1/org`,
    headers: {
        "Content-Type": "application/json",
    },
});

// ── Attach Bearer token on every request ─────────────────────────────────────
orgApiClient.interceptors.request.use(
    (config) => {
        const token = auth.getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Handle 401 — try refresh once, then redirect to login ────────────────────
orgApiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshed = await auth.refreshAccessToken();
                if (refreshed) {
                    const newToken = auth.getAccessToken();
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return orgApiClient(originalRequest);
                }
            } catch {
                // fall through to redirect
            }
            auth.clearTokens();
            if (typeof window !== "undefined") window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default orgApiClient;