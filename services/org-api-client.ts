// services/org-api-client.ts
//
// Dedicated Axios instance for the Organization Service (port 8007).
// Base URL includes /v1/org so service files can use relative paths like
// /departments, /designations, /department-types directly.

import { createAuthenticatedClient } from "@/lib/api-utils";

const ORG_API_BASE =
    process.env.NEXT_PUBLIC_ORG_API_URL || "http://localhost:8007";

const orgApiClient = createAuthenticatedClient(`${ORG_API_BASE}/v1/org`);

export default orgApiClient;