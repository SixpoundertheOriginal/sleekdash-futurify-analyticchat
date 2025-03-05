
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { LoadingOverlay } from "./LoadingOverlay";
import { ErrorDisplay } from "./ErrorDisplay";
import { DateRange } from "@/components/chat/DateRangePicker";
import { SkeletonWrapper } from "@/components/ui/skeleton-wrapper";

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
        {isProcessing && <LoadingOverlay message="Processing analytics data..." />}
        
        <SkeletonWrapper 
          isLoading={isProcessing} 
          className="space-y-4 p-6"
          items={[
            { height: "60px", width: "100%", className: "rounded-md" },
            { height: "120px", width: "100%", className: "rounded-md" },
            { height: "200px", width: "100%", className: "rounded-md" }
          ]}
        >
          <AnalyticsDashboard 
            data={processedData || initialData} 
            dateRange={dateRange}
          />
        </SkeletonWrapper>
      </div>

      {processingError && <ErrorDisplay error={processingError} />}
    </>
  );
}
