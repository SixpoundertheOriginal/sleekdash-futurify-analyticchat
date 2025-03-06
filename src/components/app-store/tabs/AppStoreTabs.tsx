
import { Tabs } from "@/components/ui/tabs";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { DateRange } from "@/components/chat/DateRangePicker";
import { useDevice } from "@/hooks/use-mobile";
import { TabNavigation } from "./navigation/TabNavigation";
import { TabTriggers } from "./navigation/TabTriggers";
import { TabContent } from "./content/TabContent";
import { Button } from "@/components/ui/button";

interface AppStoreTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  extractedData: string | null;
  analysisResult: string | null;
  isProcessing: boolean;
  isAnalyzing: boolean;
  processedAnalytics: ProcessedAnalytics | null;
  directlyExtractedMetrics: Partial<ProcessedAnalytics> | null;
  dateRange: DateRange | null;
  onDateRangeChange: (dateRange: DateRange | null) => void;
  initialData: ProcessedAnalytics | null;
  processingError: string | null;
  onProcessSuccess: (data: any) => void;
  onAnalysisSuccess: (analysisResult: string) => void;
  onDirectExtractionSuccess?: (metrics: Partial<ProcessedAnalytics>) => void;
  setProcessing: (processing: boolean) => void;
  setAnalyzing: (analyzing: boolean) => void;
  threadId?: string;
  assistantId?: string;
}

export function AppStoreTabs(props: AppStoreTabsProps) {
  const deviceType = useDevice();
  const isMobile = deviceType === 'mobile';

  return (
    <Tabs
      defaultValue="input"
      value={props.activeTab}
      onValueChange={props.setActiveTab}
      className="w-full"
    >
      <div className="flex justify-between items-center border-b border-white/10 px-4">
        <TabTriggers isMobile={isMobile} />
        <TabNavigation activeTab={props.activeTab} setActiveTab={props.setActiveTab} />
      </div>
      
      <TabContent {...props} />
    </Tabs>
  );
}
