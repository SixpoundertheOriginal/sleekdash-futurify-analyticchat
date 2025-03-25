
import { TabsContent } from "@/components/ui/tabs";
import { AnalyticsDashboardContent } from "../../dashboard/AnalyticsDashboardContent";
import { EmptyDashboardState } from "../../dashboard/EmptyDashboardState";
import { InvalidMetricsState } from "../../dashboard/InvalidMetricsState";
import { hasValidMetrics } from "@/utils/analytics/validation";
import { useAppStore, useAnalytics, useUI } from "@/store";

export function ZustandDashboardTabContent() {
  // Use the Zustand store instead of the context
  const { processedAnalytics, getEffectiveAnalytics, hasData, dateRange } = useAnalytics();
  const { isProcessing, processingError, goToInputTab } = useUI();
  
  const data = getEffectiveAnalytics();
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
