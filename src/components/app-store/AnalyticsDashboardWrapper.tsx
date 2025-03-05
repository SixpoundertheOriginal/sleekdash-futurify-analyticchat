
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { LoadingOverlay } from "./LoadingOverlay";
import { ErrorDisplay } from "./ErrorDisplay";
import { DateRange } from "@/components/chat/DateRangePicker";

interface AnalyticsDashboardWrapperProps {
  processedData: ProcessedAnalytics | null;
  initialData: ProcessedAnalytics;
  isProcessing: boolean;
  processingError: string | null;
  dateRange: DateRange | null;
}

export function AnalyticsDashboardWrapper({
  processedData,
  initialData,
  isProcessing,
  processingError,
  dateRange
}: AnalyticsDashboardWrapperProps) {
  return (
    <>
      <div className="relative rounded-lg overflow-hidden transition-all duration-300">
        {isProcessing && <LoadingOverlay />}
        <AnalyticsDashboard 
          data={processedData || initialData} 
          dateRange={dateRange}
        />
      </div>

      {processingError && <ErrorDisplay error={processingError} />}
    </>
  );
}
