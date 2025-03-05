
import { useState } from "react";
import { useAnalysisData } from "@/hooks/useAnalysisData";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { AppStoreForm } from "./AppStoreForm";
import { DataExtractionStatus } from "./DataExtractionStatus";
import { AnalyticsDashboardWrapper } from "./AnalyticsDashboardWrapper";
import { AnalysisResultCard } from "./AnalysisResultCard";

interface AppStoreAnalysisProps {
  initialData: ProcessedAnalytics;
}

export function AppStoreAnalysis({ initialData }: AppStoreAnalysisProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const { data: processedData, error: processingError, isProcessing } = useAnalysisData(analysisResult);

  const handleProcessSuccess = (data: any) => {
    setExtractedData(data);
  };

  const handleAnalysisSuccess = (result: string) => {
    setAnalysisResult(result);
  };

  return (
    <div className="space-y-8">
      <AppStoreForm 
        onProcessSuccess={handleProcessSuccess}
        onAnalysisSuccess={handleAnalysisSuccess}
        isProcessing={processing}
        isAnalyzing={analyzing}
        setProcessing={setProcessing}
        setAnalyzing={setAnalyzing}
      />

      {extractedData && <DataExtractionStatus extractedData={extractedData} />}

      <AnalyticsDashboardWrapper 
        processedData={processedData}
        initialData={initialData}
        isProcessing={isProcessing}
        processingError={processingError}
      />

      <AnalysisResultCard analysisResult={analysisResult} />
    </div>
  );
}
