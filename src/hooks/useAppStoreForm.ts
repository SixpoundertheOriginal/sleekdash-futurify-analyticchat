
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { extractBaseMetrics } from "@/utils/analytics/offline/directExtraction";

interface UseAppStoreFormProps {
  onProcessSuccess: (data: any) => void;
  onAnalysisSuccess: (analysisResult: string) => void;
  onDirectExtractionSuccess?: (metrics: Partial<ProcessedAnalytics>) => void;
  setProcessing: (processing: boolean) => void;
  setAnalyzing: (analyzing: boolean) => void;
  threadId?: string;
  assistantId?: string;
}

export function useAppStoreForm({
  onProcessSuccess,
  onAnalysisSuccess,
  onDirectExtractionSuccess,
  setProcessing,
  setAnalyzing,
  threadId,
  assistantId
}: UseAppStoreFormProps) {
  const [appDescription, setAppDescription] = useState("");
  const { toast } = useToast();

  // Handle direct extraction of metrics from the input text
  const extractMetricsFromText = (text: string) => {
    if (onDirectExtractionSuccess) {
      try {
        const extractedMetrics = extractBaseMetrics(text);
        if (extractedMetrics && Object.keys(extractedMetrics).length > 0) {
          console.log('Extracted metrics directly from text:', extractedMetrics);
          onDirectExtractionSuccess(extractedMetrics);
        }
      } catch (error) {
        console.error('Error extracting metrics directly:', error);
      }
    }
  };

  // Process text for analytics
  const handleTextCleaningAndProcessing = async (text: string) => {
    if (!text.trim()) {
      toast({
        variant: "destructive",
        title: "Empty Input",
        description: "Please enter App Store data to process"
      });
      return;
    }
    
    setProcessing(true);
    
    try {
      // Try to extract metrics directly from the text first
      extractMetricsFromText(text);
      
      // Process data through Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('process-app-data', {
        body: { appDescription: text }
      });
      
      if (error) {
        throw new Error(`Processing failed: ${error.message}`);
      }
      
      if (!data) {
        throw new Error("No data returned from processing");
      }
      
      // Log the processed data
      console.log("Data processed successfully:", data);
      
      // Call onProcessSuccess with the processed data
      onProcessSuccess(data);
      
      // Now also run analysis since we have processed data
      await handleAnalysis(text, data);
    } catch (error) {
      console.error("Error processing app data:", error);
      toast({
        variant: "destructive",
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Failed to process App Store data"
      });
    } finally {
      setProcessing(false);
    }
  };

  // Analyze the app data
  const handleAnalysis = async (text: string, processedData = null) => {
    if (!text.trim()) {
      toast({
        variant: "destructive",
        title: "Empty Input",
        description: "Please enter App Store data to analyze"
      });
      return;
    }
    
    setAnalyzing(true);
    
    try {
      // Try to extract metrics directly from the text first
      if (!processedData) {
        extractMetricsFromText(text);
      }
      
      // Prepare the request body
      const requestBody: any = { 
        appDescription: text
      };
      
      // Add specific thread and assistant IDs if provided
      if (threadId) {
        requestBody.threadId = threadId;
        console.log(`[useAppStoreForm] Using specified thread ID: ${threadId}`);
      }
      
      if (assistantId) {
        requestBody.assistantId = assistantId;
        console.log(`[useAppStoreForm] Using specified assistant ID: ${assistantId}`);
      }
      
      // Add processed data if available
      if (processedData) {
        requestBody.processedData = processedData;
        console.log(`[useAppStoreForm] Including processed data in analysis request`);
      }
      
      // Call the analyze-app-store function
      const { data, error } = await supabase.functions.invoke('analyze-app-store', {
        body: requestBody
      });
      
      if (error) {
        throw new Error(`Analysis failed: ${error.message}`);
      }
      
      if (!data || !data.analysis) {
        throw new Error("No analysis returned");
      }
      
      // Log the analysis details
      console.log("Analysis successful. Thread ID:", data.threadId);
      console.log("Analysis content length:", data.analysis.length);
      
      // Call onAnalysisSuccess with the analysis result
      onAnalysisSuccess(data.analysis);
      
      toast({
        title: "Analysis Complete",
        description: "App Store data has been analyzed successfully"
      });
    } catch (error) {
      console.error("Error analyzing app data:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze App Store data"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return {
    appDescription,
    setAppDescription,
    handleTextCleaningAndProcessing,
    handleAnalysis
  };
}
