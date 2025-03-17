
import { TabsContent } from "@/components/ui/tabs";
import { AppStoreForm } from "../../AppStoreForm";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { DateRange } from "@/components/chat/DateRangePicker";

interface InputTabContentProps {
  isProcessing: boolean;
  isAnalyzing: boolean;
  dateRange: DateRange | null;
  onDateRangeChange: (dateRange: DateRange | null) => void;
  onProcessSuccess: (data: any) => void;
  onAnalysisSuccess: (analysisResult: string) => void;
  onDirectExtractionSuccess?: (metrics: Partial<ProcessedAnalytics>) => void;
  setProcessing: (processing: boolean) => void;
  setAnalyzing: (analyzing: boolean) => void;
  threadId?: string;
  assistantId?: string;
}

export function InputTabContent({
  isProcessing,
  isAnalyzing,
  dateRange,
  onDateRangeChange,
  onProcessSuccess,
  onAnalysisSuccess,
  onDirectExtractionSuccess,
  setProcessing,
  setAnalyzing,
  threadId,
  assistantId
}: InputTabContentProps) {
  return (
    <TabsContent value="input" className="mt-4 space-y-4">
      <AppStoreForm
        onProcessSuccess={onProcessSuccess}
        onAnalysisSuccess={onAnalysisSuccess}
        onDirectExtractionSuccess={onDirectExtractionSuccess}
        isProcessing={isProcessing}
        isAnalyzing={isAnalyzing}
        setProcessing={setProcessing}
        setAnalyzing={setAnalyzing}
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
        threadId={threadId}
        assistantId={assistantId}
      />
    </TabsContent>
  );
}
