
/**
 * Common metric value types
 */
export type MetricValue = {
  value: number;
  change?: number;
  benchmark?: number;
  percentile?: string;
};

/**
 * Standard metric categories that work across domains
 */
export enum MetricCategory {
  ACQUISITION = 'acquisition',
  ENGAGEMENT = 'engagement',
  PERFORMANCE = 'performance',
  OPPORTUNITY = 'opportunity',
  FINANCIAL = 'financial',
  TECHNICAL = 'technical'
}

/**
 * Metric formatting options
 */
export type MetricFormatOptions = {
  decimals?: number;
  prefix?: string;
  suffix?: string;
  compact?: boolean;
  inverseColors?: boolean;
};
