
import { useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ErrorDetails } from "./useErrorAnalysis";

export interface ErrorNotificationState {
  notifyError: (errorDetails: ErrorDetails, context?: string) => void;
}

/**
 * Hook for displaying error notifications
 */
export function useErrorNotification(): ErrorNotificationState {
  const { toast } = useToast();

  const notifyError = useCallback((errorDetails: ErrorDetails, context?: string) => {
    const { message, suggestion } = errorDetails;
    const contextPrefix = context ? `${context}: ` : '';
    const fullErrorMessage = `${contextPrefix}${message}`;
    
    toast({
      variant: "destructive",
      title: "Error",
      description: `${fullErrorMessage}. ${suggestion}`
    });
  }, [toast]);

  return {
    notifyError
  };
}
