
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useThread } from "@/contexts/ThreadContext";
import { storeAnalyticsData } from "@/utils/message-content/metrics/persistence";

export function useAppStoreForm(
  onProcessSuccess: (data: any) => void,
  onAnalysisSuccess: (analysisResult: string) => void,
  setProcessing: (processing: boolean) => void,
  setAnalyzing: (analyzing: boolean) => void
) {
  const [appDescription, setAppDescription] = useState("");
  const { toast } = useToast();
  const { threadId, appStoreAssistantId } = useThread();

  const handleTextCleaningAndProcessing = async (text: string = appDescription.trim()) => {
    if (!text) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please paste your app store data to analyze."
      });
      return;
    }

    try {
      setProcessing(true);
      console.log('Processing app description:', text.substring(0, 100) + "...");
      
      const { data, error } = await supabase.functions.invoke('process-app-data', {
        body: { 
          rawText: text,
          threadId: threadId,
          assistantId: appStoreAssistantId
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Processing failed');

      onProcessSuccess(data);
      
      // Extract date range for storage
      const dateRange = data.data.dateRange || "Unknown date range";
      
      // Store processed metrics in Supabase for historical tracking
      if (data.data.metrics && data.data.validation.isValid) {
        try {
          // Combine metrics and changes into one object for storage
          const metricsForStorage = {
            ...data.data.metrics.acquisitionMetrics,
            ...data.data.metrics.financialMetrics,
            ...data.data.metrics.engagementMetrics,
            ...data.data.metrics.technicalMetrics,
            changes: data.data.changes
          };
          
          // Store metrics in Supabase
          await storeAnalyticsData(metricsForStorage, dateRange);
        } catch (storageError) {
          console.error('Error storing analytics data:', storageError);
          // Continue with analysis even if storage fails
        }
      }
      
      toast({
        title: "Data Processed",
        description: data.message || "Your app store data has been processed.",
        variant: data.data.validation.isValid ? "default" : "destructive"
      });

      // If confidence is low, show a warning but continue
      if (data.data.validation.confidence < 70) {
        toast({
          variant: "default",
          title: "Low Confidence",
          description: `We're ${data.data.validation.confidence}% confident in the extracted data. Please verify the results.`
        });
      }

      // If the data is valid, proceed with the AI analysis
      if (data.data.validation.isValid) {
        await handleAnalysis(text, data.data);
      }
    } catch (error) {
      console.error('Processing error:', error);
      toast({
        variant: "destructive",
        title: "Processing Error",
        description: error instanceof Error 
          ? `Failed to process data: ${error.message}`
          : "Failed to process app store data."
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleAnalysis = async (text: string = appDescription.trim(), processedData?: any) => {
    if (!text) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please paste your app store data to analyze."
      });
      return;
    }

    try {
      setAnalyzing(true);
      console.log('Submitting app description for analysis:', text.substring(0, 100) + "...");
      console.log('Using thread ID:', threadId);
      console.log('Using App Store assistant ID:', appStoreAssistantId);

      // Include any pre-processed data if available
      const dataToSend = processedData 
        ? { 
            appDescription: text,
            threadId: threadId,
            assistantId: appStoreAssistantId,
            processedData: processedData
          }
        : { 
            appDescription: text,
            threadId: threadId,
            assistantId: appStoreAssistantId
          };

      const { data, error } = await supabase.functions.invoke('analyze-app-store', {
        body: dataToSend
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Analysis failed');
      if (!data.analysis) throw new Error('No analysis results found');

      onAnalysisSuccess(data.analysis);
      setAppDescription("");
      toast({
        title: "Analysis Complete",
        description: "Your app store data has been analyzed successfully."
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: error instanceof Error 
          ? `Failed to analyze: ${error.message}`
          : "Failed to analyze app store data."
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
