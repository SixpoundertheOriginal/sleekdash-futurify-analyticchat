
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { LoadingOverlay } from "./LoadingOverlay";
import { ErrorDisplay } from "./ErrorDisplay";

interface AnalyticsDashboardWrapperProps {
  processedData: ProcessedAnalytics | null;
  initialData: ProcessedAnalytics;
  isProcessing: boolean;
  processingError: string | null;
}

export function AnalyticsDashboardWrapper({
  processedData,
  initialData,
  isProcessing,
  processingError
}: AnalyticsDashboardWrapperProps) {
  return (
    <>
      <div className="relative rounded-lg overflow-hidden transition-all duration-300">
        {isProcessing && <LoadingOverlay />}
        <AnalyticsDashboard data={processedData || initialData} />
      </div>

      {processingError && <ErrorDisplay error={processingError} />}
    </>
  );
}
