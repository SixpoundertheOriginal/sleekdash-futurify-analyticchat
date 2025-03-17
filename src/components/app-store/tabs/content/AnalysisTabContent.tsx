
import { TabsContent } from "@/components/ui/tabs";
import { AnalysisResultCard } from "../../AnalysisResultCard";
import { DateRange } from "@/components/chat/DateRangePicker";

interface AnalysisTabContentProps {
  analysisResult: string | null;
  isAnalyzing: boolean;
  dateRange: DateRange | null;
}

export function AnalysisTabContent({
  analysisResult,
  isAnalyzing,
  dateRange
}: AnalysisTabContentProps) {
  return (
    <TabsContent value="analysis" className="mt-4 space-y-4">
      <AnalysisResultCard
        analysisResult={analysisResult}
        isLoading={isAnalyzing}
        isAnalyzing={isAnalyzing}
        dateRange={dateRange}
      />
    </TabsContent>
  );
}
