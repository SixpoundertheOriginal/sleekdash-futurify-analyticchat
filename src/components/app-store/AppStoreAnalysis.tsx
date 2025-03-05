
import { LoadingOverlay } from "./LoadingOverlay";
import { AppStoreTabs } from "./tabs/AppStoreTabs";
import { useAppStoreAnalysis } from "@/hooks/useAppStoreAnalysis";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";

interface AppStoreAnalysisProps {
  initialData?: ProcessedAnalytics;
}

export function AppStoreAnalysis({ initialData }: AppStoreAnalysisProps) {
  const {
    activeTab,
    setActiveTab,
    extractedData,
    isProcessing,
    isAnalyzing,
    analysisResult,
    processedAnalytics,
    directlyExtractedMetrics,
    dateRange,
    setDateRange,
    processingError,
    setProcessing,
    setAnalyzing,
    handleProcessSuccess,
    handleAnalysisSuccess,
    handleDirectExtractionSuccess,
    chatThreadId,
    chatAssistantId
  } = useAppStoreAnalysis({ initialData });

  // Log thread and assistant IDs for debugging
  console.log(`[AppStoreAnalysis] Using thread ID: ${chatThreadId}`);
  console.log(`[AppStoreAnalysis] Using assistant ID: ${chatAssistantId}`);

  return (
    <div className="space-y-6 relative">
      {(isProcessing || isAnalyzing) && <LoadingOverlay />}
      
      <AppStoreTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        extractedData={extractedData}
        analysisResult={analysisResult}
        isProcessing={isProcessing}
        isAnalyzing={isAnalyzing}
        processedAnalytics={processedAnalytics}
        directlyExtractedMetrics={directlyExtractedMetrics}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        initialData={initialData || null}
        processingError={processingError}
        onProcessSuccess={handleProcessSuccess}
        onAnalysisSuccess={handleAnalysisSuccess}
        onDirectExtractionSuccess={handleDirectExtractionSuccess}
        setProcessing={setProcessing}
        setAnalyzing={setAnalyzing}
        threadId={chatThreadId}
        assistantId={chatAssistantId}
      />
    </div>
  );
}
