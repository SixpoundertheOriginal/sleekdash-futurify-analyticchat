
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { DateRange } from "@/components/chat/DateRangePicker";
import { ErrorDisplay } from "../ErrorDisplay";
import { LoadingOverlay } from "../LoadingOverlay";
import { SkeletonWrapper } from "@/components/ui/skeleton-wrapper";
import { ErrorBoundary } from "@/components/ui/error-boundary";

interface AnalyticsDashboardContentProps {
  data: ProcessedAnalytics;
  dateRange: DateRange | null;
  isProcessing: boolean;
  error: string | null;
  onRetry?: () => void;
  onRefresh?: () => void;
}

export function AnalyticsDashboardContent({
  data,
  dateRange,
  isProcessing,
  error,
  onRetry,
  onRefresh
}: AnalyticsDashboardContentProps) {
  return (
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
            data={data} 
            dateRange={dateRange}
            onRefresh={onRefresh}
          />
        </SkeletonWrapper>
      </ErrorBoundary>

      {error && <ErrorDisplay error={error} onRetry={onRetry} />}
    </div>
  );
}
