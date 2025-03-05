
import { ProcessedAnalytics } from "@/utils/analytics/types";
import { useAnalyticsState } from "./analytics/useAnalyticsState";
import { useAnalyticsPersistence } from "./analytics/useAnalyticsPersistence";
import { useAnalyticsHandlers } from "./analytics/useAnalyticsHandlers";
import { useChat } from "@/hooks/useChat";

interface UseAppStoreAnalysisParams {
  initialData?: ProcessedAnalytics;
}

/**
 * Main hook for App Store analytics that composes smaller, focused hooks
 */
export function useAppStoreAnalysis({ initialData }: UseAppStoreAnalysisParams) {
  // Use smaller hooks for specific concerns
  const state = useAnalyticsState({ initialData });
  
  // Set up chat with the appStore feature
  const chat = useChat({ feature: 'appStore' });
  
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
    chatThreadId: chat.threadId,
    chatAssistantId: chat.assistantId
  };
}
