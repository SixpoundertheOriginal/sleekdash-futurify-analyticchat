
import { MetricFormatOptions, MetricCategory } from './types';

/**
 * Format a metric value for display with consistent styling
 */
export function formatMetricValue(
  value: number,
  options: MetricFormatOptions = {}
): string {
  const {
    decimals = 1,
    prefix = '',
    suffix = '',
    compact = true
  } = options;

  if (value === undefined || value === null || isNaN(value)) {
    return 'N/A';
  }

  // Format based on magnitude for readability
  let formattedValue: string;
  if (compact) {
    if (value >= 1000000) {
      formattedValue = (value / 1000000).toFixed(decimals) + 'M';
    } else if (value >= 1000) {
      formattedValue = (value / 1000).toFixed(decimals) + 'K';
    } else {
      formattedValue = value.toFixed(value % 1 === 0 ? 0 : decimals);
    }
  } else {
    formattedValue = value.toFixed(decimals);
  }

  return `${prefix}${formattedValue}${suffix}`;
}

/**
 * Format a percentage value consistently
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  if (value === undefined || value === null || isNaN(value)) {
    return 'N/A';
  }
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format currency values consistently
 */
export function formatCurrency(value: number, options: MetricFormatOptions = {}): string {
  return formatMetricValue(value, {
    prefix: '$',
    ...options
  });
}

/**
 * Format metrics based on their category
 * @param value The metric value to format
 * @param category The category of the metric
 * @returns Formatted string representation of the metric
 */
export function formatMetricByCategory(value: number, category: MetricCategory): string {
  switch (category) {
    case MetricCategory.FINANCIAL:
      return formatCurrency(value);
    case MetricCategory.OPPORTUNITY:
    case MetricCategory.PERFORMANCE:
      return formatPercentage(value);
    case MetricCategory.ACQUISITION:
      return formatMetricValue(value, { compact: true });
    default:
      return formatMetricValue(value);
  }
}
