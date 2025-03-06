
import { useEffect } from "react";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { useChat } from "@/hooks/useChat";
import { useThread } from "@/contexts/thread/ThreadContext";
import { registerAppStoreMetrics } from '@/utils/metrics/adapters/appStoreAdapter';
import { useMetrics } from '@/hooks/useMetrics';
import { useAppStoreState } from './app-store/useAppStoreState';
import { useAppStoreHandlers } from './app-store/useAppStoreHandlers';
import { useAppStoreAnalysisActions } from './app-store/useAppStoreAnalysisActions';

interface UseAppStoreAnalysisProps {
  initialData?: ProcessedAnalytics;
}

export function useAppStoreAnalysis({ initialData }: UseAppStoreAnalysisProps = {}) {
  const {
    activeTab,
    setActiveTab,
    extractedData,
    setExtractedData,
    analysisResult,
    setAnalysisResult,
    processedAnalytics,
    setProcessedAnalytics,
    directlyExtractedMetrics,
    setDirectlyExtractedMetrics,
    dateRange,
    setDateRange,
    isProcessing,
    setProcessing,
    isAnalyzing,
    setAnalyzing,
    processingError,
    setProcessingError
  } = useAppStoreState(initialData);

  const { threadId, assistantId } = useThread();
  const chatApi = useChat();
  const { registerMetrics } = useMetrics('appStore');

  const {
    handleProcessSuccess,
    handleAnalysisSuccess,
    handleDirectExtractionSuccess,
    handleProcessError,
    handleAnalysisError
  } = useAppStoreHandlers({
    setProcessing,
    setAnalyzing,
    setExtractedData,
    setAnalysisResult,
    setProcessedAnalytics,
    setDirectlyExtractedMetrics,
    setProcessingError,
    setActiveTab,
    registerMetrics
  });

  const {
    analyzeExtractedData
  } = useAppStoreAnalysisActions({
    extractedData,
    analysisResult,
    setAnalyzing,
    handleAnalysisSuccess,
    handleAnalysisError
  });

  // Register initial metrics if provided
  useEffect(() => {
    if (initialData) {
      registerAppStoreMetrics(initialData, {
        source: 'initial-data',
        confidence: 0.9
      });
    }
  }, [initialData]);

  return {
    activeTab,
    setActiveTab,
    extractedData,
    isProcessing,
    isAnalyzing,
    analysisResult,
    processedAnalytics,
    directlyExtractedMetrics,
    dateRange,
    setDateRange,
    processingError,
    setProcessing,
    setAnalyzing,
    handleProcessSuccess,
    handleAnalysisSuccess,
    handleDirectExtractionSuccess,
    handleProcessError,
    handleAnalysisError,
    analyzeExtractedData,
    chatThreadId: threadId,
    chatAssistantId: assistantId
  };
}
