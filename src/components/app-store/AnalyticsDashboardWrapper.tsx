
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { DateRange } from "@/components/chat/DateRangePicker";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useEffect } from "react";
import { EmptyDashboardState } from "./dashboard/EmptyDashboardState";
import { InvalidMetricsState } from "./dashboard/InvalidMetricsState";
import { AnalyticsDashboardContent } from "./dashboard/AnalyticsDashboardContent";

interface AnalyticsDashboardWrapperProps {
  processedData: ProcessedAnalytics | null;
  initialData: ProcessedAnalytics;
  isProcessing: boolean;
  processingError: string | null;
  dateRange: DateRange | null;
  onRetry?: () => void;
  onRefresh?: () => void;
}

export function AnalyticsDashboardWrapper({
  processedData,
  initialData,
  isProcessing,
  processingError,
  dateRange,
  onRetry,
  onRefresh
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

  // Check if we have meaningful data to display
  const hasData = processedData !== null;
  const dataToUse = processedData || initialData;
  
  // Check if the data has valid metrics
  const hasValidMetrics = 
    dataToUse?.acquisition?.downloads?.value > 0 || 
    dataToUse?.financial?.proceeds?.value > 0 ||
    dataToUse?.engagement?.sessionsPerDevice?.value > 0;

  // Show empty state when no data is available
  if (!hasData && !isProcessing) {
    return <EmptyDashboardState onRetry={onRetry} />;
  }

  // Show invalid metrics state when data doesn't have meaningful metrics
  if (!hasValidMetrics && !isProcessing) {
    return <InvalidMetricsState onRetry={onRetry} />;
  }

  // Show the dashboard content when data is valid
  return (
    <AnalyticsDashboardContent
      data={dataToUse}
      dateRange={dateRange}
      isProcessing={isProcessing}
      error={error}
      onRetry={onRetry}
      onRefresh={onRefresh}
    />
  );
}
