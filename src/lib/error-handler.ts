/**
 * Centralized error handling utilities
 * Extracts and formats error messages from various error formats
 */

/**
 * Extracts error message from various error formats
 * @param error - The error object (can be Error, AxiosError, or unknown)
 * @returns A user-friendly error message string
 */
export function extractErrorMessage(error: unknown): string {
  // Handle Error objects (from API client transformation)
  if (error instanceof Error && error.message) {
    return error.message;
  }

  // Handle Axios-like error structure
  const err = error as {
    response?: {
      data?: Record<string, unknown>;
      status?: number;
    };
    message?: string;
  };

  // Check for response data
  if (err?.response?.data && typeof err.response.data === "object") {
    const data = err.response.data as Record<string, unknown>;

    // Check for direct error field (common in custom error responses)
    if ("error" in data && typeof data.error === "string") {
      return data.error;
    }

    // Check for detail field (common in DRF responses)
    if ("detail" in data && typeof data.detail === "string") {
      return data.detail;
    }

    // Check for message field
    if ("message" in data && typeof data.message === "string") {
      return data.message;
    }

    // Check for non_field_errors (validation errors)
    if ("non_field_errors" in data) {
      const nfe = data.non_field_errors;
      if (Array.isArray(nfe) && nfe.length > 0) {
        return nfe.join(". ");
      } else if (typeof nfe === "string") {
        return nfe;
      }
    }

    // Check for field-specific errors
    const messages: string[] = [];
    for (const key of Object.keys(data)) {
      const value = data[key];
      if (Array.isArray(value)) {
        value.forEach((msg: unknown) =>
          messages.push(`${key}: ${String(msg)}`)
        );
      } else if (typeof value === "string") {
        messages.push(`${key}: ${value}`);
      }
    }
    if (messages.length > 0) {
      return messages.join(". ");
    }
  }

  // Fallback to message property or string conversion
  if (err?.message) {
    return err.message;
  }

  return String(error);
}

/**
 * Custom error messages for specific HTTP status codes
 */
export type CustomErrorMessages = Record<number, string>;

/**
 * Handles API errors with custom messages for specific status codes
 * @param error - The error object
 * @param customMessages - Optional custom messages for specific status codes
 * @returns A user-friendly error message string
 */
export function handleApiError(
  error: unknown,
  customMessages?: CustomErrorMessages
): string {
  const err = error as {
    response?: {
      status?: number;
      data?: Record<string, unknown>;
    };
  };

  const status = err?.response?.status;

  // Use custom message if provided for this status code
  if (status && customMessages?.[status]) {
    return customMessages[status];
  }

  // Handle specific HTTP status codes with default messages
  if (status === 409) {
    const errorMessage = extractErrorMessage(error);
    if (
      errorMessage.toLowerCase().includes("already exists") ||
      errorMessage.toLowerCase().includes("duplicate")
    ) {
      return errorMessage;
    }
    return "A resource with this information already exists";
  }

  if (status === 403) {
    const errorMessage = extractErrorMessage(error);
    if (
      errorMessage.toLowerCase().includes("access denied") ||
      errorMessage.toLowerCase().includes("don't have permission") ||
      errorMessage.toLowerCase().includes("not authorized")
    ) {
      return errorMessage;
    }
    return "You don't have permission to perform this action";
  }

  if (status === 404) {
    const errorMessage = extractErrorMessage(error);
    if (errorMessage.toLowerCase().includes("not found")) {
      return errorMessage;
    }
    return "Requested resource not found";
  }

  if (status === 401) {
    return "Unauthorized. Please check your credentials";
  }

  if (status === 400) {
    return extractErrorMessage(error) || "Invalid request. Please check your input";
  }

  if (status === 429) {
    return "Too many requests. Please try again later";
  }

  if (status === 500) {
    return "Server error. Please try again later";
  }

  if (status === 502 || status === 503 || status === 504) {
    return "Service temporarily unavailable. Please try again later";
  }

  // For other errors, extract the message
  const extractedMessage = extractErrorMessage(error);
  return extractedMessage || "An unexpected error occurred. Please try again";
}

