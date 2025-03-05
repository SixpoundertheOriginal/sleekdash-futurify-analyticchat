
/**
 * Formatting utilities for metrics in offline processing
 */
import { MetricType } from './metricTypes';

/**
 * Format metrics for display with proper units
 */
export const formatMetric = (value: number, type: MetricType | string): string => {
  if (!value && value !== 0) return 'N/A';
  
  // Format based on metric type
  switch (type) {
    case 'downloads':
    case 'impressions':
    case 'conversions':
    case 'userCount':
    case 'sessionCount':
    case 'crashCount':
      return value >= 1000000
        ? `${(value / 1000000).toFixed(1)}M`
        : value >= 1000
          ? `${(value / 1000).toFixed(1)}K`
          : Math.round(value).toString();
      
    case 'revenue':
      return value >= 1000000
        ? `$${(value / 1000000).toFixed(1)}M`
        : value >= 1000
          ? `$${(value / 1000).toFixed(1)}K`
          : `$${Math.round(value)}`;
      
    case 'conversionRate':
    case 'retentionRate':
      return `${value.toFixed(2)}%`;
      
    default:
      return value.toString();
  }
};
