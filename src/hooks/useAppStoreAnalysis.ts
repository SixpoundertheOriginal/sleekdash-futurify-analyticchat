import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { parseMetricsFromAnalysis } from "@/utils/analytics/metrics";
import { extractBaseMetrics } from "@/utils/analytics/offline/directExtraction";
import { useChat } from "@/hooks/useChat";
import { useThread } from "@/contexts/thread/ThreadContext";
import { registerAppStoreMetrics } from '@/utils/metrics/adapters/appStoreAdapter';
import { useMetrics } from '@/hooks/useMetrics';

interface UseAppStoreAnalysisProps {
  initialData?: ProcessedAnalytics;
}

export function useAppStoreAnalysis({ initialData }: UseAppStoreAnalysisProps) {
  const [activeTab, setActiveTab] = useState("process");
  const [extractedData, setExtractedData] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ProcessedAnalytics | null>(null);
  const [processedAnalytics, setProcessedAnalytics] = useState<ProcessedAnalytics | null>(null);
  const [directlyExtractedMetrics, setDirectlyExtractedMetrics] = useState<any | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null
  });
  const [isProcessing, setProcessing] = useState(false);
  const [isAnalyzing, setAnalyzing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const { toast } = useToast();
  const { threadId, assistantId } = useThread();
  const { sendMessage } = useChat();

  // Add metrics registry integration
  const { registerMetrics } = useMetrics('appStore');

  // Register initial data if provided
  useEffect(() => {
    if (initialData) {
      registerAppStoreMetrics(initialData, {
        source: 'initial-data',
        confidence: 0.9
      });
    }
  }, [initialData]);

  const handleProcessSuccess = useCallback((extractedData: any) => {
    setProcessing(false);
    setExtractedData(extractedData);
    setProcessingError(null);
    setActiveTab("analysis");

    // Extract base metrics directly from the extracted data
    const baseMetrics = extractBaseMetrics(extractedData);
    setDirectlyExtractedMetrics(baseMetrics);

    // If baseMetrics were extracted, set the processedAnalytics state
    if (baseMetrics) {
      setProcessedAnalytics(baseMetrics);
    }

    // Register metrics if we have processed analytics
    if (processedAnalytics) {
      registerAppStoreMetrics(processedAnalytics, {
        source: 'direct-extraction',
        confidence: 0.8
      });
    }

    toast({
      title: "Data Processed",
      description: "Successfully processed the data and extracted base metrics."
    });
  }, [processedAnalytics, setExtractedData, setProcessing, setProcessingError, setActiveTab, setDirectlyExtractedMetrics, setProcessedAnalytics, toast]);

  const handleAnalysisSuccess = useCallback((result: any) => {
    setAnalyzing(false);
    setAnalysisResult(result);

    // Register metrics from AI analysis
    if (result) {
      registerAppStoreMetrics(result, {
        source: 'ai-analysis',
        confidence: 0.95
      });
    }

    toast({
      title: "Analysis Complete",
      description: "Successfully analyzed the data and extracted insights."
    });
  }, [setAnalyzing, setAnalysisResult, toast]);

  const handleDirectExtractionSuccess = useCallback((analysisText: string) => {
    try {
      const extractedMetrics = parseMetricsFromAnalysis(analysisText);
      setAnalysisResult(extractedMetrics as any);
      toast({
        title: "Direct Extraction Complete",
        description: "Successfully extracted metrics directly from the analysis text."
      });
    } catch (error: any) {
      console.error("Error during direct metric extraction:", error);
      setProcessingError(error.message || "Failed to extract metrics.");
      toast({
        variant: "destructive",
        title: "Extraction Failed",
        description: "Failed to extract metrics directly from the analysis."
      });
    }
  }, [setAnalysisResult, toast]);

  const handleProcessError = (error: string) => {
    setProcessing(false);
    setProcessingError(error);
    toast({
      variant: "destructive",
      title: "Processing Error",
      description: error
    });
  };

  const handleAnalysisError = (error: string) => {
    setAnalyzing(false);
    setProcessingError(error);
    toast({
      variant: "destructive",
      title: "Analysis Error",
      description: error
    });
  };

  const analyzeExtractedData = useCallback(async (analysisPrompt: string) => {
    if (!extractedData) {
      handleAnalysisError("No extracted data to analyze.");
      return;
    }

    setAnalyzing(true);
    try {
      const analysisText = await sendMessage(analysisPrompt, threadId, assistantId);
      if (analysisText) {
        handleDirectExtractionSuccess(analysisText);
      } else {
        handleAnalysisError("Analysis failed to return any results.");
      }
    } catch (error: any) {
      console.error("Analysis failed:", error);
      handleAnalysisError(error.message || "Analysis failed.");
    }
  }, [extractedData, handleAnalysisError, handleDirectExtractionSuccess, sendMessage, threadId, assistantId]);

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
