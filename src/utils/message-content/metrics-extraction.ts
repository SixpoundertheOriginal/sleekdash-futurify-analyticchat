
/**
 * Re-export metrics extraction functionality from the metrics module
 */
export { 
  extractMetricsLocally,
  cacheMetrics,
  getMetricsFromCache,
  generateCacheKey,
  processContentWithFallback
} from './metrics';

export {
  storeAnalyticsData,
  getHistoricalAnalytics,
  getLatestAnalytics
} from './metrics/persistence';
