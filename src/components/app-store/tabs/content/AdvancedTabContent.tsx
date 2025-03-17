
import { TabsContent } from "@/components/ui/tabs";
import { AdvancedDashboard } from "../../AdvancedDashboard";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { DateRange } from "@/components/chat/DateRangePicker";
import { Button } from "@/components/ui/button";

interface AdvancedTabContentProps {
  processedAnalytics: ProcessedAnalytics | null;
  initialData: ProcessedAnalytics | null;
  isLoading: boolean;
  dateRange: DateRange | null;
  onGoToInput: () => void;
}

export function AdvancedTabContent({
  processedAnalytics,
  initialData,
  isLoading,
  dateRange,
  onGoToInput
}: AdvancedTabContentProps) {
  if (processedAnalytics) {
    return (
      <TabsContent value="advanced" className="mt-4 space-y-4">
        <AdvancedDashboard 
          data={processedAnalytics} 
          dateRange={dateRange}
          isLoading={isLoading}
          onRefresh={onGoToInput}
        />
      </TabsContent>
    );
  }
  
  if (initialData) {
    return (
      <TabsContent value="advanced" className="mt-4 space-y-4">
        <AdvancedDashboard 
          data={initialData} 
          dateRange={dateRange}
          isLoading={isLoading}
          onRefresh={onGoToInput}
        />
      </TabsContent>
    );
  }
  
  return (
    <TabsContent value="advanced" className="mt-4 space-y-4">
      <div className="text-center py-8 text-white/60">
        <p>No analytics data available. Run an analysis first.</p>
        <Button 
          variant="default" 
          className="mt-4 bg-primary hover:bg-primary/90"
          onClick={onGoToInput}
        >
          Go to Input Tab
        </Button>
      </div>
    </TabsContent>
  );
}
