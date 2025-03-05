
/**
 * Re-export all message content utility functions
 */
export { processMessageContent } from './formatting';
export { 
  extractMetricsLocally, 
  cacheMetrics, 
  getMetricsFromCache, 
  generateCacheKey,
  processContentWithFallback,
  storeAnalyticsData,
  getHistoricalAnalytics,
  getLatestAnalytics
} from './metrics/index';
export { getSuggestedReplies, extractKeywords } from './suggestions';
export { formatTimestamp } from './time-utils';
