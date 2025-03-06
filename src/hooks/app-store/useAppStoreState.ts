
import { useState } from "react";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";

/**
 * Manages the state for App Store analysis
 */
export function useAppStoreState(initialData?: ProcessedAnalytics) {
  const [activeTab, setActiveTab] = useState("process");
  const [extractedData, setExtractedData] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [processedAnalytics, setProcessedAnalytics] = useState<ProcessedAnalytics | null>(initialData || null);
  const [directlyExtractedMetrics, setDirectlyExtractedMetrics] = useState<any | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null
  });
  const [isProcessing, setProcessing] = useState(false);
  const [isAnalyzing, setAnalyzing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  return {
    // Tab state
    activeTab,
    setActiveTab,
    
    // Data state
    extractedData,
    setExtractedData,
    analysisResult,
    setAnalysisResult,
    processedAnalytics,
    setProcessedAnalytics,
    directlyExtractedMetrics,
    setDirectlyExtractedMetrics,
    
    // Date range state
    dateRange,
    setDateRange,
    
    // Processing state
    isProcessing,
    setProcessing,
    isAnalyzing,
    setAnalyzing,
    processingError,
    setProcessingError,
  };
}
