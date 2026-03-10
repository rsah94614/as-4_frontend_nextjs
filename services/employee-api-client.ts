import { createAuthenticatedClient } from "@/lib/api-utils";

// Routes through Next.js proxy — no direct microservice URL in browser
const employeeApiClient = createAuthenticatedClient("/api/proxy/employees/v1");

export default employeeApiClient;