/**
 * Reusable hook for form submission patterns
 * Manages loading state, error handling, and success notifications
 */

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useErrorHandler, type UseErrorHandlerOptions } from "./use-error-handler";

/**
 * Options for form submission hook
 */
export type UseFormSubmissionOptions<T> = {
  /**
   * Function to execute on successful submission
   */
  onSuccess?: (data?: T) => void;
  /**
   * Function to execute on error (before default error handling)
   */
  onError?: (error: unknown) => void;
  /**
   * Success message to show (default: "Operation completed successfully")
   */
  successMessage?: string;
  /**
   * Whether to show success toast (default: true)
   */
  showSuccessToast?: boolean;
  /**
   * Whether to reset form on success (default: false)
   */
  resetOnSuccess?: boolean;
  /**
   * Reset function to call on success
   */
  resetFn?: () => void;
  /**
   * Error handler options
   */
  errorHandlerOptions?: UseErrorHandlerOptions;
};

/**
 * Return type for useFormSubmission hook
 */
export type UseFormSubmissionReturn<T> = {
  /**
   * Whether the form is currently submitting
   */
  isSubmitting: boolean;
  /**
   * Function to submit the form
   */
  submit: (submitFn: () => Promise<T>) => Promise<void>;
  /**
   * Function to reset the submission state
   */
  reset: () => void;
};

/**
 * Hook for handling form submission with loading state and error handling
 * @param options - Configuration options
 * @returns Object with isSubmitting state and submit function
 */
export function useFormSubmission<T = void>(
  options: UseFormSubmissionOptions<T> = {}
): UseFormSubmissionReturn<T> {
  const {
    onSuccess,
    onError,
    successMessage = "Operation completed successfully",
    showSuccessToast = true,
    resetOnSuccess = false,
    resetFn,
    errorHandlerOptions,
  } = options;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleError = useErrorHandler({
    showToast: true,
    ...errorHandlerOptions,
  });

  const submit = useCallback(
    async (submitFn: () => Promise<T>) => {
      setIsSubmitting(true);
      try {
        const result = await submitFn();

        // Call onSuccess callback
        if (onSuccess) {
          onSuccess(result);
        }

        // Show success toast
        if (showSuccessToast) {
          toast.success(successMessage);
        }

        // Reset form if requested
        if (resetOnSuccess && resetFn) {
          resetFn();
        }
      } catch (error) {
        // Call onError callback
        if (onError) {
          onError(error);
        }

        // Handle error (shows toast by default)
        handleError(error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      onSuccess,
      onError,
      successMessage,
      showSuccessToast,
      resetOnSuccess,
      resetFn,
      handleError,
    ]
  );

  const reset = useCallback(() => {
    setIsSubmitting(false);
  }, []);

  return {
    isSubmitting,
    submit,
    reset,
  };
}

