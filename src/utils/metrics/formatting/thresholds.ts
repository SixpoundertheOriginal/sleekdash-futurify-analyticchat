
import { MetricCategory } from './types';

/**
 * Get standardized threshold values for different metric categories
 * @param category The metric category
 * @returns Object with low and medium threshold values
 */
export function getCategoryThresholds(category: MetricCategory): {low: number, medium: number} {
  switch (category) {
    case MetricCategory.OPPORTUNITY:
      return { low: 30, medium: 60 };
    case MetricCategory.PERFORMANCE:
      return { low: 40, medium: 70 };
    case MetricCategory.ENGAGEMENT:
      return { low: 20, medium: 50 };
    case MetricCategory.FINANCIAL:
      return { low: 25, medium: 55 };
    default:
      return { low: 33, medium: 66 };
  }
}

/**
 * Determine if a metric change is significant based on its magnitude and category
 * @param change The percentage change in the metric
 * @param category The category of the metric
 * @returns boolean indicating if the change is significant
 */
export function isSignificantChange(change: number, category: MetricCategory): boolean {
  // Different thresholds for different metric categories
  const thresholds: Record<MetricCategory, number> = {
    [MetricCategory.ACQUISITION]: 10,
    [MetricCategory.ENGAGEMENT]: 5,
    [MetricCategory.PERFORMANCE]: 15,
    [MetricCategory.OPPORTUNITY]: 20,
    [MetricCategory.FINANCIAL]: 8,
    [MetricCategory.TECHNICAL]: 25
  };
  
  return Math.abs(change) >= thresholds[category];
}
