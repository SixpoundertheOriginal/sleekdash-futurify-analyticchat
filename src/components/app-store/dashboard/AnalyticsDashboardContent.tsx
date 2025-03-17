
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { DateRange } from "@/components/chat/DateRangePicker";
import { ErrorDisplay } from "../ErrorDisplay";
import { LoadingOverlay } from "../LoadingOverlay";
import { SkeletonWrapper } from "@/components/ui/skeleton-wrapper";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { withErrorBoundary } from "@/components/ui/with-error-boundary";
import { hasValidMetrics } from "@/utils/analytics/validation";

interface AnalyticsDashboardContentProps {
  data: ProcessedAnalytics;
  dateRange: DateRange | null;
  isProcessing: boolean;
  error: string | null;
  onRetry?: () => void;
  onRefresh?: () => void;
}

function DashboardContent({
  data,
  dateRange,
  isProcessing,
  error,
  onRetry,
  onRefresh
}: AnalyticsDashboardContentProps) {
  // Check if we have valid metrics for visualization
  const hasValidVisualizationData = hasValidMetrics(data);

  if (error) {
    return <ErrorDisplay error={error} onRetry={onRetry} />;
  }

  return (
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
        {hasValidVisualizationData ? (
          <AnalyticsDashboard 
            data={data} 
            dateRange={dateRange}
            onRefresh={onRefresh}
          />
        ) : (
          <ErrorDisplay 
            error="Insufficient data for visualization" 
            severity="low" 
            title="Data Validation Warning"
            details="Some required metrics are missing. Try providing more complete data."
            onRetry={onRetry}
            variant="default"
          />
        )}
      </SkeletonWrapper>
    </div>
  );
}

// Use the HOC to wrap the dashboard content with error boundary
export const AnalyticsDashboardContent = withErrorBoundary(DashboardContent, {
  onReset: () => console.log('Dashboard error boundary reset'),
});
