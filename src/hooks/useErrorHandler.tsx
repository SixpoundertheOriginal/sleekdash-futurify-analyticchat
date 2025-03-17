
import { useCallback } from "react";
import { useErrorState } from "./errors/useErrorState";
import { useErrorAnalysis } from "./errors/useErrorAnalysis";
import { useErrorNotification } from "./errors/useErrorNotification";
import { useAsyncErrorHandler } from "./errors/useAsyncErrorHandler";

export interface ErrorHandlerState {
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
  handleError: (error: unknown, context?: string) => string;
  withErrorHandling: <T>(fn: () => Promise<T>, context?: string) => Promise<T | null>;
  getErrorDetails: (error: unknown) => {
    message: string;
    type: "network" | "validation" | "permission" | "timeout" | "unknown";
    suggestion: string;
  };
}

/**
 * Composite hook that combines all error handling capabilities
 */
export function useErrorHandler(initialError: string | null = null): ErrorHandlerState {
  // Use the smaller, more focused hooks
  const { error, setError, clearError } = useErrorState(initialError);
  const { getErrorDetails } = useErrorAnalysis();
  const { notifyError } = useErrorNotification();

  // Handle errors with logging and notification
  const handleError = useCallback((error: unknown, context?: string) => {
    const errorDetails = getErrorDetails(error);
    const contextPrefix = context ? `${context}: ` : '';
    const fullErrorMessage = `${contextPrefix}${errorDetails.message}`;
    
    console.error('Error:', fullErrorMessage, error);
    setError(fullErrorMessage);
    notifyError(errorDetails, context);
    
    return fullErrorMessage;
  }, [getErrorDetails, notifyError, setError]);

  // Get the async error handling capability
  const { withErrorHandling } = useAsyncErrorHandler(handleError, clearError);

  // Return the combined interface
  return {
    error,
    setError,
    clearError,
    handleError,
    withErrorHandling,
    getErrorDetails
  };
}
