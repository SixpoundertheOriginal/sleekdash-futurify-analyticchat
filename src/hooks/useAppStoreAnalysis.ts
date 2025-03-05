
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
  // Fix: Get the actual sendMessage function
  const chatApi = useChat();
  const sendMessage = chatApi.sendMessage || chatApi.handleSubmit;

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
      // Fix: Ensure we're setting a full ProcessedAnalytics object by merging with defaults
      const analyticsDefaults = createDefaultProcessedAnalytics();
      setProcessedAnalytics({ ...analyticsDefaults, ...baseMetrics });
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

  const handleAnalysisSuccess = useCallback((result: string) => {
    setAnalyzing(false);
    setAnalysisResult(result);
    
    try {
      // Try to parse the analysis text and create processed analytics
      const extractedMetrics = parseMetricsFromAnalysis(result);
      if (extractedMetrics) {
        // Create a properly structured ProcessedAnalytics object
        const processedResult = createDefaultProcessedAnalytics();
        
        // Update the processed result with metrics extracted from analysis
        if (Array.isArray(extractedMetrics)) {
          extractedMetrics.forEach(metric => {
            // Map extracted metrics to the appropriate fields
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
        
        // Update state with the processed analytics
        setProcessedAnalytics(processedResult);
        
        // Register metrics from AI analysis
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

  // Update the parameter type to match expected usage
  const handleDirectExtractionSuccess = useCallback((metrics: Partial<ProcessedAnalytics>) => {
    try {
      // Create default analytics object to ensure we have required properties
      const defaultAnalytics = createDefaultProcessedAnalytics();
      
      // Merge the extracted metrics with the default structure
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
      
      // Register the metrics
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
      // Fix: Use the properly accessed sendMessage function
      const analysisText = await sendMessage(analysisPrompt, threadId, assistantId);
      if (analysisText) {
        // Pass the analysis text to handleAnalysisSuccess which will process it
        handleAnalysisSuccess(analysisText);
      } else {
        handleAnalysisError("Analysis failed to return any results.");
      }
    } catch (error: any) {
      console.error("Analysis failed:", error);
      handleAnalysisError(error.message || "Analysis failed.");
    }
  }, [extractedData, handleAnalysisError, handleAnalysisSuccess, sendMessage, threadId, assistantId]);

  // Helper function to create a default ProcessedAnalytics object
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
