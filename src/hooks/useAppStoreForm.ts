import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { extractDirectMetrics, hasValidMetricsForVisualization } from '@/utils/analytics/offline/directExtraction';

interface UseAppStoreFormParams {
  onProcessSuccess: (data: any) => void;
  onAnalysisSuccess: (analysisResult: string) => void;
  onDirectExtractionSuccess?: (metrics: Partial<ProcessedAnalytics>) => void;
  setProcessing: (processing: boolean) => void;
  setAnalyzing: (analyzing: boolean) => void;
}

export const useAppStoreForm = ({
  onProcessSuccess,
  onAnalysisSuccess,
  onDirectExtractionSuccess,
  setProcessing,
  setAnalyzing
}: UseAppStoreFormParams) => {
  const [appDescription, setAppDescription] = useState("");
  const { toast } = useToast();

  // Function to perform direct extraction of metrics
  const performDirectExtraction = (text: string) => {
    try {
      console.log('Performing direct extraction before OpenAI processing');
      const extractedMetrics = extractDirectMetrics(text);
      
      if (hasValidMetricsForVisualization(extractedMetrics)) {
        console.log('Direct extraction found valid metrics');
        onDirectExtractionSuccess?.(extractedMetrics);
      } else {
        console.log('Direct extraction did not find enough valid metrics');
      }
    } catch (error) {
      console.error('Error during direct extraction:', error);
    }
  };

  const handleTextCleaningAndProcessing = async (text: string) => {
    // First perform direct extraction to get immediate metrics
    performDirectExtraction(text);
    
    // Then continue with regular processing
    setProcessing(true);
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate data extraction
      const extractedData = {
        success: true,
        message: "Data extracted successfully",
        metrics: {
          downloads: 1234,
          revenue: "$5,678",
          activeUsers: 500
        }
      };
      onProcessSuccess(extractedData);
      toast({
        title: "Data Extracted",
        description: "App store data has been successfully extracted."
      });
    } catch (error) {
      console.error("Error during text cleaning and processing:", error);
      toast({
        variant: "destructive",
        title: "Processing Error",
        description: "Failed to process app store data."
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleAnalysis = async (text: string) => {
    // First perform direct extraction to get immediate metrics
    performDirectExtraction(text);
    
    // Then continue with regular analysis
    setAnalyzing(true);
    try {
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate analysis result
      const analysisResult = `
        App Store Analysis Report:

        Key Metrics:
        - Downloads: Increased by 15%
        - Revenue: Increased by 20%
        - User Engagement: Improved by 10%

        Executive Summary:
        The app has shown significant growth in downloads and revenue. User engagement has also improved, indicating a positive trend.
      `;
      onAnalysisSuccess(analysisResult);
      toast({
        title: "Analysis Complete",
        description: "App store data has been successfully analyzed."
      });
    } catch (error) {
      console.error("Error during analysis:", error);
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: "Failed to analyze app store data."
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
};
