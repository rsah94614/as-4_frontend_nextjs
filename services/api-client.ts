import { createAuthenticatedClient } from "@/lib/api-utils";

const axiosClient = createAuthenticatedClient(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"
);

export default axiosClient;
