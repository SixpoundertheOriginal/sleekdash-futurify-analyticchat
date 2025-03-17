import { TabsContent } from "@/components/ui/tabs";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { useAppStore } from "@/contexts/AppStoreContext";
import { DateRange } from "@/components/chat/DateRangePicker";
import { EmptyDashboardState } from "../../dashboard/EmptyDashboardState";
import { InvalidMetricsState } from "../../dashboard/InvalidMetricsState";
import { AnalyticsDashboardContent } from "../../dashboard/AnalyticsDashboardContent";
import { hasValidMetrics } from "@/utils/analytics/validation";

interface DashboardTabContentProps {
  processedAnalytics: ProcessedAnalytics | null;
  initialData: ProcessedAnalytics;
  isProcessing: boolean;
  processingError: string | null;
  dateRange: DateRange | null;
  onRetry?: () => void;
  onRefresh?: () => void;
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
  const data = processedAnalytics || initialData;
  const hasData = !!processedAnalytics;
  const validMetrics = hasValidMetrics(data);

  return (
    <TabsContent value="dashboard" className="mt-4">
      {!hasData && !isProcessing && (
        <EmptyDashboardState onRetry={onRetry} />
      )}
      
      {hasData && !validMetrics && !isProcessing && (
        <InvalidMetricsState onRetry={onRetry} />
      )}
      
      {(hasData && validMetrics) || isProcessing ? (
        <AnalyticsDashboardContent
          data={data}
          dateRange={dateRange}
          isProcessing={isProcessing}
          error={processingError}
          onRetry={onRetry}
          onRefresh={onRefresh}
        />
      ) : null}
    </TabsContent>
  );
}

export function DashboardTabContentWithContext() {
  const { 
    processedAnalytics, 
    getEffectiveAnalytics, 
    isProcessing, 
    processingError, 
    dateRange, 
    goToInputTab,
    hasData
  } = useAppStore();
  
  const data = getEffectiveAnalytics() || processedAnalytics;
  const validMetrics = data ? hasValidMetrics(data) : false;

  return (
    <TabsContent value="dashboard" className="mt-4">
      {!hasData() && !isProcessing && (
        <EmptyDashboardState onRetry={goToInputTab} />
      )}
      
      {hasData() && !validMetrics && !isProcessing && (
        <InvalidMetricsState onRetry={goToInputTab} />
      )}
      
      {(hasData() && validMetrics) || isProcessing ? (
        <AnalyticsDashboardContent
          data={data!}
          dateRange={dateRange}
          isProcessing={isProcessing}
          error={processingError}
          onRetry={goToInputTab}
          onRefresh={goToInputTab}
        />
      ) : null}
    </TabsContent>
  );
}
