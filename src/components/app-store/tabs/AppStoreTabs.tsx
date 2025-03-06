
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { AppStoreForm } from "../AppStoreForm";
import { AnalyticsDashboardWrapper } from "../AnalyticsDashboardWrapper";
import { AnalysisResultCard } from "../AnalysisResultCard";
import { DateRange } from "@/components/chat/DateRangePicker";
import { AdvancedDashboard } from "../AdvancedDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatInterface } from "@/components/ChatInterface";
import { Button } from "@/components/ui/button";
import { useDevice } from "@/hooks/use-mobile";
import { ArrowLeft, ArrowRight, FileText, BarChart, PieChart, MessageSquare } from "lucide-react";

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
  const deviceType = useDevice();
  const isMobile = deviceType === 'mobile';
  
  // Define the tabs order for navigation
  const tabsOrder = ['input', 'analysis', 'dashboard', 'advanced', 'chat'];
  
  // Add the navigateTab function
  const navigateTab = (direction: 'prev' | 'next') => {
    const currentIndex = tabsOrder.indexOf(activeTab);
    if (direction === 'prev' && currentIndex > 0) {
      setActiveTab(tabsOrder[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < tabsOrder.length - 1) {
      setActiveTab(tabsOrder[currentIndex + 1]);
    }
  };
  
  const defaultAnalytics: ProcessedAnalytics = {
    summary: {
      title: "App Analytics",
      dateRange: "",
      executiveSummary: ""
    },
    acquisition: {
      impressions: { value: 0, change: 0 },
      pageViews: { value: 0, change: 0 },
      conversionRate: { value: 0, change: 0 },
      downloads: { value: 0, change: 0 },
      funnelMetrics: {
        impressionsToViews: 0,
        viewsToDownloads: 0
      }
    },
    financial: {
      proceeds: { value: 0, change: 0 },
      proceedsPerUser: { value: 0, change: 0 },
      derivedMetrics: {
        arpd: 0,
        revenuePerImpression: 0,
        monetizationEfficiency: 0,
        payingUserPercentage: 0
      }
    },
    engagement: {
      sessionsPerDevice: { value: 0, change: 0 },
      retention: {
        day1: { value: 0, benchmark: 0 },
        day7: { value: 0, benchmark: 0 }
      }
    },
    technical: {
      crashes: { value: 0, change: 0 },
      crashRate: { value: 0, percentile: "average" }
    },
    geographical: {
      markets: [],
      devices: []
    }
  };
  
  const initialProcessedData = processedAnalytics || 
    (initialData && directlyExtractedMetrics ? 
      { ...initialData, ...directlyExtractedMetrics } : 
      initialData || defaultAnalytics);
  
  return (
    <Tabs
      defaultValue="input"
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <div className="flex justify-between items-center border-b border-white/10 px-4">
        <TabsList className="bg-transparent overflow-x-auto max-w-full hide-scrollbar">
          <TabsTrigger value="input" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <FileText className="h-4 w-4 mr-2" />
            <span className={isMobile ? "hidden" : "inline"}>Input</span>
          </TabsTrigger>
          <TabsTrigger value="analysis" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <PieChart className="h-4 w-4 mr-2" />
            <span className={isMobile ? "hidden" : "inline"}>Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <BarChart className="h-4 w-4 mr-2" />
            <span className={isMobile ? "hidden" : "inline"}>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <BarChart className="h-4 w-4 mr-2" />
            <span className={isMobile ? "hidden" : "inline"}>Advanced</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <MessageSquare className="h-4 w-4 mr-2" />
            <span className={isMobile ? "hidden" : "inline"}>Chat</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateTab('prev')}
            disabled={activeTab === 'input'}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateTab('next')}
            disabled={activeTab === 'chat'}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
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
          initialData={initialData || defaultAnalytics}
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
    </Tabs>
  );
}
