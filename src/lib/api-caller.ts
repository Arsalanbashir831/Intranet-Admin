// lib/apiCaller.ts
import type { AxiosRequestConfig, AxiosResponse } from "axios";

import { api } from "./api"; // Your configured Axios instance

export type RequestData =
  | Record<
      string,
      string | number | boolean | File | Blob | string[] | null | undefined
    >
  | FormData;

export default async function apiCaller<T = unknown>(
  url: string,
  method: AxiosRequestConfig["method"] = "GET",
  data?: RequestData,
  options: AxiosRequestConfig = {}, // User-provided options for this specific call
  dataType: "json" | "formdata" = "json"
): Promise<AxiosResponse<T>> {
  const config: AxiosRequestConfig = {
    ...options, // Spread user-provided options first
    url,
    method,
    headers: { ...(options.headers || {}) }, // Initialize with options.headers, or empty object
  };

  if (data) {
    // console.log("apiCaller: Received data object:", data); // Already have this
    if (dataType === "formdata") {
      if (data instanceof FormData) {
        config.data = data;
        // console.log("apiCaller: Using provided FormData instance for data."); // Already have this
      } else {
        // This block is for when you pass a plain object but expect it to be FormData
        console.warn(
          "apiCaller: dataType is 'formdata' but data was an object. Reconstructing FormData. Consider passing FormData instance directly from caller."
        );
        const formData = new FormData();
        Object.entries(data as Record<string, unknown>).forEach(
          ([key, value]) => {
            if (value instanceof File) {
              formData.append(key, value, value.name);
            } else if (value instanceof Blob) {
              formData.append(key, value);
            } else if (value !== null && value !== undefined) {
              formData.append(key, String(value));
            }
          }
        );
        config.data = formData;
      }
      // CRITICAL FOR FORMDATA:
      // Explicitly set Content-Type to undefined in the request-specific config.
      // This signals to Axios to determine it from the FormData body,
      // overriding any defaults from the Axios instance (like 'application/json').
      if (!config.headers) {
        config.headers = {};
      }
      config.headers["Content-Type"] = undefined;
      // Or, more aggressively if the above doesn't work (less common to need):
      // delete config.headers['Content-Type']; // Should be equivalent if property exists
      // if (config.headers.hasOwnProperty('Content-Type')) {
      //    delete config.headers['Content-Type'];
      // }
    } else {
      // dataType is 'json'
      config.data = data;
      if (!config.headers) {
        config.headers = {};
      }
      if (!config.headers["Content-Type"]) {
        // Set default if not overridden by options
        config.headers["Content-Type"] = "application/json";
      }
      // console.log("apiCaller: Using JSON data:", data); // Already have this
    }
  }

  // console.log("apiCaller: Final Axios config headers:", config.headers); // Your existing log
  // ... (your other logging for FormData entries) ...

  return api.request<T>(config);
}
