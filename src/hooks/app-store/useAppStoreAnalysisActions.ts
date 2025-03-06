
import { useCallback } from "react";
import { useChat } from "@/hooks/useChat";

interface UseAppStoreAnalysisActionsProps {
  extractedData: string | null;
  analysisResult: string | null;
  setAnalyzing: (isAnalyzing: boolean) => void;
  handleAnalysisSuccess: (result: string) => void;
  handleAnalysisError: (error: string) => void;
}

export function useAppStoreAnalysisActions({
  extractedData,
  analysisResult,
  setAnalyzing,
  handleAnalysisSuccess,
  handleAnalysisError
}: UseAppStoreAnalysisActionsProps) {
  const chatApi = useChat();

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
  }, [extractedData, setAnalyzing, handleAnalysisSuccess, handleAnalysisError, chatApi, analysisResult]);

  return {
    analyzeExtractedData
  };
}
