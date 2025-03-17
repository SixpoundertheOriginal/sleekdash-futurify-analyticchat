
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

/**
 * Standard metric metadata to support cross-domain metrics
 */
export type MetricMetadata = {
  source?: string;
  confidence?: number;
  domain?: string;
  category?: string;
  metricKey?: string;
  timestamp?: Date;
  dateRange?: { from: Date; to: Date };
  importance?: MetricImportance;
  volatility?: number;
};

/**
 * Standardized metric object for registry
 */
export type StandardizedMetric = {
  value: number;
  rawValue: number;
  formatted: string;
  change?: number;
  benchmark?: number;
  percentile?: string;
  metadata?: MetricMetadata;
};

/**
 * Chart related metric type definitions
 */
export type ChartDataPoint = {
  name: string;
  value: number;
  date?: Date | string;
  category?: string;
  change?: number;
  benchmark?: number;
};

/**
 * Enum for metric importance levels
 */
export enum MetricImportance {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFORMATIONAL = 'informational'
}

/**
 * Trend direction for metrics
 */
export enum TrendDirection {
  UP = 'up',
  DOWN = 'down',
  STABLE = 'stable',
  FLUCTUATING = 'fluctuating'
}

/**
 * Types of metric aggregation methods
 */
export enum MetricAggregation {
  SUM = 'sum',
  AVERAGE = 'average',
  MEDIAN = 'median',
  MIN = 'min',
  MAX = 'max',
  COUNT = 'count',
  LATEST = 'latest'
}

/**
 * Configuration for metric comparison
 */
export type MetricComparisonConfig = {
  baselineKey: string;
  comparisonKey: string;
  relativeDifference: boolean;
  formatAsDifference: boolean;
  invertComparison: boolean;
};
