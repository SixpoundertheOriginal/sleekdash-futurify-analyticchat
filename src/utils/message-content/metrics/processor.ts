
/**
 * Processor utilities for extracting metrics with API fallback
 */
import { extractMetricsLocally } from './local-extraction';
import { cacheMetrics, generateCacheKey, getMetricsFromCache, FALLBACK_CACHE_TTL } from './cache';

/**
 * Process content with fallback to local extraction if OpenAI fails
 */
export const processContentWithFallback = async (
  content: string, 
  openAiProcessor: (content: string) => Promise<Record<string, any>>
): Promise<Record<string, any>> => {
  // Generate cache key from content
  const cacheKey = generateCacheKey(content);
  
  // Check cache first
  const cachedMetrics = getMetricsFromCache(cacheKey);
  if (cachedMetrics) {
    console.log('[MessageContentUtils] Using cached metrics');
    return cachedMetrics;
  }
  
  try {
    // Try using OpenAI first
    console.log('[MessageContentUtils] Attempting to process with OpenAI');
    const metrics = await openAiProcessor(content);
    
    // Cache the result for future use
    cacheMetrics(cacheKey, metrics);
    
    return metrics;
  } catch (error) {
    console.warn('[MessageContentUtils] OpenAI processing failed, using local fallback:', error);
    
    // Fallback to local extraction if OpenAI fails
    const localMetrics = extractMetricsLocally(content);
    
    // Cache the locally extracted metrics with a shorter TTL
    cacheMetrics(cacheKey, localMetrics, FALLBACK_CACHE_TTL);
    
    return localMetrics;
  }
};

