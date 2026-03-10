import { createAuthenticatedClient } from "@/lib/api-utils";

const rewardsApiClient = createAuthenticatedClient(
    process.env.NEXT_PUBLIC_REWARDS_API_URL || "http://localhost:8006"
);

export default rewardsApiClient;
