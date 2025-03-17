
import { InputTabContent } from "./InputTabContent";
import { AnalysisTabContent } from "./AnalysisTabContent";
import { DashboardTabContent } from "./DashboardTabContent";
import { AdvancedTabContent } from "./AdvancedTabContent";
import { ChatTabContent } from "./ChatTabContent";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { DateRange } from "@/components/chat/DateRangePicker";
import { createDefaultProcessedAnalytics } from "@/hooks/app-store/appStoreAnalyticsUtils";

interface TabContentProps {
  activeTab: string;
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
  setActiveTab: (tab: string) => void;
}

export function TabContent({
  activeTab,
  extractedData,
  analysisResult,
  isProcessing,
  isAnalyzing,
  processedAnalytics,
  directlyExtractedMetrics,
  dateRange,
  onDateRangeChange,
  initialData,
  processingError,
  onProcessSuccess,
  onAnalysisSuccess,
  onDirectExtractionSuccess,
  setProcessing,
  setAnalyzing,
  threadId,
  assistantId,
  setActiveTab
}: TabContentProps) {
  const defaultAnalytics = initialData || createDefaultProcessedAnalytics();
  const goToInputTab = () => setActiveTab('input');

  return (
    <>
      <InputTabContent 
        isProcessing={isProcessing}
        isAnalyzing={isAnalyzing}
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
        onProcessSuccess={onProcessSuccess}
        onAnalysisSuccess={onAnalysisSuccess}
        onDirectExtractionSuccess={onDirectExtractionSuccess}
        setProcessing={setProcessing}
        setAnalyzing={setAnalyzing}
        threadId={threadId}
        assistantId={assistantId}
      />
      
      <AnalysisTabContent
        analysisResult={analysisResult}
        isAnalyzing={isAnalyzing}
        dateRange={dateRange}
      />
      
      <DashboardTabContent
        processedAnalytics={processedAnalytics}
        initialData={defaultAnalytics}
        isProcessing={isProcessing}
        processingError={processingError}
        dateRange={dateRange}
        onRetry={goToInputTab}
        onRefresh={goToInputTab}
      />
      
      <AdvancedTabContent
        processedAnalytics={processedAnalytics}
        initialData={initialData}
        isLoading={isProcessing || isAnalyzing}
        dateRange={dateRange}
        onGoToInput={goToInputTab}
      />
      
      <ChatTabContent />
    </>
  );
}
