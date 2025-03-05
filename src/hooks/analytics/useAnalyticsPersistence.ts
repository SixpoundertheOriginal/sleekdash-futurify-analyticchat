
import { useEffect } from "react";
import { ProcessedAnalytics } from "@/utils/analytics/types";
import { saveAnalyticsToStorage, getAnalyticsFromStorage } from "@/utils/analytics/storage";

export interface UseAnalyticsPersistenceParams {
  processedAnalytics: ProcessedAnalytics | null;
  setProcessedAnalytics: (data: ProcessedAnalytics | null) => void;
  setActiveTab: (tab: string) => void;
}

export interface UseAnalyticsPersistenceReturn {
  saveAnalytics: (data: ProcessedAnalytics) => void;
}

/**
 * Hook to manage persistence of analytics data
 */
export function useAnalyticsPersistence({
  processedAnalytics,
  setProcessedAnalytics,
  setActiveTab
}: UseAnalyticsPersistenceParams): UseAnalyticsPersistenceReturn {
  
  // Load data from localStorage on component mount
  useEffect(() => {
    if (!processedAnalytics) {
      const storedData = getAnalyticsFromStorage();
      if (storedData) {
        console.log("Loaded analytics data from storage:", storedData);
        setProcessedAnalytics(storedData);
        // If we have data, switch to the dashboard tab
        setActiveTab("dashboard");
      }
    }
  }, [processedAnalytics, setProcessedAnalytics, setActiveTab]);

  // Function to save analytics data to storage
  const saveAnalytics = (data: ProcessedAnalytics) => {
    saveAnalyticsToStorage(data);
  };

  return {
    saveAnalytics
  };
}
