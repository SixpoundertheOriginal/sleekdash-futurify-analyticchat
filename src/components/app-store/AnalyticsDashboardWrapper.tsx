
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { LoadingOverlay } from "./LoadingOverlay";
import { ErrorDisplay } from "./ErrorDisplay";
import { DateRange } from "@/components/chat/DateRangePicker";
import { SkeletonWrapper } from "@/components/ui/skeleton-wrapper";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useEffect } from "react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, RefreshCw, AlertTriangle } from "lucide-react";

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

  if (!hasData && !isProcessing) {
    return (
      <Card className="p-6 bg-white/5 border-white/10 text-center">
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="bg-primary/10 rounded-full p-4">
            <BarChart className="h-8 w-8 text-primary/70" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">No Analysis Data Available</h3>
            <p className="text-white/60 mb-6">Run an analysis first to see your dashboard with visualized metrics</p>
            <div className="flex justify-center">
              <Button 
                variant="default" 
                className="bg-primary hover:bg-primary/90"
                onClick={onRetry}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Go to Input Tab
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (!hasValidMetrics && !isProcessing) {
    return (
      <Card className="p-6 bg-white/5 border-white/10 text-center">
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="bg-amber-500/10 rounded-full p-4">
            <AlertTriangle className="h-8 w-8 text-amber-500/70" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Limited Data Available</h3>
            <p className="text-white/60 mb-6">The analysis didn't produce enough metrics for visualization</p>
            <div className="flex justify-center">
              <Button 
                variant="default" 
                className="bg-primary hover:bg-primary/90"
                onClick={onRetry}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Another Analysis
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

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
              data={dataToUse} 
              dateRange={dateRange}
            />
          </SkeletonWrapper>
        </ErrorBoundary>
      </div>

      {error && <ErrorDisplay error={error} onRetry={onRetry} />}
    </>
  );
}
