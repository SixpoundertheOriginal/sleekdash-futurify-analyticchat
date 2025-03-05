
import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";

export interface ErrorHandlerState {
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
  handleError: (error: unknown, context?: string) => void;
  withErrorHandling: <T>(fn: () => Promise<T>, context?: string) => Promise<T | null>;
}

export function useErrorHandler(initialError: string | null = null): ErrorHandlerState {
  const [error, setError] = useState<string | null>(initialError);
  const { toast } = useToast();

  const clearError = useCallback(() => setError(null), []);

  const handleError = useCallback((error: unknown, context?: string) => {
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'string' 
        ? error 
        : 'An unexpected error occurred';
    
    const contextPrefix = context ? `${context}: ` : '';
    const fullErrorMessage = `${contextPrefix}${errorMessage}`;
    
    console.error('Error:', fullErrorMessage, error);
    setError(fullErrorMessage);
    
    toast({
      variant: "destructive",
      title: "Error",
      description: fullErrorMessage
    });
    
    return fullErrorMessage;
  }, [toast]);

  // Helper to wrap async functions with error handling
  const withErrorHandling = useCallback(async <T>(fn: () => Promise<T>, context?: string): Promise<T | null> => {
    try {
      clearError();
      return await fn();
    } catch (error) {
      handleError(error, context);
      return null;
    }
  }, [clearError, handleError]);

  return {
    error,
    setError,
    clearError,
    handleError,
    withErrorHandling
  };
}
