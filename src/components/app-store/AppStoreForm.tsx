
import { useState } from "react";
import { FormHeader } from "./FormHeader";
import { FormInput } from "./FormInput";
import { FormButtons } from "./FormButtons";
import { useAppStoreForm } from "@/hooks/useAppStoreForm";
import { DateRange } from "@/components/chat/DateRangePicker";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { isAppStoreFormat, processAppStoreText } from "@/utils/file-processing";

interface AppStoreFormProps {
  onProcessSuccess: (data: any) => void;
  onAnalysisSuccess: (analysisResult: string) => void;
  isProcessing: boolean;
  isAnalyzing: boolean;
  setProcessing: (processing: boolean) => void;
  setAnalyzing: (analyzing: boolean) => void;
  dateRange: DateRange | null;
}

export function AppStoreForm({
  onProcessSuccess,
  onAnalysisSuccess,
  isProcessing,
  isAnalyzing,
  setProcessing,
  setAnalyzing,
  dateRange
}: AppStoreFormProps) {
  const { toast } = useToast();
  const {
    appDescription,
    setAppDescription,
    handleTextCleaningAndProcessing,
    handleAnalysis
  } = useAppStoreForm(
    onProcessSuccess,
    onAnalysisSuccess,
    setProcessing,
    setAnalyzing
  );

  const handleProcessAndAnalyze = () => {
    if (!dateRange && !isAppStoreFormat(appDescription)) {
      toast({
        variant: "destructive",
        title: "Date Range Required",
        description: "Please select a date range before analyzing the data."
      });
      return;
    }
    
    // Pre-process text if it's in App Store format
    let processedText = appDescription;
    if (isAppStoreFormat(appDescription)) {
      processedText = processAppStoreText(appDescription);
      console.log('Detected App Store format, pre-processed text');
    } else {
      // Add date range info to the app description if not already in App Store format
      const dateInfo = dateRange ? 
        `Date range: ${format(dateRange.from, "yyyy-MM-dd")} to ${format(dateRange.to, "yyyy-MM-dd")}.\n\n` :
        '';
      processedText = dateInfo + appDescription;
    }
    
    // Process with pre-processed text
    handleTextCleaningAndProcessing(processedText);
  };

  const handleAnalyzeOnly = () => {
    if (!dateRange && !isAppStoreFormat(appDescription)) {
      toast({
        variant: "destructive",
        title: "Date Range Required",
        description: "Please select a date range before analyzing the data."
      });
      return;
    }
    
    // Pre-process text if it's in App Store format
    let processedText = appDescription;
    if (isAppStoreFormat(appDescription)) {
      processedText = processAppStoreText(appDescription);
      console.log('Detected App Store format, pre-processed text');
      
      // Add explicit Impressions mention for the analysis if it's in the data
      if (appDescription.includes('Impressions')) {
        processedText += "\n\nPlease include impressions data in the analysis.";
      }
    } else {
      // Add date range info to the app description if not already in App Store format
      const dateInfo = dateRange ? 
        `Date range: ${format(dateRange.from, "yyyy-MM-dd")} to ${format(dateRange.to, "yyyy-MM-dd")}.\n\n` :
        '';
      processedText = dateInfo + appDescription;
    }
    
    // Analyze with pre-processed text
    handleAnalysis(processedText);
  };

  return (
    <div className="space-y-4 border border-white/10 bg-white/5 backdrop-blur-lg p-6 rounded-xl">
      <FormHeader />
      <FormInput 
        value={appDescription} 
        onChange={(e) => setAppDescription(e.target.value)} 
        disabled={isProcessing || isAnalyzing}
      />
      <FormButtons 
        isProcessing={isProcessing}
        isAnalyzing={isAnalyzing}
        appDescription={appDescription}
        onProcessClick={handleProcessAndAnalyze}
        onAnalyzeClick={handleAnalyzeOnly}
      />
    </div>
  );
}
