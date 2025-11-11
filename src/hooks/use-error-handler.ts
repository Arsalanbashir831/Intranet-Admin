/**
 * React hook for error handling in components
 * Provides a convenient way to handle errors with toast notifications
 */

import { useCallback } from "react";
import { toast } from "sonner";
import { handleApiError, type CustomErrorMessages } from "@/lib/error-handler";

/**
 * Options for the error handler hook
 */
export type UseErrorHandlerOptions = {
  /**
   * Custom error messages for specific HTTP status codes
   */
  customMessages?: CustomErrorMessages;
  /**
   * Whether to show toast notifications (default: true)
   */
  showToast?: boolean;
  /**
   * Custom error handler function (called before toast)
   */
  onError?: (error: unknown, message: string) => void;
};

/**
 * Hook that returns an error handler function
 * @param options - Configuration options for error handling
 * @returns A function that handles errors and shows toast notifications
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { customMessages, showToast = true, onError } = options;

  const handleError = useCallback(
    (error: unknown) => {
      const message = handleApiError(error, customMessages);

      // Call custom error handler if provided
      if (onError) {
        onError(error, message);
      }

      // Show toast notification if enabled
      if (showToast) {
        toast.error(message);
      }

      return message;
    },
    [customMessages, showToast, onError]
  );

  return handleError;
}

