
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";

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
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-white font-medium">Processing analytics data...</p>
            </div>
          </div>
        )}
        <AnalyticsDashboard data={processedData || initialData} />
      </div>

      {processingError && (
        <Card className="p-4 bg-rose-500/10 border-rose-500/20 rounded-lg">
          <p className="text-rose-500">Error processing analysis data: {processingError}</p>
        </Card>
      )}
    </>
  );
}
