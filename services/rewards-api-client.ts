import { createAuthenticatedClient } from "@/lib/api-utils";

// All requests routed through Next.js proxy (/api/proxy/rewards/*)
const rewardsApiClient = createAuthenticatedClient("/api/proxy/rewards");

export default rewardsApiClient;