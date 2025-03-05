
/**
 * Re-export all metrics extraction related functionality
 */
export { 
  extractMetricsLocally 
} from './local-extraction';

export {
  cacheMetrics,
  getMetricsFromCache,
  generateCacheKey
} from './cache';

export {
  processContentWithFallback
} from './processor';

export type { 
  MetricsCache,
  MetricsCacheEntry 
} from './types';

