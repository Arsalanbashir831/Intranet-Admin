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
    if (dataType === "formdata") {
      if (data instanceof FormData) {
        config.data = data;
      } else {
        // This block is for when you pass a plain object but expect it to be FormData
        // Reconstruct FormData from object
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
    }
  }

  return api.request<T>(config);
}
