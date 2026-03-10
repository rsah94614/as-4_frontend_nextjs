// services/org-api-client.ts
//
// Routes through Next.js proxy → Organization Service (port 8007).
// Base URL includes /v1/org so service files can use relative paths like
// /departments, /designations, /department-types directly.

import { createAuthenticatedClient } from "@/lib/api-utils";

const orgApiClient = createAuthenticatedClient("/api/proxy/org/v1/org");

export default orgApiClient;