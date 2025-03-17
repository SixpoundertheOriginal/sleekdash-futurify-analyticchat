
import { useCallback } from "react";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { DateRange } from "@/components/chat/DateRangePicker";

interface UseAppStoreAnalysisDataProps {
  processedAnalytics: ProcessedAnalytics | null;
  initialData: ProcessedAnalytics | null;
  dateRange: DateRange | null;
  isProcessing: boolean;
  isAnalyzing: boolean;
  extractedData: string | null;
  analysisResult: string | null;
}

/**
 * Hook for accessing and deriving data from app store analysis state
 */
export function useAppStoreAnalysisData({
  processedAnalytics,
  initialData,
  dateRange,
  isProcessing,
  isAnalyzing,
  extractedData,
  analysisResult
}: UseAppStoreAnalysisDataProps) {
  
  // Get the effective analytics data (either processed or initial data)
  const getEffectiveAnalytics = useCallback(() => {
    return processedAnalytics || initialData || null;
  }, [processedAnalytics, initialData]);

  // Check if any data is available
  const hasData = useCallback(() => {
    return !!processedAnalytics || !!initialData;
  }, [processedAnalytics, initialData]);

  // Check if any analysis data is available
  const hasAnalysisData = useCallback(() => {
    return !!analysisResult || !!extractedData;
  }, [analysisResult, extractedData]);

  // Format date range for display
  const getFormattedDateRange = useCallback(() => {
    if (!dateRange?.from || !dateRange?.to) {
      return "Date range not specified";
    }
    return `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`;
  }, [dateRange]);

  return {
    getEffectiveAnalytics,
    hasData,
    hasAnalysisData,
    getFormattedDateRange,
    isLoading: isProcessing || isAnalyzing
  };
}
