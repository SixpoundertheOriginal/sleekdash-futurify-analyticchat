
import { useState, useEffect } from "react";
import { ProcessedAnalytics, processAnalysisText } from "@/utils/analytics/processAnalysis";
import { saveAnalyticsToStorage, getAnalyticsFromStorage } from "@/utils/analytics/storage";
import { useToast } from "@/components/ui/use-toast";
import { DateRange } from "@/components/chat/DateRangePicker";
import { hasValidMetricsForVisualization } from "@/utils/analytics/offline/directExtraction";
import { storeAnalyticsData } from "@/utils/message-content/metrics/persistence";

interface UseAppStoreAnalysisParams {
  initialData?: ProcessedAnalytics;
}

export function useAppStoreAnalysis({ initialData }: UseAppStoreAnalysisParams) {
  const [activeTab, setActiveTab] = useState("input");
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isProcessing, setProcessing] = useState(false);
  const [isAnalyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [processedAnalytics, setProcessedAnalytics] = useState<ProcessedAnalytics | null>(initialData || null);
  const [directlyExtractedMetrics, setDirectlyExtractedMetrics] = useState<Partial<ProcessedAnalytics> | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Load data from localStorage on component mount
  useEffect(() => {
    if (!processedAnalytics) {
      const storedData = getAnalyticsFromStorage();
      if (storedData) {
        console.log("Loaded analytics data from storage:", storedData);
        setProcessedAnalytics(storedData);
        // If we have data, switch to the dashboard tab
        setActiveTab("dashboard");
      }
    }
  }, [processedAnalytics]);

  const handleProcessSuccess = (data: any) => {
    setExtractedData(data);
    
    // We might want to show the extraction status here
    if (data && data.success) {
      console.log("Data processed successfully:", data);
    }
  };

  const handleAnalysisSuccess = async (analysisText: string) => {
    setAnalysisResult(analysisText);
    setActiveTab("analysis");
    
    try {
      // Process analysis text to structured data
      console.log("Processing analysis text to structured data...");
      const processedData = processAnalysisText(analysisText);
      console.log("Processed data:", processedData);
      
      // Check if we have valid metrics
      const hasValidMetrics = 
        processedData.acquisition.downloads.value > 0 || 
        processedData.financial.proceeds.value > 0 ||
        processedData.engagement.sessionsPerDevice.value > 0 ||
        processedData.technical.crashes.value > 0;
      
      if (!hasValidMetrics) {
        console.warn("Warning: No valid metrics found in processed data");
        toast({
          title: "Limited Data Extracted",
          description: "We couldn't extract all metrics from the analysis. The dashboard might show limited information.",
          variant: "destructive"
        });
      } else {
        // Format date range string for storage
        let dateRangeStr = "";
        if (dateRange && dateRange.from && dateRange.to) {
          dateRangeStr = `${dateRange.from.toISOString().split('T')[0]} to ${dateRange.to.toISOString().split('T')[0]}`;
          processedData.dateRange = dateRangeStr;
          
          // Store data in Supabase
          try {
            const stored = await storeAnalyticsData(processedData, dateRangeStr);
            if (stored) {
              console.log("Analytics data stored in Supabase");
            }
          } catch (error) {
            console.error("Error storing data in Supabase:", error);
          }
        }
        
        setProcessedAnalytics(processedData);
        // Save to localStorage
        saveAnalyticsToStorage(processedData);
        toast({
          title: "Data Processed Successfully",
          description: "Your app analytics have been processed and saved. You can view them in the Dashboard.",
          variant: "default"
        });
        console.log("Analysis processed to structured data and saved:", processedData);
        
        // Automatically switch to dashboard tab after a short delay
        setTimeout(() => {
          setActiveTab("dashboard");
        }, 2000);
      }
    } catch (error) {
      console.error("Error processing analysis text:", error);
      setProcessingError(error instanceof Error ? error.message : "Error processing analysis text");
      toast({
        title: "Processing Error",
        description: "There was an error processing the analysis. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle direct metric extraction results
  const handleDirectExtractionSuccess = (metrics: Partial<ProcessedAnalytics>) => {
    console.log("Direct extraction successful:", metrics);
    setDirectlyExtractedMetrics(metrics);
    
    // If we have valid metrics, show a notification that the dashboard is ready
    if (hasValidMetricsForVisualization(metrics)) {
      toast({
        title: "Dashboard Preview Ready",
        description: "Initial metrics have been extracted. You can view the dashboard while waiting for the full analysis.",
        variant: "default"
      });
      
      // Auto-switch to dashboard tab if we're still on input tab
      if (activeTab === "input" && !isProcessing && !isAnalyzing) {
        setTimeout(() => {
          setActiveTab("dashboard");
        }, 1000);
      }
    }
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
    handleDirectExtractionSuccess
  };
}
