import { authClient } from "./api-clients";

/**
 * Default Axios client, primarily used for authentication.
 * 
 * NOTE: For other microservices, please import the specific client 
 * from @/services/api-clients.
 */
export default authClient;