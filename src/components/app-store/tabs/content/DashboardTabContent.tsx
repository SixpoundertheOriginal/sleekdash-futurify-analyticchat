
import { TabsContent } from "@/components/ui/tabs";
import { AnalyticsDashboardWrapper } from "../../AnalyticsDashboardWrapper";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { DateRange } from "@/components/chat/DateRangePicker";

interface DashboardTabContentProps {
  processedAnalytics: ProcessedAnalytics | null;
  initialData: ProcessedAnalytics;
  isProcessing: boolean;
  processingError: string | null;
  dateRange: DateRange | null;
  onRetry: () => void;
  onRefresh: () => void;
}

export function DashboardTabContent({
  processedAnalytics,
  initialData,
  isProcessing,
  processingError,
  dateRange,
  onRetry,
  onRefresh
}: DashboardTabContentProps) {
  return (
    <TabsContent value="dashboard" className="mt-4 space-y-4">
      <AnalyticsDashboardWrapper
        processedData={processedAnalytics}
        initialData={initialData}
        isProcessing={isProcessing}
        processingError={processingError}
        dateRange={dateRange}
        onRetry={onRetry}
        onRefresh={onRefresh}
      />
    </TabsContent>
  );
}
