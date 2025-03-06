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
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
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
  const chatApi = useChat();
  const sendMessage = chatApi.sendMessage || chatApi.handleSubmit;
  const { registerMetrics } = useMetrics('appStore');

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

    const baseMetrics = extractBaseMetrics(extractedData);
    setDirectlyExtractedMetrics(baseMetrics);

    if (baseMetrics) {
      const analyticsDefaults = createDefaultProcessedAnalytics();
      setProcessedAnalytics({ ...analyticsDefaults, ...baseMetrics });
    }

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

  const handleAnalysisSuccess = useCallback((result: string) => {
    setAnalyzing(false);
    setAnalysisResult(result);
    
    try {
      const extractedMetrics = parseMetricsFromAnalysis(result);
      if (extractedMetrics) {
        const processedResult = createDefaultProcessedAnalytics();
        
        if (Array.isArray(extractedMetrics)) {
          extractedMetrics.forEach(metric => {
            if (metric.metric === "Downloads") {
              processedResult.acquisition.downloads = { 
                value: Number(metric.value.replace(/[^0-9.-]+/g, '')), 
                change: metric.change 
              };
            } else if (metric.metric === "Total Proceeds") {
              processedResult.financial.proceeds = { 
                value: Number(metric.value.replace(/[^0-9.-]+/g, '')), 
                change: metric.change 
              };
            } else if (metric.metric === "Active Users") {
              processedResult.engagement.sessionsPerDevice = { 
                value: Number(metric.value.replace(/[^0-9.-]+/g, '')), 
                change: metric.change 
              };
            } else if (metric.metric === "Crash Count") {
              processedResult.technical.crashes = { 
                value: Number(metric.value.replace(/[^0-9.-]+/g, '')), 
                change: metric.change 
              };
            }
          });
        }
        
        setProcessedAnalytics(processedResult);
        
        registerAppStoreMetrics(processedResult, {
          source: 'ai-analysis',
          confidence: 0.95
        });
      }
    } catch (error) {
      console.error("Error processing analysis result:", error);
    }
    
    toast({
      title: "Analysis Complete",
      description: "Successfully analyzed the data and extracted insights."
    });
  }, [setAnalyzing, setAnalysisResult, toast, registerAppStoreMetrics]);

  const handleDirectExtractionSuccess = useCallback((metrics: Partial<ProcessedAnalytics>) => {
    try {
      const defaultAnalytics = createDefaultProcessedAnalytics();
      
      const processedResult: ProcessedAnalytics = {
        ...defaultAnalytics,
        ...metrics,
        summary: {
          ...defaultAnalytics.summary,
          ...(metrics.summary || {}),
          executiveSummary: metrics.summary?.executiveSummary || "Metrics extracted directly"
        }
      };
      
      setAnalysisResult(JSON.stringify(processedResult));
      setProcessedAnalytics(processedResult);
      
      registerAppStoreMetrics(processedResult, {
        source: 'direct-extraction',
        confidence: 0.8
      });
      
      toast({
        title: "Direct Extraction Complete",
        description: "Successfully extracted metrics directly from the data."
      });
    } catch (error: any) {
      console.error("Error during direct metric extraction:", error);
      setProcessingError(error.message || "Failed to extract metrics.");
      toast({
        variant: "destructive",
        title: "Extraction Failed",
        description: "Failed to extract metrics directly from the data."
      });
    }
  }, [setAnalysisResult, setProcessedAnalytics, toast, registerAppStoreMetrics]);

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
      const mockEvent = {
        preventDefault: () => {},
      } as React.FormEvent<Element>;
      
      await chatApi.handleSubmit(mockEvent);
      
      setTimeout(() => {
        if (analysisResult) {
          handleAnalysisSuccess(analysisResult);
        } else {
          console.log("No analysis result received yet - this might be expected if processing takes time");
        }
      }, 500);
    } catch (error: any) {
      console.error("Analysis failed:", error);
      handleAnalysisError(error.message || "Analysis failed.");
    }
  }, [extractedData, handleAnalysisError, handleAnalysisSuccess, chatApi, analysisResult]);

  const createDefaultProcessedAnalytics = (): ProcessedAnalytics => {
    return {
      summary: {
        title: "App Analytics Report",
        dateRange: "Not specified",
        executiveSummary: ""
      },
      acquisition: {
        impressions: { value: 0, change: 0 },
        pageViews: { value: 0, change: 0 },
        conversionRate: { value: 0, change: 0 },
        downloads: { value: 0, change: 0 },
        funnelMetrics: {
          impressionsToViews: 0,
          viewsToDownloads: 0
        }
      },
      financial: {
        proceeds: { value: 0, change: 0 },
        proceedsPerUser: { value: 0, change: 0 },
        derivedMetrics: {
          arpd: 0,
          revenuePerImpression: 0,
          monetizationEfficiency: 0,
          payingUserPercentage: 0
        }
      },
      engagement: {
        sessionsPerDevice: { value: 0, change: 0 },
        retention: {
          day1: { value: 0, benchmark: 0 },
          day7: { value: 0, benchmark: 0 }
        }
      },
      technical: {
        crashes: { value: 0, change: 0 },
        crashRate: { value: 0, percentile: "average" }
      },
      geographical: {
        markets: [],
        devices: []
      }
    };
  };

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
