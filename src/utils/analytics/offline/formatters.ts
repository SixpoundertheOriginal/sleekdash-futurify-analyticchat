
/**
 * Formatting utilities for metrics in offline processing
 */
import { MetricType, MetricCategory, getMetricCategory } from './metricTypes';

/**
 * Format metrics for display with proper units
 */
export const formatMetric = (value: number, type: MetricType | string): string => {
  if (!value && value !== 0) return 'N/A';
  
  // If type is a MetricType, get the category
  const metricType = type as MetricType;
  const category = getMetricCategory(metricType);
  
  // Format based on metric category and type
  switch (category) {
    case MetricCategory.ACQUISITION:
      if (type === 'conversionRate') {
        return `${value.toFixed(2)}%`;
      }
      return formatNumericValue(value);
      
    case MetricCategory.FINANCIAL:
      return formatCurrencyValue(value);
      
    case MetricCategory.ENGAGEMENT:
      if (type === 'retentionRate') {
        return `${value.toFixed(2)}%`;
      }
      return formatNumericValue(value);
      
    case MetricCategory.TECHNICAL:
      if (type === 'crashRate') {
        return `${value.toFixed(2)}%`;
      }
      return formatNumericValue(value);
      
    default:
      return value.toString();
  }
};

/**
 * Format numeric value with K/M suffixes for large numbers
 */
export const formatNumericValue = (value: number): string => {
  return value >= 1000000
    ? `${(value / 1000000).toFixed(1)}M`
    : value >= 1000
      ? `${(value / 1000).toFixed(1)}K`
      : Math.round(value).toString();
};

/**
 * Format currency value with $ prefix and K/M suffixes for large numbers
 */
export const formatCurrencyValue = (value: number): string => {
  return value >= 1000000
    ? `$${(value / 1000000).toFixed(1)}M`
    : value >= 1000
      ? `$${(value / 1000).toFixed(1)}K`
      : `$${Math.round(value)}`;
};
