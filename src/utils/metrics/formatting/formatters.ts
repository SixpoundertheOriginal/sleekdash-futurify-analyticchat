
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

/**
 * Format a range of values (e.g., "10-20K")
 * @param min Minimum value
 * @param max Maximum value
 * @param options Formatting options
 * @returns Formatted range string
 */
export function formatMetricRange(
  min: number, 
  max: number, 
  options: MetricFormatOptions = {}
): string {
  const minFormatted = formatMetricValue(min, { ...options, suffix: '' });
  const maxFormatted = formatMetricValue(max, options);
  
  return `${minFormatted}-${maxFormatted}`;
}

/**
 * Format a metric with an appropriate level of precision based on its magnitude
 * @param value The metric value
 * @param category The metric category
 * @returns Formatted value with dynamic precision
 */
export function formatMetricWithDynamicPrecision(value: number, category: MetricCategory): string {
  // Determine appropriate precision based on magnitude and category
  let decimals = 1; // Default
  
  if (Math.abs(value) >= 1000000) {
    decimals = 1; // Millions (1.2M)
  } else if (Math.abs(value) >= 1000) {
    decimals = 1; // Thousands (1.2K) 
  } else if (Math.abs(value) >= 100) {
    decimals = 0; // Hundreds (123)
  } else if (Math.abs(value) >= 10) {
    decimals = 1; // Tens (12.3)
  } else {
    decimals = 2; // Small values (1.23)
  }
  
  // Special cases for financial metrics (always show 2 decimals for currency under 1000)
  if (category === MetricCategory.FINANCIAL && Math.abs(value) < 1000) {
    decimals = 2;
  }
  
  return formatMetricByCategory(value, category);
}
