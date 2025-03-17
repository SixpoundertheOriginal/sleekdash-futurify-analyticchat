
export const validateAnalysisText = (analysisText: string): boolean => {
  if (!analysisText) {
    console.log('Analysis text is empty');
    throw new Error('Analysis text is empty');
  }
  
  console.log('Validating analysis text:', analysisText);
  
  // Highly flexible validation to account for different AI output formats
  // Check for indicators that this is a performance report using multiple patterns
  const performanceIndicators = [
    // Downloads indicators
    /total downloads:?\s*[\d,.k]+/i,
    /downloads:?\s*[\d,.k]+/i,
    /\b[\d,.k]+ downloads\b/i,
    
    // Revenue/proceeds indicators
    /total proceeds:?\s*\$?[\d,.k]+/i,
    /proceeds:?\s*\$?[\d,.k]+/i,
    /revenue:?\s*\$?[\d,.k]+/i,
    
    // Report type indicators
    /performance (report|analysis)/i,
    /monthly (report|analysis)/i,
    /key metrics/i,
    /user acquisition/i,
    /financial performance/i
  ];
  
  // Check if at least 2 performance indicators are found to confirm it's a performance report
  const matchCount = performanceIndicators.filter(pattern => 
    pattern.test(analysisText)
  ).length;
  
  if (matchCount < 2) {
    console.log('Not a performance report - insufficient performance indicators found');
    throw new Error('Not a performance report - missing key metrics');
  }

  return true;
};

/**
 * Checks if the processed analytics data has valid metrics for visualization
 * @param data The processed analytics data to validate
 * @returns Boolean indicating if the data has sufficient valid metrics
 */
export const hasValidMetrics = (data: any): boolean => {
  if (!data) {
    console.log('No data to validate metrics');
    return false;
  }
  
  // Check for essential metrics needed for visualization
  const requiredMetrics = [
    'impressions',
    'pageViews',
    'downloads',
    'conversionRate'
  ];
  
  // Count how many required metrics are present and have valid values
  const validMetricsCount = requiredMetrics.filter(metric => {
    const value = data.metrics?.[metric];
    return value !== undefined && value !== null && !isNaN(Number(value));
  }).length;
  
  // We consider the data valid if it has at least 60% of required metrics
  const validThreshold = Math.ceil(requiredMetrics.length * 0.6);
  const isValid = validMetricsCount >= validThreshold;
  
  console.log(`Metrics validation: ${validMetricsCount}/${requiredMetrics.length} valid metrics, threshold: ${validThreshold}`);
  return isValid;
};
