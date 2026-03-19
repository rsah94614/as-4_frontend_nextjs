import { createAuthenticatedClient } from "@/lib/api-utils";

/**
 * Modular Axios clients for each microservice.
 * Pointing directly to microservice URLs (via NEXT_PUBLIC env vars)
 * instead of routing through the Next.js API proxy.
 */

export const authClient = createAuthenticatedClient(
    (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001") + "/v1/auth"
);

export const rolesClient = createAuthenticatedClient(
    (process.env.NEXT_PUBLIC_ROLES_API_URL ?? "http://localhost:8002") + "/v1/roles"
);

export const employeesClient = createAuthenticatedClient(
    (process.env.NEXT_PUBLIC_EMPLOYEE_API_URL ?? "http://localhost:8003") + "/v1/employees"
);

export const walletClient = createAuthenticatedClient(
    (process.env.NEXT_PUBLIC_WALLET_API_URL ?? "http://localhost:8004") + "/v1/wallets"
);

export const recognitionClient = createAuthenticatedClient(
    (process.env.NEXT_PUBLIC_RECOGNITION_API_URL ?? "http://localhost:8005") + "/v1/recognitions"
);

export const rewardsClient = createAuthenticatedClient(
    (process.env.NEXT_PUBLIC_REWARDS_API_URL ?? "http://localhost:8006") + "/v1/rewards"
);

export const orgClient = createAuthenticatedClient(
    (process.env.NEXT_PUBLIC_ORG_API_URL ?? "http://localhost:8007") + "/v1/organizations"
);

export const analyticsClient = createAuthenticatedClient(
    (process.env.NEXT_PUBLIC_ANALYTICS_API_URL ?? "http://localhost:8008") + "/v1/analytics"
);
