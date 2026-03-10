import { createAuthenticatedClient } from "@/lib/api-utils";

const walletApiClient = createAuthenticatedClient(
    process.env.NEXT_PUBLIC_WALLET_API_URL || "http://localhost:8004"
);

export default walletApiClient;
