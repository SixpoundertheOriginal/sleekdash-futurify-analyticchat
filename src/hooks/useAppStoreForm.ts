
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { extractBaseMetrics } from "@/utils/analytics/offline/directExtraction";
import { isAppStoreFormat, preprocessAppStoreData } from "@/utils/analytics/offline/appStoreFormatDetector";
import { handleEdgeFunctionError } from "@/services/api";
import { extractorService } from "@/utils/analytics/extractors/ExtractorService";

export interface UseAppStoreFormProps {
  onProcessSuccess: (data: any) => void;
  onAnalysisSuccess: (analysisResult: string) => void;
  onDirectExtractionSuccess?: (metrics: Partial<ProcessedAnalytics>) => void;
  setProcessing: (processing: boolean) => void;
  setAnalyzing: (analyzing: boolean) => void;
  threadId?: string;
  assistantId?: string;
}

export interface UseAppStoreFormReturn {
  appDescription: string;
  setAppDescription: (description: string) => void;
  handleTextCleaningAndProcessing: (text: string) => Promise<void>;
  handleAnalysis: (text: string, processedData?: any | null) => Promise<void>;
}

export function useAppStoreForm({
  onProcessSuccess,
  onAnalysisSuccess,
  onDirectExtractionSuccess,
  setProcessing,
  setAnalyzing,
  threadId,
  assistantId
}: UseAppStoreFormProps): UseAppStoreFormReturn {
  const [appDescription, setAppDescription] = useState("");
  const { toast } = useToast();

  // Handle direct extraction of metrics from the input text
  const extractMetricsFromText = (text: string) => {
    if (!text.trim() || !onDirectExtractionSuccess) return;
    
    try {
      console.log('Attempting direct extraction from text...');
      
      // Preprocess App Store format if detected
      const processedText = isAppStoreFormat(text) ? preprocessAppStoreData(text) : text;
      
      // First try to extract using the extraction pipeline for better results
      const pipelineResult = extractorService.processAppStoreData(processedText);
      
      if (pipelineResult.success && pipelineResult.data) {
        console.log('Extracted metrics using pipeline:', pipelineResult.data);
        onDirectExtractionSuccess(pipelineResult.data);
        return;
      }
      
      // Fallback to basic extraction if pipeline fails
      const extractedMetrics = extractBaseMetrics(processedText);
      if (extractedMetrics && Object.keys(extractedMetrics).length > 0) {
        console.log('Extracted metrics directly from text:', extractedMetrics);
        onDirectExtractionSuccess(extractedMetrics);
      } else {
        console.log('No metrics could be extracted directly');
      }
    } catch (error) {
      console.error('Error extracting metrics directly:', error);
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
      // Preprocess App Store format if detected
      const processedText = isAppStoreFormat(text) ? preprocessAppStoreData(text) : text;
      
      // Try to extract metrics directly from the text first
      extractMetricsFromText(text);
      
      // Process data through Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('process-app-data', {
        body: { 
          rawText: processedText, // Use processed text for better results
          threadId,
          assistantId
        }
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
      // Preprocess App Store format if detected
      const processedText = isAppStoreFormat(text) ? preprocessAppStoreData(text) : text;
      
      // Try to extract metrics directly from the text first
      if (!processedData) {
        extractMetricsFromText(processedText);
      }
      
      // Prepare the request body
      const requestBody: any = { 
        rawText: processedText // Use processed text for better results
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
        const errorMessage = handleEdgeFunctionError(error);
        throw new Error(`Analysis failed: ${errorMessage}`);
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
      
      // Provide more helpful error messages based on the error type
      let errorMessage = "Failed to analyze App Store data";
      
      if (error instanceof Error) {
        // Check for common Edge Function errors
        if (error.message.includes("Can't add messages to thread") && error.message.includes("while a run")) {
          errorMessage = "Analysis is already in progress. Please wait for it to complete.";
        } else if (error.message.includes("Edge Function")) {
          errorMessage = "Connection issue with the analysis service. Please try again in a moment.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: errorMessage
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
