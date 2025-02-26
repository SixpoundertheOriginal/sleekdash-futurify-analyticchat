
import { useState, useEffect } from 'react';
import { ProcessedAnalytics, processAnalysisText } from '@/utils/analytics/processAnalysis';

export function useAnalysisData(analysisText: string | null) {
  const [processedData, setProcessedData] = useState<ProcessedAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const processData = async () => {
      if (!analysisText) {
        setProcessedData(null);
        return;
      }

      setIsProcessing(true);
      setError(null);

      try {
        console.log('Raw analysis text:', analysisText);
        const processed = processAnalysisText(analysisText);
        console.log('Processed data:', processed);
        setProcessedData(processed);
      } catch (err) {
        console.error('Error processing analysis:', err);
        setError(err instanceof Error ? err.message : 'Failed to process analysis data');
      } finally {
        setIsProcessing(false);
      }
    };

    processData();
  }, [analysisText]);

  return {
    data: processedData,
    error,
    isProcessing
  };
}
