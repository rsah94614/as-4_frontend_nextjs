import { createAuthenticatedClient } from "@/lib/api-utils";

// Routes through Next.js proxy — no direct microservice URL in browser
const axiosClient = createAuthenticatedClient("/api/proxy/auth");

export default axiosClient;