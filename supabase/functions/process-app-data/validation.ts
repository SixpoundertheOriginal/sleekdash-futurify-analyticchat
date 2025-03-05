
// Data validation functionality
/**
 * Validate extracted data
 * @param metrics Extracted metrics
 * @param changes Extracted changes
 * @param dateRange Extracted date range
 * @returns Validation results
 */
export function validateData(
  metrics: Record<string, number | null>,
  changes: Record<string, number | null>,
  dateRange: string | null
): { 
  isValid: boolean; 
  missingFields: string[];
  confidence: number;
  estimatedFields: string[];
  dateRange: string | null;
} {
  console.log("Validating extracted data...");
  
  // Filter out retention field which is now a nested object
  const flatMetrics = Object.entries(metrics)
    .filter(([key]) => key !== 'retention')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
  
  const missingFields = Object.entries(flatMetrics)
    .filter(([_, value]) => value === null)
    .map(([key, _]) => key);
  
  const estimatedFields = [];
  
  // Check date range validity
  const hasValidDateRange = dateRange !== null;
  if (!hasValidDateRange) {
    console.warn("No valid date range found");
  }
  
  // Consider data valid if we have at least 3 KPIs with at least 1 from each major category
  const hasAcquisitionMetric = 
    metrics.impressions !== null || 
    metrics.pageViews !== null || 
    metrics.downloads !== null;
    
  const hasFinancialMetric = 
    metrics.proceeds !== null || 
    metrics.proceedsPerUser !== null;
    
  const hasEngagementMetric = 
    metrics.conversionRate !== null || 
    metrics.sessionsPerDevice !== null;
  
  // Count how many critical metrics we have
  const criticalMetrics = [
    'impressions', 
    'pageViews', 
    'downloads', 
    'conversionRate', 
    'proceeds',
    'sessionsPerDevice'
  ];
  
  const criticalMetricsCount = criticalMetrics
    .filter(metric => metrics[metric as keyof typeof metrics] !== null)
    .length;
  
  // Calculate confidence score - weighted by importance
  const totalMetrics = Object.keys(flatMetrics).length;
  const presentMetrics = Object.values(flatMetrics).filter(v => v !== null).length;
  const baseConfidence = (presentMetrics / totalMetrics) * 100;
  
  // Weight critical metrics more heavily
  const criticalWeight = 0.7;
  const regularWeight = 0.3;
  const criticalConfidence = (criticalMetricsCount / criticalMetrics.length) * 100;
  const weightedConfidence = (criticalConfidence * criticalWeight) + (baseConfidence * regularWeight);
  
  // Round to nearest whole number
  const confidence = Math.round(weightedConfidence);
  
  // Check for obviously invalid values (negative counts, extreme outliers)
  const invalidValues = Object.entries(flatMetrics)
    .filter(([key, value]) => {
      if (value === null) return false;
      
      // Value validation based on metric type
      if (key === 'conversionRate' && (value < 0 || value > 100)) return true;
      if (key !== 'conversionRate' && key !== 'crashes' && value < 0) return true;
      
      return false;
    })
    .map(([key, _]) => key);
  
  if (invalidValues.length > 0) {
    console.warn("Found invalid values:", invalidValues);
  }
  
  // Data is valid if:
  // 1. We have the minimum required metrics
  // 2. We have at least one acquisition metric and either a financial or engagement metric
  // 3. No invalid values were detected
  // 4. We have a valid date range
  const isValid = 
    criticalMetricsCount >= 2 && 
    (hasAcquisitionMetric && (hasFinancialMetric || hasEngagementMetric)) && 
    invalidValues.length === 0 &&
    hasValidDateRange;
  
  console.log("Validation complete:", {
    isValid, 
    confidence,
    criticalMetricsCount,
    hasAcquisitionMetric,
    hasFinancialMetric,
    hasEngagementMetric
  });
  
  return { 
    isValid, 
    missingFields, 
    confidence,
    estimatedFields,
    dateRange
  };
}
