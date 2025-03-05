
/**
 * Standardized metrics extraction and formatting utilities
 * Provides consistent handling of metrics across different data domains
 */

// Common metric value types
export type MetricValue = {
  value: number;
  change?: number;
  benchmark?: number;
  percentile?: string;
};

// Standard metric categories that work across domains
export enum MetricCategory {
  ACQUISITION = 'acquisition',
  ENGAGEMENT = 'engagement',
  PERFORMANCE = 'performance',
  OPPORTUNITY = 'opportunity',
  FINANCIAL = 'financial',
  TECHNICAL = 'technical'
}

// Metric formatting options
export type MetricFormatOptions = {
  decimals?: number;
  prefix?: string;
  suffix?: string;
  compact?: boolean;
  inverseColors?: boolean;
};

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
 * Create a standardized set of chart options that can be used across different visualizations
 */
export function getStandardChartOptions(category: MetricCategory) {
  const baseOptions = {
    colors: ["#8884d8", "#4ade80", "#f87171", "#fb923c"],
    grid: {
      stroke: "rgba(255,255,255,0.1)",
      strokeDasharray: "3 3"
    },
    tooltip: {
      contentStyle: {
        backgroundColor: "#1e1b4b", 
        borderColor: "#4f46e5",
        color: "#ffffff"
      }
    },
    text: {
      fill: "#9ca3af"
    }
  };
  
  // Customize based on metric category if needed
  switch (category) {
    case MetricCategory.ACQUISITION:
      return {
        ...baseOptions,
        colors: ["#4ade80", "#8884d8", "#fb923c"]
      };
    case MetricCategory.FINANCIAL:
      return {
        ...baseOptions,
        colors: ["#60a5fa", "#4ade80", "#f87171"]
      };
    default:
      return baseOptions;
  }
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
