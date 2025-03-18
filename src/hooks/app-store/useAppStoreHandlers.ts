
import { useToast } from "@/components/ui/use-toast";
import { useCallback } from "react";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { parseMetricsFromAnalysis } from "@/utils/analytics/metrics";
import { extractBaseMetrics } from "@/utils/analytics/offline/directExtraction";
import { registerAppStoreMetrics } from '@/utils/metrics/adapters/appStoreAdapter';
import { createDefaultProcessedAnalytics } from "./appStoreAnalyticsUtils";

interface UseAppStoreHandlersProps {
  setProcessing: (isProcessing: boolean) => void;
  setAnalyzing: (isAnalyzing: boolean) => void;
  setExtractedData: (data: string | null) => void;
  setAnalysisResult: (result: string | null) => void;
  setProcessedAnalytics: (analytics: ProcessedAnalytics | null) => void;
  setDirectlyExtractedMetrics: (metrics: any | null) => void;
  setProcessingError: (error: string | null) => void;
  setActiveTab: (tab: string) => void;
  registerMetrics: (metrics: any, options?: any) => void;
}

export function useAppStoreHandlers({
  setProcessing,
  setAnalyzing,
  setExtractedData,
  setAnalysisResult,
  setProcessedAnalytics,
  setDirectlyExtractedMetrics,
  setProcessingError,
  setActiveTab,
  registerMetrics
}: UseAppStoreHandlersProps) {
  const { toast } = useToast();

  const handleProcessSuccess = useCallback((extractedData: any) => {
    setProcessing(false);
    setExtractedData(extractedData);
    setProcessingError(null);
    
    // Direct to extraction tab instead of analysis
    setActiveTab("extraction");

    const baseMetrics = extractBaseMetrics(extractedData);
    setDirectlyExtractedMetrics(baseMetrics);

    if (baseMetrics) {
      const analyticsDefaults = createDefaultProcessedAnalytics();
      setProcessedAnalytics({ ...analyticsDefaults, ...baseMetrics });

      registerAppStoreMetrics(baseMetrics, {
        source: 'direct-extraction',
        confidence: 0.8
      });
    }

    toast({
      title: "Data Processed",
      description: "Your data is ready for KPI extraction."
    });
  }, [setExtractedData, setProcessing, setProcessingError, setActiveTab, setDirectlyExtractedMetrics, setProcessedAnalytics, toast, registerMetrics]);

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
        
        // Change: Redirect to metrics tab instead of dashboard
        setActiveTab("metrics");
      }
    } catch (error) {
      console.error("Error processing analysis result:", error);
    }
    
    toast({
      title: "Analysis Complete",
      description: "Review extracted metrics in the Metrics tab before visualization."
    });
  }, [setAnalyzing, setAnalysisResult, setProcessedAnalytics, toast, registerMetrics, setActiveTab]);

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
      
      // Change: Redirect to metrics tab
      setActiveTab("metrics");
      
      toast({
        title: "Direct Extraction Complete",
        description: "Review extracted metrics in the Metrics tab before visualization."
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
  }, [setAnalysisResult, setProcessedAnalytics, setProcessingError, toast, registerMetrics, setActiveTab]);

  const handleProcessError = useCallback((error: string) => {
    setProcessing(false);
    setProcessingError(error);
    toast({
      variant: "destructive",
      title: "Processing Error",
      description: error
    });
  }, [setProcessing, setProcessingError, toast]);

  const handleAnalysisError = useCallback((error: string) => {
    setAnalyzing(false);
    setProcessingError(error);
    toast({
      variant: "destructive",
      title: "Analysis Error",
      description: error
    });
  }, [setAnalyzing, setProcessingError, toast]);

  return {
    handleProcessSuccess,
    handleAnalysisSuccess,
    handleDirectExtractionSuccess,
    handleProcessError,
    handleAnalysisError
  };
}
