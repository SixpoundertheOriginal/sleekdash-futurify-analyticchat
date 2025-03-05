
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { LoadingOverlay } from "./LoadingOverlay";
import { ErrorDisplay } from "./ErrorDisplay";
import { DateRange } from "@/components/chat/DateRangePicker";
import { SkeletonWrapper } from "@/components/ui/skeleton-wrapper";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useEffect } from "react";
import { ErrorBoundary } from "@/components/ui/error-boundary";

interface AnalyticsDashboardWrapperProps {
  processedData: ProcessedAnalytics | null;
  initialData: ProcessedAnalytics;
  isProcessing: boolean;
  processingError: string | null;
  dateRange: DateRange | null;
  onRetry?: () => void;
}

export function AnalyticsDashboardWrapper({
  processedData,
  initialData,
  isProcessing,
  processingError,
  dateRange,
  onRetry
}: AnalyticsDashboardWrapperProps) {
  const { error, setError, clearError } = useErrorHandler();
  
  // Sync the external error state with our internal error state
  useEffect(() => {
    if (processingError) {
      setError(processingError);
    } else {
      clearError();
    }
  }, [processingError, setError, clearError]);

  return (
    <>
      <div className="relative rounded-lg overflow-hidden transition-all duration-300">
        {isProcessing && <LoadingOverlay message="Processing analytics data..." />}
        
        <ErrorBoundary>
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
        </ErrorBoundary>
      </div>

      {error && <ErrorDisplay error={error} onRetry={onRetry} />}
    </>
  );
}
