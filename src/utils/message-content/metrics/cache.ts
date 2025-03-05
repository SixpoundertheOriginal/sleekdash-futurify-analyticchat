
/**
 * Cache management for metrics extraction
 */
import { MetricsCache } from './types';

// Cache storage
const metricsCache: MetricsCache = {};

// Default cache TTL (30 minutes)
export const DEFAULT_CACHE_TTL = 30 * 60 * 1000;
export const FALLBACK_CACHE_TTL = 10 * 60 * 1000; // 10 minutes for fallback metrics

/**
 * Store metrics in cache with TTL
 */
export const cacheMetrics = (cacheKey: string, metrics: Record<string, any>, ttl = DEFAULT_CACHE_TTL): void => {
  metricsCache[cacheKey] = {
    metrics,
    timestamp: Date.now(),
    expiresAt: Date.now() + ttl
  };
};

/**
 * Get metrics from cache if available and not expired
 */
export const getMetricsFromCache = (cacheKey: string): Record<string, any> | null => {
  const cached = metricsCache[cacheKey];
  if (cached && Date.now() < cached.expiresAt) {
    return cached.metrics;
  }
  return null;
};

/**
 * Generate a cache key from content
 */
export const generateCacheKey = (content: string): string => {
  // Create a simple hash from the content
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `metrics_${Math.abs(hash)}`;
};

