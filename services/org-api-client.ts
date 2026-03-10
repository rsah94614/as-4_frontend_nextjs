// services/org-api-client.ts
//
// Routes through Next.js proxy → Organization Service (port 8007).
// Service files use paths like /departments, /designations, /department-types
// proxy maps to http://localhost:8007/v1/organizations/{path}

import { createAuthenticatedClient } from "@/lib/api-utils";

const orgApiClient = createAuthenticatedClient("/api/proxy/org");

export default orgApiClient;