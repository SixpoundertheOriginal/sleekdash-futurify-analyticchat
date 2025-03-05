
/**
 * Metric type definitions for offline processing
 */

// Known metric types with strict type safety
export type AcquisitionMetricType = 
  | 'downloads' 
  | 'impressions' 
  | 'pageViews'
  | 'conversionRate'; 

export type FinancialMetricType = 
  | 'revenue' 
  | 'proceeds'
  | 'proceedsPerUser'
  | 'arpd';

export type EngagementMetricType = 
  | 'userCount' 
  | 'sessionCount'
  | 'sessionsPerDevice'
  | 'retentionRate';

export type TechnicalMetricType = 
  | 'crashCount'
  | 'crashes'
  | 'crashRate';

// Union type of all metric types
export type MetricType = 
  | AcquisitionMetricType 
  | FinancialMetricType 
  | EngagementMetricType 
  | TechnicalMetricType;

// Metric category for grouping related metrics
export enum MetricCategory {
  ACQUISITION = 'acquisition',
  FINANCIAL = 'financial',
  ENGAGEMENT = 'engagement',
  TECHNICAL = 'technical'
}

// Type mapping for category identification
export const metricCategories: Record<MetricType, MetricCategory> = {
  // Acquisition metrics
  downloads: MetricCategory.ACQUISITION,
  impressions: MetricCategory.ACQUISITION,
  pageViews: MetricCategory.ACQUISITION,
  conversionRate: MetricCategory.ACQUISITION,
  
  // Financial metrics
  revenue: MetricCategory.FINANCIAL,
  proceeds: MetricCategory.FINANCIAL,
  proceedsPerUser: MetricCategory.FINANCIAL,
  arpd: MetricCategory.FINANCIAL,
  
  // Engagement metrics
  userCount: MetricCategory.ENGAGEMENT,
  sessionCount: MetricCategory.ENGAGEMENT,
  sessionsPerDevice: MetricCategory.ENGAGEMENT,
  retentionRate: MetricCategory.ENGAGEMENT,
  
  // Technical metrics
  crashCount: MetricCategory.TECHNICAL,
  crashes: MetricCategory.TECHNICAL,
  crashRate: MetricCategory.TECHNICAL
};

// Mapping to standardize metric names from various formats
export const metricNameMap: Record<string, MetricType> = {
  // Acquisition metrics
  'download': 'downloads',
  'downloads': 'downloads',
  'installs': 'downloads',
  'installations': 'downloads',
  'impression': 'impressions',
  'impressions': 'impressions',
  'views': 'impressions',
  'page view': 'pageViews',
  'page views': 'pageViews',
  'pageview': 'pageViews',
  'pageviews': 'pageViews',
  'conversion rate': 'conversionRate',
  'cvr': 'conversionRate',
  
  // Financial metrics
  'revenue': 'revenue',
  'proceeds': 'proceeds',
  'sales': 'revenue',
  'earnings': 'revenue',
  'proceeds per user': 'proceedsPerUser',
  'average revenue per user': 'proceedsPerUser',
  'arpu': 'proceedsPerUser',
  'arpd': 'arpd',
  'average revenue per download': 'arpd',
  
  // Engagement metrics
  'user': 'userCount',
  'users': 'userCount',
  'customers': 'userCount',
  'session': 'sessionCount',
  'sessions': 'sessionCount',
  'sessions per device': 'sessionsPerDevice',
  'session per device': 'sessionsPerDevice',
  'retention': 'retentionRate',
  'retention rate': 'retentionRate',
  
  // Technical metrics
  'crash': 'crashes',
  'crashes': 'crashes',
  'crash count': 'crashCount',
  'errors': 'crashes',
  'crash rate': 'crashRate'
};

/**
 * Interface for metric extraction results
 */
export interface ExtractedMetricValue {
  value: number;
  change?: number;
  benchmark?: number;
  percentile?: string;
}

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

/**
 * Get metric category from metric type
 * @param metricType The type of metric
 * @returns The category the metric belongs to
 */
export const getMetricCategory = (metricType: MetricType): MetricCategory => {
  return metricCategories[metricType] || MetricCategory.ACQUISITION;
};
