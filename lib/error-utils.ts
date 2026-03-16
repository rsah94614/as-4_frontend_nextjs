import axios from "axios";

/**
 * Standardizes error extraction across the entire application.
 * Handles Axios errors, Fetch Response errors, standard Error objects, and strings.
 */
export function extractErrorMessage(error: unknown, fallbackMessage = "An unexpected error occurred"): string {
  // 1. Handle Axios Errors
  if (axios.isAxiosError(error)) {
    // API might return standard FastAPI error: { detail: "..." }
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return detail[0]?.msg || fallbackMessage; // If it's a validation array
    
    // Other common error formats { message: "..." } or { error: "..." }
    const dataMessage = error.response?.data?.message || error.response?.data?.error;
    if (typeof dataMessage === "string") return dataMessage;

    return error.message || fallbackMessage;
  }

  // 2. Handle Standard JS Errors
  if (error instanceof Error) {
    return error.message;
  }

  // 3. Handle Strings
  if (typeof error === "string") {
    return error;
  }

  // 4. Handle Plain Objects (common in fetch responses)
  if (error && typeof error === "object") {
    const obj = error as Record<string, unknown>;
    if (typeof obj.detail === "string") return obj.detail;
    if (typeof obj.message === "string") return obj.message;
    if (typeof obj.error === "string") return obj.error;
    if (Array.isArray(obj.detail)) return obj.detail[0]?.msg || fallbackMessage;
  }

  // 5. Default Fallback
  return fallbackMessage;
}

/**
 * Optional: A standardized wrapper for structured Service responses.
 * Replaces `{ success: false, error: string }` boilerplates.
 */
export function createErrorResponse(error: unknown, fallbackMessage = "An unexpected error occurred") {
  return {
    success: false as const,
    error: extractErrorMessage(error, fallbackMessage),
  };
}
