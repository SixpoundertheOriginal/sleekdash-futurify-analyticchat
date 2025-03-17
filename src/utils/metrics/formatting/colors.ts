
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

/**
 * Get appropriate Tailwind background color class based on metric value and context
 * @param value The metric value
 * @param category The metric category
 * @param intensity The color intensity (10-900, default to 500)
 * @param alpha Optional opacity value (0-100)
 * @returns Tailwind CSS background color class
 */
export function getMetricBackgroundColor(
  value: number, 
  category: MetricCategory,
  intensity: number = 500,
  alpha?: number
): string {
  // Base colors for different categories
  const categoryBaseColors: Record<MetricCategory, string> = {
    [MetricCategory.ACQUISITION]: 'blue',
    [MetricCategory.ENGAGEMENT]: 'purple',
    [MetricCategory.PERFORMANCE]: 'emerald',
    [MetricCategory.OPPORTUNITY]: 'amber',
    [MetricCategory.FINANCIAL]: 'green',
    [MetricCategory.TECHNICAL]: 'slate'
  };
  
  const baseColor = categoryBaseColors[category] || 'gray';
  const opacityClass = alpha ? `/${alpha}` : '';
  
  return `bg-${baseColor}-${intensity}${opacityClass}`;
}

/**
 * Get a consistent color scheme for a metric category
 * @param category The metric category
 * @returns Array of color values for consistent charts
 */
export function getCategoryColorScheme(category: MetricCategory): string[] {
  switch (category) {
    case MetricCategory.ACQUISITION:
      return ["#60a5fa", "#93c5fd", "#bfdbfe", "#3b82f6"];
    case MetricCategory.ENGAGEMENT:
      return ["#a78bfa", "#c4b5fd", "#ddd6fe", "#8b5cf6"];
    case MetricCategory.PERFORMANCE:
      return ["#4ade80", "#86efac", "#bbf7d0", "#22c55e"];
    case MetricCategory.OPPORTUNITY:
      return ["#fbbf24", "#fcd34d", "#fde68a", "#f59e0b"];
    case MetricCategory.FINANCIAL:
      return ["#10b981", "#34d399", "#6ee7b7", "#059669"];
    case MetricCategory.TECHNICAL:
      return ["#94a3b8", "#cbd5e1", "#e2e8f0", "#64748b"];
    default:
      return ["#8884d8", "#9CA3AF", "#D1D5DB", "#6B7280"];
  }
}
