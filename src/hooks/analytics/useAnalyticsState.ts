
import { useState } from "react";
import { ProcessedAnalytics } from "@/utils/analytics/types";
import { DateRange } from "@/components/chat/DateRangePicker";

interface UseAnalyticsStateParams {
  initialData?: ProcessedAnalytics;
}

/**
 * Hook to manage the state of analytics data
 */
export function useAnalyticsState({ initialData }: UseAnalyticsStateParams) {
  const [activeTab, setActiveTab] = useState("input");
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isProcessing, setProcessing] = useState(false);
  const [isAnalyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [processedAnalytics, setProcessedAnalytics] = useState<ProcessedAnalytics | null>(initialData || null);
  const [directlyExtractedMetrics, setDirectlyExtractedMetrics] = useState<Partial<ProcessedAnalytics> | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);

  return {
    activeTab,
    setActiveTab,
    extractedData,
    setExtractedData,
    isProcessing,
    setProcessing,
    isAnalyzing,
    setAnalyzing,
    analysisResult,
    setAnalysisResult,
    processedAnalytics,
    setProcessedAnalytics,
    directlyExtractedMetrics,
    setDirectlyExtractedMetrics,
    dateRange,
    setDateRange,
    processingError,
    setProcessingError
  };
}
