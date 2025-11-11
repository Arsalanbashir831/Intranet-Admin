/**
 * Common service helper functions
 * Utilities for building query strings, transforming form data, and normalizing responses
 */

/**
 * Builds query string from parameters object
 * @param params - Parameters object with string, number, boolean, or array values
 * @returns Query string (without leading ?)
 */
export function buildQueryParams(
  params?: Record<string, string | number | boolean | string[] | number[] | null | undefined>
): string {
  if (!params) return "";

  const queryParts: string[] = [];

  Object.entries(params).forEach(([key, value]) => {
    // Skip null, undefined, and empty strings
    if (value === null || value === undefined || value === "") {
      return;
    }

    // Handle arrays - convert to comma-separated strings
    if (Array.isArray(value)) {
      if (value.length > 0) {
        queryParts.push(`${key}=${value.map(String).join(",")}`);
      }
    } else if (typeof value === "boolean") {
      queryParts.push(`${key}=${value.toString()}`);
    } else {
      queryParts.push(`${key}=${String(value)}`);
    }
  });

  return queryParts.join("&");
}

/**
 * Transforms an object to FormData for file uploads
 * @param data - Object with string, number, boolean, File, or FileList values
 * @returns FormData instance
 */
export function transformFormData(
  data: Record<string, unknown>
): FormData {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return; // Skip null/undefined values
    }

    if (value instanceof File) {
      formData.append(key, value);
    } else if (value instanceof FileList) {
      // Handle multiple files
      Array.from(value).forEach((file) => {
        formData.append(key, file);
      });
    } else if (Array.isArray(value)) {
      // Handle arrays - convert to strings
      value.forEach((item) => {
        formData.append(key, String(item));
      });
    } else if (typeof value === "object") {
      // Handle nested objects - stringify
      formData.append(key, JSON.stringify(value));
    } else {
      // Handle primitives
      formData.append(key, String(value));
    }
  });

  return formData;
}

/**
 * Normalizes API response to expected type
 * @param response - Response data from API
 * @returns Normalized response of type T
 */
export function normalizeResponse<T>(response: unknown): T {
  // If response is already the expected type, return as-is
  if (response !== null && response !== undefined) {
    return response as T;
  }

  // Return empty object as fallback
  return {} as T;
}

/**
 * Converts number arrays to string arrays for API compatibility
 * Some APIs expect string arrays instead of number arrays
 * @param arr - Array of numbers
 * @returns Array of strings
 */
export function numberArrayToStringArray(arr: number[]): string[] {
  return arr.map(String);
}

/**
 * Converts string arrays to number arrays
 * @param arr - Array of strings
 * @returns Array of numbers
 */
export function stringArrayToNumberArray(arr: string[]): number[] {
  return arr.map(Number).filter((n) => !isNaN(n));
}

