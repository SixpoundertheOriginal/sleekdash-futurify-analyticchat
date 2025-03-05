
/**
 * Utilities for validating extracted metrics
 */
import { ProcessedAnalytics } from "../types";

/**
 * Check if the metrics contain enough valid data for visualization
 */
export const hasValidMetricsForVisualization = (metrics: Partial<ProcessedAnalytics>): boolean => {
  // Check if we have at least acquisition or financial data
  const hasAcquisitionData = 
    (metrics.acquisition?.downloads?.value || 0) > 0 || 
    (metrics.acquisition?.impressions?.value || 0) > 0;
    
  const hasFinancialData = (metrics.financial?.proceeds?.value || 0) > 0;
  
  return hasAcquisitionData || hasFinancialData;
};
