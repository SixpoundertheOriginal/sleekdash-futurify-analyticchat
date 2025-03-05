
import { useState } from "react";
import { ProcessedAnalytics } from "@/utils/analytics/types";
import { DateRange } from "@/components/chat/DateRangePicker";

export interface UseAnalyticsStateParams {
  initialData?: ProcessedAnalytics;
}

export interface UseAnalyticsStateReturn {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  extractedData: any;
  setExtractedData: React.Dispatch<React.SetStateAction<any>>;
  isProcessing: boolean;
  setProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  isAnalyzing: boolean;
  setAnalyzing: React.Dispatch<React.SetStateAction<boolean>>;
  analysisResult: string | null;
  setAnalysisResult: React.Dispatch<React.SetStateAction<string | null>>;
  processedAnalytics: ProcessedAnalytics | null;
  setProcessedAnalytics: React.Dispatch<React.SetStateAction<ProcessedAnalytics | null>>;
  directlyExtractedMetrics: Partial<ProcessedAnalytics> | null;
  setDirectlyExtractedMetrics: React.Dispatch<React.SetStateAction<Partial<ProcessedAnalytics> | null>>;
  dateRange: DateRange | null;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange | null>>;
  processingError: string | null;
  setProcessingError: React.Dispatch<React.SetStateAction<string | null>>;
}

/**
 * Hook to manage the state of analytics data
 */
export function useAnalyticsState({ initialData }: UseAnalyticsStateParams): UseAnalyticsStateReturn {
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
