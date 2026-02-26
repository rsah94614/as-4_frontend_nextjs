import { createAuthenticatedClient } from "@/lib/api-utils";

// Hardcoded to guarantee the /v1 prefix is applied
const employeeApiClient = createAuthenticatedClient("http://localhost:8003/v1");

export default employeeApiClient;