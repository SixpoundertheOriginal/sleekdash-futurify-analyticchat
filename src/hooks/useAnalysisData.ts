
import { useState, useEffect } from 'react';
import { ProcessedAnalytics, processAnalysisText } from '@/utils/analytics/processAnalysis';

export interface UseAnalysisDataReturn {
  data: ProcessedAnalytics | null;
  error: string | null;
  isProcessing: boolean;
}

export function useAnalysisData(analysisText: string | null): UseAnalysisDataReturn {
  const [processedData, setProcessedData] = useState<ProcessedAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const processData = async () => {
      if (!analysisText) {
        console.log('No analysis text provided, skipping processing');
        setProcessedData(null);
        return;
      }

      setIsProcessing(true);
      setError(null);

      try {
        console.log('Starting analysis text processing:', {
          textLength: analysisText.length,
          preview: analysisText.substring(0, 200) + '...'
        });

        const processed = processAnalysisText(analysisText);
        
        console.log('Processing complete. Result structure:', {
          hasData: !!processed,
          sections: processed ? Object.keys(processed) : [],
          summary: processed?.summary,
          acquisitionMetrics: processed?.acquisition
        });

        setProcessedData(processed);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to process analysis data';
        console.error('Error processing analysis:', {
          error: err,
          message: errorMessage
        });
        setError(errorMessage);
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
