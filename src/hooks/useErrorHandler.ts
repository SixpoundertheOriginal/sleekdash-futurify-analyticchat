
import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";

export interface ErrorHandlerState {
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
  handleError: (error: unknown, context?: string) => void;
  withErrorHandling: <T>(fn: () => Promise<T>, context?: string) => Promise<T | null>;
  getErrorDetails: (error: unknown) => {
    message: string;
    type: "network" | "validation" | "permission" | "timeout" | "unknown";
    suggestion: string;
  };
}

export function useErrorHandler(initialError: string | null = null): ErrorHandlerState {
  const [error, setError] = useState<string | null>(initialError);
  const { toast } = useToast();

  const clearError = useCallback(() => setError(null), []);

  const getErrorDetails = useCallback((error: unknown) => {
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'string' 
        ? error 
        : 'An unexpected error occurred';
    
    // Determine error type based on message content or error instance
    let type: "network" | "validation" | "permission" | "timeout" | "unknown" = "unknown";
    let suggestion = "Please try again or contact support if the issue persists.";
    
    if (error instanceof Error) {
      if (error.name === "NetworkError" || errorMessage.includes("network") || errorMessage.includes("fetch")) {
        type = "network";
        suggestion = "Check your internet connection and try again.";
      } else if (error.name === "ValidationError" || errorMessage.includes("valid")) {
        type = "validation";
        suggestion = "Please check your input data and try again.";
      } else if (error.name === "PermissionError" || errorMessage.includes("permission") || errorMessage.includes("unauthorized")) {
        type = "permission";
        suggestion = "You may not have permission to perform this action. Try logging in again.";
      } else if (error.name === "TimeoutError" || errorMessage.includes("timeout")) {
        type = "timeout";
        suggestion = "The operation timed out. Please try again when the server is less busy.";
      }
    } else if (typeof error === "string") {
      if (error.includes("network") || error.includes("connection") || error.includes("offline")) {
        type = "network";
        suggestion = "Check your internet connection and try again.";
      } else if (error.includes("valid") || error.includes("format") || error.includes("invalid")) {
        type = "validation";
        suggestion = "Please check your input data and try again.";
      } else if (error.includes("permission") || error.includes("access") || error.includes("unauthorized")) {
        type = "permission";
        suggestion = "You may not have permission to perform this action. Try logging in again.";
      } else if (error.includes("timeout") || error.includes("timed out")) {
        type = "timeout";
        suggestion = "The operation timed out. Please try again when the server is less busy.";
      }
    }
    
    return {
      message: errorMessage,
      type,
      suggestion
    };
  }, []);

  const handleError = useCallback((error: unknown, context?: string) => {
    const { message: errorMessage, suggestion } = getErrorDetails(error);
    
    const contextPrefix = context ? `${context}: ` : '';
    const fullErrorMessage = `${contextPrefix}${errorMessage}`;
    
    console.error('Error:', fullErrorMessage, error);
    setError(fullErrorMessage);
    
    toast({
      variant: "destructive",
      title: "Error",
      description: `${fullErrorMessage}. ${suggestion}`
    });
    
    return fullErrorMessage;
  }, [toast, getErrorDetails]);

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
    withErrorHandling,
    getErrorDetails
  };
}
