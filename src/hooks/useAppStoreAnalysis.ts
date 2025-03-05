
import { ProcessedAnalytics } from "@/utils/analytics/types";
import { useAnalyticsState } from "./analytics/useAnalyticsState";
import { useAnalyticsPersistence } from "./analytics/useAnalyticsPersistence";
import { useAnalyticsHandlers } from "./analytics/useAnalyticsHandlers";
import { useThread } from "@/hooks/useChat";
import { useThread as useThreadContext } from "@/contexts/ThreadContext";

interface UseAppStoreAnalysisParams {
  initialData?: ProcessedAnalytics;
}

/**
 * Main hook for App Store analytics that composes smaller, focused hooks
 */
export function useAppStoreAnalysis({ initialData }: UseAppStoreAnalysisParams) {
  // Use smaller hooks for specific concerns
  const state = useAnalyticsState({ initialData });
  
  // Get the thread context to access the feature-specific thread IDs
  const threadContext = useThreadContext();
  
  // Get the App Store-specific thread and assistant IDs
  const appStoreThreadId = threadContext.getFeatureThreadId('appStore');
  const appStoreAssistantId = threadContext.getFeatureAssistantId('appStore');
  
  // Set up chat with the appStore feature
  const chat = useThread({ feature: 'appStore' });
  
  const { saveAnalytics } = useAnalyticsPersistence({
    processedAnalytics: state.processedAnalytics,
    setProcessedAnalytics: state.setProcessedAnalytics,
    setActiveTab: state.setActiveTab
  });
  
  const handlers = useAnalyticsHandlers({
    setExtractedData: state.setExtractedData,
    setAnalysisResult: state.setAnalysisResult,
    setActiveTab: state.setActiveTab,
    setProcessedAnalytics: state.setProcessedAnalytics,
    setDirectlyExtractedMetrics: state.setDirectlyExtractedMetrics,
    dateRange: state.dateRange,
    setProcessingError: state.setProcessingError,
    saveAnalytics
  });

  // Return all the state and handlers needed by components
  return {
    ...state,
    ...handlers,
    chatThreadId: appStoreThreadId, // Use the App Store specific thread ID
    chatAssistantId: appStoreAssistantId // Use the App Store specific assistant ID
  };
}
