
/**
 * Re-export metrics extraction functionality from the metrics module
 */
export { 
  extractMetricsLocally,
  cacheMetrics,
  getMetricsFromCache,
  generateCacheKey,
  processContentWithFallback,
  storeAnalyticsData,
  getHistoricalAnalytics,
  getLatestAnalytics
} from './metrics';
