
import { MetricCategory } from './types';

/**
 * Get appropriate color based on metric change
 */
export function getMetricChangeColor(
  change: number | undefined, 
  inverseColors: boolean = false
): string {
  if (change === undefined || change === null || isNaN(change)) {
    return 'text-white/60'; // Neutral color for unknown changes
  }
  
  // For metrics where negative change is good (like error rates)
  if (inverseColors) {
    return change < 0 ? 'text-green-500' : change > 0 ? 'text-red-500' : 'text-white/60';
  }
  
  // Normal metrics where positive change is good
  return change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-white/60';
}

/**
 * Generate consistent chart colors based on value ranges
 */
export function getValueBasedColor(value: number, thresholds: {low: number, medium: number}): string {
  if (value >= thresholds.medium) {
    return "#4ade80"; // Green for high values
  } else if (value >= thresholds.low) {
    return "#fb923c"; // Orange for medium values
  }
  return "#f87171"; // Red for low values
}

/**
 * Generate a consistent color scale for opportunity scores
 * @param score Opportunity score value (typically 0-100)
 * @returns Tailwind CSS color class
 */
export function getOpportunityColor(score: number): string {
  if (score >= 75) return "text-green-400";
  if (score >= 50) return "text-emerald-400";
  if (score >= 35) return "text-yellow-400";
  if (score >= 25) return "text-amber-400";
  return "text-red-400";
}
