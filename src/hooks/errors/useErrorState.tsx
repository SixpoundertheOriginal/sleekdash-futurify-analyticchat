
import { useState, useCallback } from "react";

export interface ErrorState {
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
}

/**
 * Core hook for managing error state
 */
export function useErrorState(initialError: string | null = null): ErrorState {
  const [error, setError] = useState<string | null>(initialError);
  const clearError = useCallback(() => setError(null), []);

  return {
    error,
    setError,
    clearError
  };
}
