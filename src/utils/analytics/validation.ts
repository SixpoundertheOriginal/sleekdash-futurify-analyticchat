
import { ProcessedAnalytics } from "./types";

/**
 * Validates if the analytics data has the minimal metrics required for visualization
 */
export function hasValidMetrics(data: ProcessedAnalytics | null): boolean {
  if (!data) return false;
  
  // Check if we have at least one of these key metrics
  const hasDownloads = data.acquisition?.downloads?.value > 0;
  const hasProceeds = data.financial?.proceeds?.value > 0;
  const hasSessions = data.engagement?.sessionsPerDevice?.value > 0;
  
  return hasDownloads || hasProceeds || hasSessions;
}

/**
 * Deep comparison utility for verifying state equivalence during migration
 */
export function compareAnalyticsState(contextState: any, zustandState: any): {
  equivalent: boolean;
  differences: Array<{path: string, contextValue: any, zustandValue: any}>
} {
  const differences: Array<{path: string, contextValue: any, zustandValue: any}> = [];
  
  // Only compare specific fields we care about for migration
  const fieldsToCompare = [
    'processedAnalytics',
    'dateRange',
    'activeTab',
    'isProcessing',
    'isAnalyzing',
    'processingError',
    'extractedData',
    'analysisResult',
  ];
  
  let equivalent = true;
  
  fieldsToCompare.forEach(field => {
    if (JSON.stringify(contextState[field]) !== JSON.stringify(zustandState[field])) {
      equivalent = false;
      differences.push({
        path: field,
        contextValue: contextState[field],
        zustandValue: zustandState[field]
      });
    }
  });
  
  return { equivalent, differences };
}
