import { createAuthenticatedClient } from "@/lib/api-utils";

// All requests routed through Next.js proxy (/api/proxy/wallet/*)
const walletApiClient = createAuthenticatedClient("/api/proxy/wallet");

export default walletApiClient;