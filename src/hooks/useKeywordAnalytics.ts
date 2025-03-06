
import { useState, useCallback, useEffect } from 'react';
import { KeywordMetric, ProcessedKeywordData, AnalysisError } from '@/components/keywords/types';
import { calculateOpportunityScore } from '@/utils/keywords/opportunity-score';
import { registerKeywordMetrics } from '@/utils/metrics/adapters/keywordsAdapter';
import { useMetrics } from '@/hooks/useMetrics';
import { generateProcessedDummyData } from '@/utils/keywords/dummyData';

export function useKeywordAnalytics() {
  const [data, setData] = useState<KeywordMetric[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedKeywordData[]>([]);
  const [error, setError] = useState<AnalysisError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timestamp, setTimestamp] = useState<string | undefined>(undefined);
  
  // Add metrics registry integration
  const { registerMetrics } = useMetrics('keywords');
  
  // Compute derived metrics for UI components
  const keywordCount = processedData.length;
  
  // Find top opportunity
  const topOpportunity = processedData.length > 0 
    ? [...processedData].sort((a, b) => b.opportunityScore - a.opportunityScore)[0]
    : { keyword: 'N/A', opportunityScore: 0 };
  
  // Calculate averages
  const avgVolume = processedData.length > 0
    ? Math.round(processedData.reduce((acc, item) => acc + item.volume, 0) / processedData.length)
    : 0;
  
  const avgDifficulty = processedData.length > 0
    ? Math.round(processedData.reduce((acc, item) => acc + item.difficulty, 0) / processedData.length)
    : 0;
  
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
      
      // Register the processed data with the metrics registry
      if (processed.length > 0) {
        registerKeywordMetrics(processed, { 
          source: 'keyword-analytics', 
          confidence: 0.9 
        });
      }
      
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
  }, [registerKeywordMetrics]);
  
  const setDataAndProcess = useCallback((newData: KeywordMetric[]) => {
    setData(newData);
    processData(newData);
  }, [processData]);
  
  // Refresh data function
  const refreshData = useCallback(() => {
    if (data.length > 0) {
      processData(data);
    } else {
      // Generate new dummy data on refresh if no real data exists
      const dummyData = generateProcessedDummyData(30);
      setDataAndProcess(dummyData);
    }
  }, [data, processData, setDataAndProcess]);
  
  // Load dummy data on initial render
  useEffect(() => {
    // Generate dummy data for presentation
    const dummyData = generateProcessedDummyData(30);
    setDataAndProcess(dummyData);
  }, [setDataAndProcess]);
  
  return {
    data,
    setData: setDataAndProcess,
    processedData,
    error,
    isLoading,
    processData,
    timestamp,
    // Export derived metrics for components
    keywordData: processedData,
    topOpportunity,
    keywordCount,
    avgVolume,
    avgDifficulty,
    refreshData
  };
}
