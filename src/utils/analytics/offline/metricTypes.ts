/**
 * Metric type definitions for offline processing
 */

// Known metric types for type safety
export type MetricType = 
  | 'downloads' 
  | 'revenue' 
  | 'impressions' 
  | 'conversions' 
  | 'userCount' 
  | 'sessionCount' 
  | 'crashCount' 
  | 'conversionRate'
  | 'retentionRate';

// Mapping to standardize metric names from various formats
export const metricNameMap: Record<string, MetricType> = {
  'download': 'downloads',
  'downloads': 'downloads',
  'installs': 'downloads',
  'installations': 'downloads',
  'revenue': 'revenue',
  'proceeds': 'revenue',
  'sales': 'revenue',
  'earnings': 'revenue',
  'impression': 'impressions',
  'impressions': 'impressions',
  'views': 'impressions',
  'conversion': 'conversions',
  'conversions': 'conversions',
  'user': 'userCount',
  'users': 'userCount',
  'customers': 'userCount',
  'session': 'sessionCount',
  'sessions': 'sessionCount',
  'crash': 'crashCount',
  'crashes': 'crashCount',
  'errors': 'crashCount',
  'conversion rate': 'conversionRate',
  'cvr': 'conversionRate',
  'retention': 'retentionRate',
  'retention rate': 'retentionRate'
};

/**
 * Standardize metric names from various input formats
 * @param metrics Object containing metrics with potentially non-standard names
 * @returns Object with standardized metric names
 */
export const standardizeMetricNames = (metrics: Record<string, any>): Record<string, any> => {
  const standardized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(metrics)) {
    // Look for matching standard name
    let standardKey: string | undefined;
    for (const [pattern, standardName] of Object.entries(metricNameMap)) {
      if (key.toLowerCase().includes(pattern.toLowerCase())) {
        standardKey = standardName;
        break;
      }
    }
    
    // Use standard key if found, otherwise keep original
    standardized[standardKey || key] = value;
  }
  
  return standardized;
};
