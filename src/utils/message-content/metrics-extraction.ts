
/**
 * Utilities for extracting and caching metrics from message content
 */

/**
 * Cache for storing processed metrics and analyses to reduce API calls
 */
type MetricsCache = {
  [key: string]: {
    metrics: Record<string, any>;
    timestamp: number;
    expiresAt: number;
  }
};

const metricsCache: MetricsCache = {};
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes by default

/**
 * Extract key metrics from text content using regex patterns rather than OpenAI
 * Serves as a fallback when OpenAI is unavailable
 */
export const extractMetricsLocally = (content: string): Record<string, any> => {
  if (!content) return {};
  
  const metrics: Record<string, any> = {};
  
  // Download metrics
  const downloadsMatch = content.match(/downloads:?\s*([0-9,]+)/i) || 
                         content.match(/([0-9,]+)\s+downloads/i);
  if (downloadsMatch) {
    metrics.downloads = parseInt(downloadsMatch[1].replace(/,/g, ''));
  }
  
  // Revenue/proceeds metrics
  const revenueMatch = content.match(/revenue:?\s*\$?([0-9,.]+[kmb]?)/i) || 
                      content.match(/proceeds:?\s*\$?([0-9,.]+[kmb]?)/i) ||
                      content.match(/\$([0-9,.]+[kmb]?)/i);
  if (revenueMatch) {
    let value = revenueMatch[1].replace(/,/g, '');
    // Handle K, M, B suffixes
    if (value.endsWith('k') || value.endsWith('K')) {
      metrics.revenue = parseFloat(value.slice(0, -1)) * 1000;
    } else if (value.endsWith('m') || value.endsWith('M')) {
      metrics.revenue = parseFloat(value.slice(0, -1)) * 1000000;
    } else if (value.endsWith('b') || value.endsWith('B')) {
      metrics.revenue = parseFloat(value.slice(0, -1)) * 1000000000;
    } else {
      metrics.revenue = parseFloat(value);
    }
  }
  
  // Conversion rate
  const conversionMatch = content.match(/conversion rate:?\s*([0-9.]+)%/i) ||
                          content.match(/cvr:?\s*([0-9.]+)%/i);
  if (conversionMatch) {
    metrics.conversionRate = parseFloat(conversionMatch[1]);
  }
  
  // Impressions
  const impressionsMatch = content.match(/impressions:?\s*([0-9,]+)/i) ||
                           content.match(/([0-9,]+)\s+impressions/i);
  if (impressionsMatch) {
    metrics.impressions = parseInt(impressionsMatch[1].replace(/,/g, ''));
  }
  
  // Extract change percentages
  const extractChangePercentage = (metricName: string): number | null => {
    const patterns = [
      new RegExp(`${metricName}.*?\\(([+-][0-9.]+)%\\)`, 'i'),
      new RegExp(`${metricName}.*?(increased|decreased)\\s+by\\s+([0-9.]+)%`, 'i')
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        if (match[1] === '+' || match[1] === '-') {
          return parseFloat(match[1] + match[2]);
        } else if (match[1].toLowerCase() === 'increased') {
          return parseFloat(match[2]);
        } else if (match[1].toLowerCase() === 'decreased') {
          return -parseFloat(match[2]);
        }
      }
    }
    
    return null;
  };
  
  metrics.downloadsChange = extractChangePercentage('downloads') || 0;
  metrics.revenueChange = extractChangePercentage('revenue') || 
                         extractChangePercentage('proceeds') || 0;
  metrics.conversionChange = extractChangePercentage('conversion') || 0;
  metrics.impressionsChange = extractChangePercentage('impressions') || 0;
  
  return metrics;
};

/**
 * Store metrics in cache with TTL
 */
export const cacheMetrics = (cacheKey: string, metrics: Record<string, any>, ttl = CACHE_TTL): void => {
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
    cacheMetrics(cacheKey, localMetrics, 10 * 60 * 1000); // 10 minutes
    
    return localMetrics;
  }
};
