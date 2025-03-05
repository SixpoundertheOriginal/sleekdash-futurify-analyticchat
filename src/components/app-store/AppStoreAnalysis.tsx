
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { AppStoreForm } from "./AppStoreForm";
import { AnalysisResultCard } from "./AnalysisResultCard";
import { DataExtractionStatus } from "./DataExtractionStatus";
import { AdvancedDashboard } from "./AdvancedDashboard";
import { AnalyticsDashboardWrapper } from "./AnalyticsDashboardWrapper";
import { HistoricalAnalytics } from "./HistoricalAnalytics";
import { LoadingOverlay } from "./LoadingOverlay";
import { Info } from "lucide-react";
import { DateRange } from "@/components/chat/DateRangePicker";
import { processAnalysisText, ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { saveAnalyticsToStorage, getAnalyticsFromStorage } from "@/utils/analytics/storage";
import { useToast } from "@/components/ui/use-toast";

interface AppStoreAnalysisProps {
  initialData?: ProcessedAnalytics;
}

export function AppStoreAnalysis({ initialData }: AppStoreAnalysisProps) {
  const [activeTab, setActiveTab] = useState("input");
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isProcessing, setProcessing] = useState(false);
  const [isAnalyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [processedAnalytics, setProcessedAnalytics] = useState<ProcessedAnalytics | null>(initialData || null);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Load data from localStorage on component mount
  useEffect(() => {
    if (!processedAnalytics) {
      const storedData = getAnalyticsFromStorage();
      if (storedData) {
        console.log("Loaded analytics data from storage:", storedData);
        setProcessedAnalytics(storedData);
        // If we have data, switch to the dashboard tab
        setActiveTab("dashboard");
      }
    }
  }, [processedAnalytics]);

  const handleProcessSuccess = (data: any) => {
    setExtractedData(data);
    
    // We might want to show the extraction status here
    if (data && data.success) {
      console.log("Data processed successfully:", data);
    }
  };

  const handleAnalysisSuccess = (analysisText: string) => {
    setAnalysisResult(analysisText);
    setActiveTab("analysis");
    
    try {
      // Process analysis text to structured data
      console.log("Processing analysis text to structured data...");
      const processedData = processAnalysisText(analysisText);
      console.log("Processed data:", processedData);
      
      // Check if we have valid metrics
      const hasValidMetrics = 
        processedData.acquisition.downloads.value > 0 || 
        processedData.financial.proceeds.value > 0 ||
        processedData.engagement.sessionsPerDevice.value > 0 ||
        processedData.technical.crashes.value > 0;
      
      if (!hasValidMetrics) {
        console.warn("Warning: No valid metrics found in processed data");
        toast({
          title: "Limited Data Extracted",
          description: "We couldn't extract all metrics from the analysis. The dashboard might show limited information.",
          variant: "destructive"
        });
      } else {
        setProcessedAnalytics(processedData);
        // Save to localStorage
        saveAnalyticsToStorage(processedData);
        toast({
          title: "Data Processed Successfully",
          description: "Your app analytics have been processed and saved. You can view them in the Dashboard.",
          variant: "default"
        });
        console.log("Analysis processed to structured data and saved:", processedData);
        
        // Automatically switch to dashboard tab after a short delay
        setTimeout(() => {
          setActiveTab("dashboard");
        }, 2000);
      }
    } catch (error) {
      console.error("Error processing analysis text:", error);
      setProcessingError(error instanceof Error ? error.message : "Error processing analysis text");
      toast({
        title: "Processing Error",
        description: "There was an error processing the analysis. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6 relative">
      {(isProcessing || isAnalyzing) && <LoadingOverlay />}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full bg-white/5 p-1">
          <TabsTrigger value="input">Input Data</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>
        
        <TabsContent value="input" className="pt-4">
          <AppStoreForm 
            onProcessSuccess={handleProcessSuccess}
            onAnalysisSuccess={handleAnalysisSuccess}
            isProcessing={isProcessing}
            isAnalyzing={isAnalyzing}
            setProcessing={setProcessing}
            setAnalyzing={setAnalyzing}
            dateRange={dateRange}
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
              <p>Paste your App Store Connect analytics data here and we'll analyze it for you. Copy the data directly from the App Store Connect dashboard or export as text.</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="analysis" className="pt-4">
          {analysisResult ? (
            <AnalysisResultCard analysisResult={analysisResult} />
          ) : (
            <Card className="p-6 bg-white/5 border-white/10">
              <p className="text-white/60">Submit your app data for analysis to see results here.</p>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="dashboard" className="pt-4">
          {processedAnalytics ? (
            <AdvancedDashboard 
              data={processedAnalytics} 
              dateRange={dateRange}
              isLoading={isProcessing || isAnalyzing}
            />
          ) : (
            <AnalyticsDashboardWrapper 
              initialData={initialData || {} as ProcessedAnalytics}
              processedData={null}
              isProcessing={isProcessing}
              processingError={processingError}
              dateRange={dateRange}
            />
          )}
          
          <div className="mt-6">
            <HistoricalAnalytics />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
