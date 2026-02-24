import axios from "axios";
import { auth } from "./auth-service";

const employeeApiClient = axios.create({
    // Hardcode this exactly to guarantee the /v1 prefix is applied
    baseURL: "http://localhost:8003/v1",
    headers: {
        "Content-Type": "application/json",
    },
});

employeeApiClient.interceptors.request.use(
    (config) => {
        const token = auth.getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Attach Bearer token on every request ──────────────────────────────────────
employeeApiClient.interceptors.request.use(
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
employeeApiClient.interceptors.response.use(
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
                    return employeeApiClient(originalRequest);
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

export default employeeApiClient;