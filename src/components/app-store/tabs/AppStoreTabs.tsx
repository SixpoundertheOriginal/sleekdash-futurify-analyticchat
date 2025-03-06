import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppStoreForm } from "../AppStoreForm";
import { AnalysisResultCard } from "../AnalysisResultCard";
import { AdvancedDashboard } from "../AdvancedDashboard";
import { AnalyticsDashboardWrapper } from "../AnalyticsDashboardWrapper";
import { HistoricalAnalytics } from "../HistoricalAnalytics";
import { DataExtractionStatus } from "../DataExtractionStatus";
import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { DateRange } from "@/components/chat/DateRangePicker";
import { useEffect } from "react";

interface AppStoreTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  extractedData: any;
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
  onDirectExtractionSuccess: (metrics: Partial<ProcessedAnalytics>) => void;
  setProcessing: (processing: boolean) => void;
  setAnalyzing: (analyzing: boolean) => void;
  threadId?: string;
  assistantId?: string;
}

export function AppStoreTabs({
  activeTab,
  setActiveTab,
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
  assistantId
}: AppStoreTabsProps) {
  const dashboardData = processedAnalytics || directlyExtractedMetrics as ProcessedAnalytics || initialData;
  
  const isLoadingAnalysis = isProcessing || isAnalyzing;

  useEffect(() => {
    console.log("AppStoreTabs - Current tab:", activeTab);
    console.log("AppStoreTabs - Analysis result available:", !!analysisResult);
    console.log("AppStoreTabs - Processed analytics available:", !!processedAnalytics);
    console.log("AppStoreTabs - Directly extracted metrics available:", !!directlyExtractedMetrics);
    console.log("AppStoreTabs - Dashboard data:", dashboardData);
  }, [activeTab, analysisResult, processedAnalytics, directlyExtractedMetrics, dashboardData]);

  useEffect(() => {
    if (activeTab === "dashboard" && analysisResult && !processedAnalytics) {
      console.log("Dashboard tab active but processed analytics not available. Attempting to process analysis...");
      onAnalysisSuccess(analysisResult);
    }
  }, [activeTab, analysisResult, processedAnalytics, onAnalysisSuccess]);

  const handleViewDashboard = () => {
    setActiveTab("dashboard");
  };

  const handleRefreshDashboard = () => {
    console.log("Refreshing dashboard with data from analysis tab");
    
    if (analysisResult) {
      onAnalysisSuccess(analysisResult);
    } else if (extractedData) {
      try {
        onDirectExtractionSuccess(extractedData);
      } catch (error) {
        console.error("Error refreshing dashboard with extracted data:", error);
      }
    } else {
      setActiveTab("input");
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 w-full bg-white/5 p-1">
        <TabsTrigger value="input">Input Data</TabsTrigger>
        <TabsTrigger value="analysis">Analysis</TabsTrigger>
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
      </TabsList>
      
      <TabsContent value="input" className="pt-4">
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
        
        {extractedData && (
          <div className="mt-4">
            <DataExtractionStatus extractedData={extractedData} />
          </div>
        )}
        
        <div className="flex items-start mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <Info className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-white/80">
            <p className="font-medium mb-1">How to use this tool:</p>
            <p>Paste your App Store Connect analytics data here and we'll analyze it for you. First select the date range, then copy the data directly from the App Store Connect dashboard or export as text.</p>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="analysis" className="pt-4">
        <AnalysisResultCard 
          analysisResult={analysisResult} 
          isLoading={isLoadingAnalysis}
          onViewDashboard={handleViewDashboard}
        />
      </TabsContent>
      
      <TabsContent value="dashboard" className="pt-4">
        {dashboardData ? (
          <AdvancedDashboard 
            data={dashboardData} 
            dateRange={dateRange}
            isLoading={isProcessing || isAnalyzing}
            onRefresh={handleRefreshDashboard}
          />
        ) : (
          <AnalyticsDashboardWrapper 
            initialData={initialData || {} as ProcessedAnalytics}
            processedData={processedAnalytics}
            isProcessing={isProcessing}
            processingError={processingError}
            dateRange={dateRange}
            onRetry={() => setActiveTab("input")}
          />
        )}
        
        <div className="mt-6">
          <HistoricalAnalytics />
        </div>
      </TabsContent>
    </Tabs>
  );
}
