
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
      
      // Automatically trigger analysis for better UX
      handleAnalysis(text);
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

      // Create a comprehensive analysis result with sections that our processing will expect
      const analysisResult = `
App Store Analysis Report

Summary:
The app has shown significant growth during this period with key metrics trending positively.

Acquisition:
- Downloads: 7,910 (+15%)
- Impressions: 120,500 (+23%)
- Product Page Views: 24,300 (+18%)
- Conversion Rate: 2.84% (+10%)

Engagement:
- Sessions per Active Device: 4.2 (+8%)
- Average Session Duration: 5.3 minutes (+12%)
- Retention D1: 45% (+5%)
- Retention D7: 28% (+3%)

Monetization:
- Proceeds: $4,740 (+20%)
- Average Revenue Per User: $0.60 (+15%)
- In-App Purchases: 1,850 (+25%)
- Subscription Conversions: 320 (+18%)

Technical Performance:
- Crashes: 116 (-25%)
- App Store Rating: 4.5 (+0.3)
- App Size: 45MB (unchanged)

Recommendations:
1. Continue optimization of App Store listing to maintain conversion rate improvements
2. Focus on D7 retention with targeted push notifications
3. Investigate opportunities to increase revenue per active user
4. Maintain technical performance improvements to keep crash rates low
      `;
      
      console.log("Analysis result generated:", analysisResult.length, "characters");
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
