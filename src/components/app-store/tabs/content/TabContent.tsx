
import { InputTabContent } from "./InputTabContent";
import { AnalysisTabContent } from "./AnalysisTabContent";
import { DashboardTabContent } from "./DashboardTabContent";
import { AdvancedTabContent } from "./AdvancedTabContent";
import { ChatTabContent } from "./ChatTabContent";
import { DataExtractionTabContent } from "./DataExtractionTabContent";
import { TabsContent } from "@/components/ui/tabs";
import { useAppStore } from "@/contexts/AppStoreContext";
import { createDefaultProcessedAnalytics } from "@/hooks/app-store/appStoreAnalyticsUtils";

export function TabContent() {
  const {
    activeTab,
    setActiveTab,
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
      <TabsContent value="input">
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
      </TabsContent>
      
      <TabsContent value="extraction">
        <DataExtractionTabContent
          setActiveTab={setActiveTab}
        />
      </TabsContent>
      
      <TabsContent value="analysis">
        <AnalysisTabContent
          analysisResult={analysisResult}
          isAnalyzing={isAnalyzing}
          dateRange={dateRange}
        />
      </TabsContent>
      
      <TabsContent value="dashboard">
        <DashboardTabContent
          processedAnalytics={processedAnalytics}
          initialData={processedAnalytics || createDefaultProcessedAnalytics()}
          isProcessing={isProcessing}
          processingError={processingError}
          dateRange={dateRange}
          onRetry={goToInputTab}
          onRefresh={goToInputTab}
        />
      </TabsContent>
      
      <TabsContent value="advanced">
        <AdvancedTabContent
          processedAnalytics={processedAnalytics}
          initialData={processedAnalytics}
          isLoading={isProcessing || isAnalyzing}
          dateRange={dateRange}
          onGoToInput={goToInputTab}
        />
      </TabsContent>
      
      <TabsContent value="chat">
        <ChatTabContent />
      </TabsContent>
    </>
  );
}
