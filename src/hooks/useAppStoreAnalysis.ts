
import { useEffect } from "react";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { useChat } from "@/hooks/useChat";
import { useThread } from "@/contexts/thread/ThreadContext";
import { registerAppStoreMetrics } from '@/utils/metrics/adapters/appStoreAdapter';
import { useMetrics } from '@/hooks/useMetrics';
import { useAppStoreState } from './app-store/useAppStoreState';
import { useAppStoreHandlers } from './app-store/useAppStoreHandlers';
import { useAppStoreAnalysisActions } from './app-store/useAppStoreAnalysisActions';
import { useAppStoreAnalysisData } from './app-store/useAppStoreAnalysisData';

interface UseAppStoreAnalysisProps {
  initialData?: ProcessedAnalytics;
}

/**
 * Main hook for App Store analysis, separating concerns using composition pattern
 */
export function useAppStoreAnalysis({ initialData }: UseAppStoreAnalysisProps = {}) {
  // Get state from app store state hook
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

  // Get thread context
  const { threadId, assistantId } = useThread();
  const chatApi = useChat();
  const { registerMetrics } = useMetrics('appStore');

  // Get handlers for different operations
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

  // Get analysis actions
  const {
    analyzeExtractedData
  } = useAppStoreAnalysisActions({
    extractedData,
    analysisResult,
    setAnalyzing,
    handleAnalysisSuccess,
    handleAnalysisError
  });

  // Get computed data properties
  const analysisData = useAppStoreAnalysisData({
    processedAnalytics,
    initialData: initialData || null,
    dateRange,
    isProcessing,
    isAnalyzing,
    extractedData,
    analysisResult
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
    // Basic state
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
    
    // State setters
    setProcessing,
    setAnalyzing,
    
    // Handlers
    handleProcessSuccess,
    handleAnalysisSuccess,
    handleDirectExtractionSuccess,
    handleProcessError,
    handleAnalysisError,
    
    // Actions
    analyzeExtractedData,
    
    // Data utilities
    ...analysisData,
    
    // Chat context
    chatThreadId: threadId,
    chatAssistantId: assistantId
  };
}
