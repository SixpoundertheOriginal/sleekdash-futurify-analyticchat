
import { useToast } from "@/components/ui/use-toast";
import { ProcessedAnalytics } from "@/utils/analytics/types";
import { processAnalysisText } from "@/utils/analytics/processAnalysis";
import { storeAnalyticsData } from "@/utils/message-content/metrics/persistence";
import { hasValidMetricsForVisualization } from "@/utils/analytics/offline/directExtraction";
import { DateRange } from "@/components/chat/DateRangePicker";

export interface UseAnalyticsHandlersParams {
  setExtractedData: (data: any) => void;
  setAnalysisResult: (result: string) => void;
  setActiveTab: (tab: string) => void;
  setProcessedAnalytics: (data: ProcessedAnalytics) => void;
  setDirectlyExtractedMetrics: (metrics: Partial<ProcessedAnalytics>) => void;
  dateRange: DateRange | null;
  setProcessingError: (error: string | null) => void;
  saveAnalytics: (data: ProcessedAnalytics) => void;
}

export interface UseAnalyticsHandlersReturn {
  handleProcessSuccess: (data: any) => void;
  handleAnalysisSuccess: (analysisText: string) => Promise<void>;
  handleDirectExtractionSuccess: (metrics: Partial<ProcessedAnalytics>) => void;
}

/**
 * Hook to handle analytics-related operations
 */
export function useAnalyticsHandlers({
  setExtractedData,
  setAnalysisResult,
  setActiveTab,
  setProcessedAnalytics,
  setDirectlyExtractedMetrics,
  dateRange,
  setProcessingError,
  saveAnalytics
}: UseAnalyticsHandlersParams): UseAnalyticsHandlersReturn {
  const { toast } = useToast();

  const handleProcessSuccess = (data: any) => {
    setExtractedData(data);
    
    // We might want to show the extraction status here
    if (data && data.success) {
      console.log("Data processed successfully:", data);
    }
  };

  const handleAnalysisSuccess = async (analysisText: string) => {
    // First, set the raw analysis text immediately so it displays
    setAnalysisResult(analysisText);
    console.log("Analysis result set:", analysisText.substring(0, 100) + "...");

    // Switch to analysis tab to show the content
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
          // Correctly assign to processedData with the updated type
          processedData.summary.dateRange = dateRangeStr;
          
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
        
        // Set the processed analytics so it can be used in the dashboard
        setProcessedAnalytics(processedData);
        
        // Save to localStorage
        saveAnalytics(processedData);
        
        toast({
          title: "Data Processed Successfully",
          description: "Your app analytics have been processed and saved. You can view them in the Dashboard.",
          variant: "default"
        });
        
        console.log("Analysis processed to structured data and saved:", processedData);
        
        // Add a button to view the dashboard in the toast
        setTimeout(() => {
          toast({
            title: "Dashboard Ready",
            description: "Your analytics dashboard is now ready to view",
            action: {
              label: "View Dashboard",
              onClick: () => setActiveTab("dashboard")
            },
            duration: 7000,
          });
        }, 1000);
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
      setTimeout(() => {
        setActiveTab("dashboard");
      }, 1000);
    }
  };

  return {
    handleProcessSuccess,
    handleAnalysisSuccess,
    handleDirectExtractionSuccess
  };
}
