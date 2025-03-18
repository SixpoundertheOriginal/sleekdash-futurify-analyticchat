
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { ProcessedAnalytics } from "@/utils/analytics/types";
import { DateRange } from "@/components/chat/DateRangePicker";
import { ErrorDisplay } from "../ErrorDisplay";
import { LoadingOverlay } from "../LoadingOverlay";
import { SkeletonWrapper } from "@/components/ui/skeleton-wrapper";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { withErrorBoundary } from "@/components/ui/with-error-boundary";
import { useAnalyticsValidation } from "@/hooks/useAnalyticsValidation";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Info } from "lucide-react";
import { useAppStore } from "@/contexts/AppStoreContext";

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
  const { validateAnalytics } = useAnalyticsValidation();
  const [validationResult, setValidationResult] = useState<ReturnType<typeof validateAnalytics> | null>(null);
  
  // Validate the data whenever it changes
  useEffect(() => {
    if (data) {
      const result = validateAnalytics(data);
      setValidationResult(result);
      console.log('Analytics validation result:', result);
    }
  }, [data]);

  if (error) {
    return <ErrorDisplay error={error} onRetry={onRetry} />;
  }

  // Check if we have valid metrics for visualization
  const hasValidVisualizationData = data && data.acquisition && 
    (data.acquisition.downloads?.value > 0 || data.acquisition.impressions?.value > 0);
  
  // Show validation warnings if there are any
  const showValidationWarnings = validationResult && 
    (validationResult.warnings.length > 0 || validationResult.suspiciousValues.length > 0);

  return (
    <div className="relative rounded-lg overflow-hidden transition-all duration-300">
      {isProcessing && <LoadingOverlay message="Processing analytics data..." />}
      
      {/* Show validation warnings */}
      {showValidationWarnings && !isProcessing && (
        <Alert variant={validationResult.severity === 'high' ? "destructive" : 
               validationResult.severity === 'medium' ? "warning" : "default"}
              className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Data Quality Warning</AlertTitle>
          <AlertDescription>
            <div className="text-sm">
              {validationResult.warnings.length > 0 && (
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {validationResult.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              )}
              <div className="mt-2 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5" />
                <span>Confidence score: {validationResult.confidence}%</span>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
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

// Create a connected version of the dashboard that pulls from context
function ConnectedDashboardContent({
  onRetry,
  onRefresh
}: {
  onRetry?: () => void;
  onRefresh?: () => void;
}) {
  const {
    processedAnalytics,
    dateRange,
    isProcessing,
    processingError,
    goToInputTab
  } = useAppStore();
  
  // Use provided callbacks or fallback to context methods
  const handleRetry = onRetry || goToInputTab;
  const handleRefresh = onRefresh || goToInputTab;
  
  // If no data is available, show error
  if (!processedAnalytics) {
    return (
      <ErrorDisplay 
        error="No analytics data available" 
        severity="medium"
        title="Missing Data"
        details="Please input your app store data to see analytics."
        onRetry={handleRetry}
        variant="default"
      />
    );
  }
  
  return (
    <DashboardContent 
      data={processedAnalytics}
      dateRange={dateRange}
      isProcessing={isProcessing}
      error={processingError}
      onRetry={handleRetry}
      onRefresh={handleRefresh}
    />
  );
}

// Use the HOC to wrap the dashboard content with error boundary
export const AnalyticsDashboardContent = withErrorBoundary(DashboardContent, {
  onReset: () => console.log('Dashboard error boundary reset'),
});

// Export the connected version as well
export const ConnectedAnalyticsDashboardContent = withErrorBoundary(ConnectedDashboardContent, {
  onReset: () => console.log('Connected dashboard error boundary reset'),
});
