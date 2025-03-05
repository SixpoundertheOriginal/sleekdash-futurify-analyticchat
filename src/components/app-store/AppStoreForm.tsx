
import { useState } from "react";
import { FormHeader } from "./FormHeader";
import { FormInput } from "./FormInput";
import { FormButtons } from "./FormButtons";
import { useAppStoreForm } from "@/hooks/useAppStoreForm";
import { DateRange } from "@/components/chat/DateRangePicker";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

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
    if (!dateRange) {
      toast({
        variant: "destructive",
        title: "Date Range Required",
        description: "Please select a date range before analyzing the data."
      });
      return;
    }
    
    // Add date range info to the app description
    const dateInfo = `Date range: ${format(dateRange.from, "yyyy-MM-dd")} to ${format(dateRange.to, "yyyy-MM-dd")}.\n\n`;
    
    // Process with date range info included
    handleTextCleaningAndProcessing(dateInfo + appDescription);
  };

  const handleAnalyzeOnly = () => {
    if (!dateRange) {
      toast({
        variant: "destructive",
        title: "Date Range Required",
        description: "Please select a date range before analyzing the data."
      });
      return;
    }
    
    // Add date range info to the app description
    const dateInfo = `Date range: ${format(dateRange.from, "yyyy-MM-dd")} to ${format(dateRange.to, "yyyy-MM-dd")}.\n\n`;
    
    // Analyze with date range info included
    handleAnalysis(dateInfo + appDescription);
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
