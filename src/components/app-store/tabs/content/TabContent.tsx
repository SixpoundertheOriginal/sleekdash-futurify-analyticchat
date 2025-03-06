
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AppStoreForm } from "../../AppStoreForm";
import { AnalysisResultCard } from "../../AnalysisResultCard";
import { AnalyticsDashboardWrapper } from "../../AnalyticsDashboardWrapper";
import { AdvancedDashboard } from "../../AdvancedDashboard";
import { ChatInterface } from "@/components/ChatInterface";
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

  return (
    <>
      <TabsContent value="input" className="mt-4 space-y-4">
        <AppStoreForm
          onProcessSuccess={onProcessSuccess}
          onAnalysisSuccess={onAnalysisSuccess}
          onDirectExtractionSuccess={onDirectExtractionSuccess}
          isProcessing={isProcessing}
          isAnalyzing={isAnalyzing}
          setProcessing={setProcessing}
          setAnalyzing={setAnalyzing}
          dateRange={dateRange}
          onDateRangeChange={onDateRangeChange}
          threadId={threadId}
          assistantId={assistantId}
        />
      </TabsContent>
      
      <TabsContent value="analysis" className="mt-4 space-y-4">
        <AnalysisResultCard
          analysisResult={analysisResult}
          isLoading={isAnalyzing}
          isAnalyzing={isAnalyzing}
          dateRange={dateRange}
        />
      </TabsContent>
      
      <TabsContent value="dashboard" className="mt-4 space-y-4">
        <AnalyticsDashboardWrapper
          processedData={processedAnalytics}
          initialData={defaultAnalytics}
          isProcessing={isProcessing}
          processingError={processingError}
          dateRange={dateRange}
          onRetry={() => setActiveTab('input')}
          onRefresh={() => setActiveTab('input')}
        />
      </TabsContent>
      
      <TabsContent value="advanced" className="mt-4 space-y-4">
        {processedAnalytics && (
          <AdvancedDashboard 
            data={processedAnalytics} 
            dateRange={dateRange}
            isLoading={isProcessing || isAnalyzing}
            onRefresh={() => setActiveTab('input')}
          />
        )}
        {!processedAnalytics && initialData && (
          <AdvancedDashboard 
            data={initialData} 
            dateRange={dateRange}
            isLoading={isProcessing || isAnalyzing}
            onRefresh={() => setActiveTab('input')}
          />
        )}
        {!processedAnalytics && !initialData && (
          <div className="text-center py-8 text-white/60">
            <p>No analytics data available. Run an analysis first.</p>
            <Button 
              variant="default" 
              className="mt-4 bg-primary hover:bg-primary/90"
              onClick={() => setActiveTab('input')}
            >
              Go to Input Tab
            </Button>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="chat" className="mt-4 space-y-4">
        <ChatInterface feature="appStore" />
      </TabsContent>
    </>
  );
}
