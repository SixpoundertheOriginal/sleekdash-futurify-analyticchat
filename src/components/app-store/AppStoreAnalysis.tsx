
import { useState } from "react";
import { useAnalysisData } from "@/hooks/useAnalysisData";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { AppStoreForm } from "./AppStoreForm";
import { DataExtractionStatus } from "./DataExtractionStatus";
import { AdvancedDashboard } from "./AdvancedDashboard";
import { AnalysisResultCard } from "./AnalysisResultCard";
import { DateRangePicker, DateRange } from "@/components/chat/DateRangePicker";
import { HistoricalAnalytics } from "./HistoricalAnalytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InfoCircle } from "lucide-react";

interface AppStoreAnalysisProps {
  initialData: ProcessedAnalytics;
}

export function AppStoreAnalysis({ initialData }: AppStoreAnalysisProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const { data: processedData, error: processingError, isProcessing } = useAnalysisData(analysisResult);

  const handleProcessSuccess = (data: any) => {
    setExtractedData(data);
  };

  const handleAnalysisSuccess = (result: string) => {
    setAnalysisResult(result);
  };

  const handleDateRangeChange = (range: DateRange | null) => {
    setDateRange(range);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">App Store Analytics</h2>
        <div className="w-[300px]">
          <DateRangePicker 
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
          />
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard">Analytics Dashboard</TabsTrigger>
          <TabsTrigger value="historical">Historical Data</TabsTrigger>
          <TabsTrigger value="input">Input Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <div className="space-y-6">
            <AdvancedDashboard 
              data={processedData || initialData}
              dateRange={dateRange}
              isLoading={isProcessing}
            />
            
            {analysisResult && (
              <div className="mt-8">
                <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                  <InfoCircle className="h-5 w-5 text-primary" />
                  AI Analysis
                </h3>
                <AnalysisResultCard analysisResult={analysisResult} />
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="historical">
          <HistoricalAnalytics />
        </TabsContent>
        
        <TabsContent value="input">
          <AppStoreForm 
            onProcessSuccess={handleProcessSuccess}
            onAnalysisSuccess={handleAnalysisSuccess}
            isProcessing={processing}
            isAnalyzing={analyzing}
            setProcessing={setProcessing}
            setAnalyzing={setAnalyzing}
            dateRange={dateRange}
          />
          
          {extractedData && <DataExtractionStatus extractedData={extractedData} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
