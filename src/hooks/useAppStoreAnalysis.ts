
import { ProcessedAnalytics } from "@/utils/analytics/types";
import { useAnalyticsState, UseAnalyticsStateReturn } from "./analytics/useAnalyticsState";
import { useAnalyticsPersistence, UseAnalyticsPersistenceReturn } from "./analytics/useAnalyticsPersistence";
import { useAnalyticsHandlers, UseAnalyticsHandlersReturn } from "./analytics/useAnalyticsHandlers";
import { useChat } from "@/hooks/useChat"; 
import { useThread as useThreadContext } from "@/contexts/thread/ThreadContext";
import { findCrossDomainCorrelations, CorrelationResult } from "@/utils/analytics/correlation/dataCorrelation";
import { useKeywordAnalytics } from "./useKeywordAnalytics";
import { useState, useEffect } from "react";

export interface UseAppStoreAnalysisParams {
  initialData?: ProcessedAnalytics;
}

export interface UseAppStoreAnalysisReturn extends UseAnalyticsStateReturn, UseAnalyticsHandlersReturn {
  chatThreadId: string;
  chatAssistantId: string;
  correlations: CorrelationResult[];
  hasCorrelationData: boolean;
}

/**
 * Main hook for App Store analytics that composes smaller, focused hooks
 */
export function useAppStoreAnalysis({ initialData }: UseAppStoreAnalysisParams): UseAppStoreAnalysisReturn {
  // Use smaller hooks for specific concerns
  const state = useAnalyticsState({ initialData });
  const [correlations, setCorrelations] = useState<CorrelationResult[]>([]);
  const [hasCorrelationData, setHasCorrelationData] = useState(false);
  
  // Get the thread context to access the feature-specific thread IDs
  const threadContext = useThreadContext();
  
  // Get the App Store-specific thread and assistant IDs
  const appStoreThreadId = threadContext.getFeatureThreadId('appStore');
  const appStoreAssistantId = threadContext.getFeatureAssistantId('appStore');
  
  // Set up chat with the appStore feature
  const chat = useChat({ feature: 'appStore' });
  
  // Get keyword data to calculate correlations
  const { keywordData } = useKeywordAnalytics();
  
  // Calculate correlations when both data sources are available
  useEffect(() => {
    if (state.processedAnalytics && keywordData && keywordData.length > 0) {
      try {
        const correlationResults = findCrossDomainCorrelations(
          state.processedAnalytics,
          keywordData
        );
        setCorrelations(correlationResults);
        setHasCorrelationData(true);
      } catch (error) {
        console.error("Error calculating correlations:", error);
        setHasCorrelationData(false);
      }
    } else {
      setHasCorrelationData(false);
    }
  }, [state.processedAnalytics, keywordData]);
  
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
    chatThreadId: appStoreThreadId,
    chatAssistantId: appStoreAssistantId,
    correlations,
    hasCorrelationData
  };
}
