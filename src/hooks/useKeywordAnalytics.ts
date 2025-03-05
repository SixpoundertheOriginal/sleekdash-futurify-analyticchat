import { useState, useCallback, useEffect } from 'react';
import { KeywordMetric, ProcessedKeywordData, AnalysisError } from '@/components/keywords/types';
import { calculateOpportunityScore } from '@/utils/keywords/opportunity-score';
import { registerKeywordMetrics } from '@/utils/metrics/adapters/keywordsAdapter';
import { useMetrics } from '@/hooks/useMetrics';

export function useKeywordAnalytics() {
  const [data, setData] = useState<KeywordMetric[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedKeywordData[]>([]);
  const [error, setError] = useState<AnalysisError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timestamp, setTimestamp] = useState<string | undefined>(undefined);
  
  // Add metrics registry integration
  const { registerMetrics } = useMetrics('keywords');
  
  // Modify the processData function to register metrics
  const processData = useCallback((data: KeywordMetric[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const processed = data.map(item => {
        const opportunityScore = calculateOpportunityScore(item);
        return { ...item, opportunityScore };
      });
      
      setProcessedData(processed);
      setTimestamp(new Date().toISOString());
      
      return processed;
    } catch (processError: any) {
      setError({
        message: processError.message || 'Failed to process data',
        code: 'PROCESSING_ERROR'
      });
      return [];
    } finally {
      setIsLoading(false);
    }
    
    if (processedData.length > 0) {
      // Register the processed data with the metrics registry
      registerKeywordMetrics(processedData, { 
        source: 'keyword-analytics', 
        confidence: 0.9 
      });
    }
    
    return {
      data: processedData,
      error,
      isLoading
    };
  }, []);
  
  const setDataAndProcess = useCallback((newData: KeywordMetric[]) => {
    setData(newData);
    processData(newData);
  }, [processData]);
  
  return {
    data,
    setData: setDataAndProcess,
    processedData,
    error,
    isLoading,
    processData,
    timestamp
  };
}
