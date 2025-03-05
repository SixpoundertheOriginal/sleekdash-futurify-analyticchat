
/**
 * Type definitions for metrics extraction functionality
 */

/**
 * Cache entry structure for storing processed metrics
 */
export interface MetricsCacheEntry {
  metrics: Record<string, any>;
  timestamp: number;
  expiresAt: number;
}

/**
 * Cache for storing processed metrics and analyses to reduce API calls
 */
export type MetricsCache = {
  [key: string]: MetricsCacheEntry;
};
