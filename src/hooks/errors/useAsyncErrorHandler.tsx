
import { useCallback } from "react";

export interface AsyncErrorHandlerState {
  withErrorHandling: <T>(fn: () => Promise<T>, context?: string) => Promise<T | null>;
}

/**
 * Hook for handling errors in async operations
 */
export function useAsyncErrorHandler(
  handleError: (error: unknown, context?: string) => string,
  clearError: () => void
): AsyncErrorHandlerState {
  const withErrorHandling = useCallback(
    async <T,>(fn: () => Promise<T>, context?: string): Promise<T | null> => {
      try {
        clearError();
        return await fn();
      } catch (error) {
        handleError(error, context);
        return null;
      }
    },
    [clearError, handleError]
  );

  return {
    withErrorHandling
  };
}
