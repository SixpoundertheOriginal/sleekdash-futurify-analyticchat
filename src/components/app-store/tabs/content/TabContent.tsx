
import { InputTabContent } from "./InputTabContent";
import { AnalysisTabContent } from "./AnalysisTabContent";
import { DashboardTabContent } from "./DashboardTabContent";
import { AdvancedTabContent } from "./AdvancedTabContent";
import { ChatTabContent } from "./ChatTabContent";
import { useAppStore } from "@/contexts/AppStoreContext";
import { createDefaultProcessedAnalytics } from "@/hooks/app-store/appStoreAnalyticsUtils";

export function TabContent() {
  const {
    extractedData,
    analysisResult,
    isProcessing,
    isAnalyzing,
    processedAnalytics,
    directlyExtractedMetrics,
    dateRange,
    setDateRange,
    processingError,
    handleProcessSuccess,
    handleAnalysisSuccess,
    handleDirectExtractionSuccess,
    setProcessing,
    setAnalyzing,
    threadId,
    assistantId,
    goToInputTab
  } = useAppStore();

  return (
    <>
      <InputTabContent 
        isProcessing={isProcessing}
        isAnalyzing={isAnalyzing}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onProcessSuccess={handleProcessSuccess}
        onAnalysisSuccess={handleAnalysisSuccess}
        onDirectExtractionSuccess={handleDirectExtractionSuccess}
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
        initialData={processedAnalytics || createDefaultProcessedAnalytics()}
        isProcessing={isProcessing}
        processingError={processingError}
        dateRange={dateRange}
        onRetry={goToInputTab}
        onRefresh={goToInputTab}
      />
      
      <AdvancedTabContent
        processedAnalytics={processedAnalytics}
        initialData={processedAnalytics}
        isLoading={isProcessing || isAnalyzing}
        dateRange={dateRange}
        onGoToInput={goToInputTab}
      />
      
      <ChatTabContent />
    </>
  );
}
