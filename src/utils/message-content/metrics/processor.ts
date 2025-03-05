
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
  // Validate input
  if (!content || typeof content !== 'string') {
    console.warn('[MessageContentUtils] Empty or invalid content provided for processing');
    return {};
  }
  
  // Trim content to avoid unnecessary processing
  const trimmedContent = content.trim();
  if (trimmedContent.length === 0) {
    console.warn('[MessageContentUtils] Empty content provided for processing');
    return {};
  }
  
  // Generate cache key from content
  const cacheKey = generateCacheKey(trimmedContent);
  
  // Check cache first for efficiency
  const cachedMetrics = getMetricsFromCache(cacheKey);
  if (cachedMetrics) {
    console.log('[MessageContentUtils] Using cached metrics');
    return cachedMetrics;
  }
  
  try {
    // Try using OpenAI first
    console.log('[MessageContentUtils] Attempting to process with OpenAI');
    const metrics = await openAiProcessor(trimmedContent);
    
    // Only cache valid results
    if (metrics && Object.keys(metrics).length > 0) {
      // Cache the result for future use
      cacheMetrics(cacheKey, metrics);
      return metrics;
    } else {
      console.warn('[MessageContentUtils] OpenAI returned empty metrics, falling back to local extraction');
      const localMetrics = extractMetricsLocally(trimmedContent);
      
      // Cache the locally extracted metrics with a shorter TTL
      if (localMetrics && Object.keys(localMetrics).length > 0) {
        cacheMetrics(cacheKey, localMetrics, FALLBACK_CACHE_TTL);
      }
      
      return localMetrics;
    }
  } catch (error) {
    console.warn('[MessageContentUtils] OpenAI processing failed, using local fallback:', error);
    
    // Fallback to local extraction if OpenAI fails
    const localMetrics = extractMetricsLocally(trimmedContent);
    
    // Cache the locally extracted metrics with a shorter TTL
    if (localMetrics && Object.keys(localMetrics).length > 0) {
      cacheMetrics(cacheKey, localMetrics, FALLBACK_CACHE_TTL);
    }
    
    return localMetrics;
  }
};
