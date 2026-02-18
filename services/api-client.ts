import axios from "axios";
import { auth } from "./auth-service";

// Create a single axios instance for the entire app
const axiosClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001",
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor: Attach the Access Token
axiosClient.interceptors.request.use(
    (config) => {
        const token = auth.getAccessToken(); // Retrieves 'access_token' from localStorage
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle 401s (Token Expiry)
axiosClient.interceptors.response.use(
    (response) => response, // If successful, just return the response
    async (error) => {
        const originalRequest = error.config;

        // strict check for 401 and avoid infinite loops
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh the token using your existing auth logic
                const refreshed = await auth.refreshAccessToken();

                if (refreshed) {
                    // If refresh succeeded, update the header with the new token
                    const newToken = auth.getAccessToken();
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;

                    // Retry the original request
                    return axiosClient(originalRequest);
                }
            } catch (refreshError) {
                // If refresh fails, let the error propagate (auth.refreshAccessToken handles logout/redirect)
                return Promise.reject(refreshError);
            }
        }

        // If it's not a 401 or refresh failed, reject the promise with the error
        return Promise.reject(error);
    }
);

export default axiosClient;
