
/**
 * Utility functions for processing message content
 */

/**
 * Processes the message content to make it more readable and visually appealing
 */
export const processMessageContent = (content: any): string => {
  // Check if content is not a string (could be an object from OpenAI API)
  if (typeof content !== 'string') {
    console.log('[MessageContentUtils] Received non-string content:', content);
    
    // Handle OpenAI new format where content might be an array
    if (Array.isArray(content)) {
      // Extract the text from the content array
      const textParts = content
        .filter((item: any) => item.type === 'text')
        .map((item: any) => item.text?.value || '');
      
      if (textParts.length > 0) {
        content = textParts.join('\n\n');
      } else {
        // Fallback - stringify the content
        content = JSON.stringify(content);
      }
    } else {
      // Fallback - stringify the content
      content = JSON.stringify(content);
    }
  }

  // Handle empty content or problematic values
  if (!content || content === "[]" || content.trim() === "") {
    console.warn('[MessageContentUtils] Empty or invalid content detected');
    content = "Content unavailable. Please try again or upload a new file.";
  }
  
  // Process the content for better display
  return content
    .replace(/^### (.*)/gm, '## $1')
    .replace(/^#### (.*)/gm, '### $1')
    .replace(/\*\*(.*?)\*\*/g, '**$1**')
    .replace(/^- /gm, '• ')
    .replace(/(\$[\d,]+\.?\d*)/g, '**$1**')
    .replace(/([+\-]?\d+\.?\d*%)/g, '**$1**')
    .replace(/increase/gi, '📈 increase')
    .replace(/decrease/gi, '📉 decrease')
    .replace(/improved/gi, '✨ improved')
    .replace(/downloads/gi, '⬇️ downloads')
    .replace(/revenue/gi, '💰 revenue')
    .replace(/users/gi, '👥 users')
    .replace(/growth/gi, '📊 growth')
    .replace(/traffic/gi, '🔄 traffic')
    .replace(/conversions/gi, '💫 conversions')
    .replace(/success/gi, '🎯 success')
    .replace(/impressions/gi, '👁️ impressions')
    .replace(/optimization/gi, '⚙️ optimization')
    .replace(/opportunity/gi, '🚀 opportunity')
    .replace(/ranking/gi, '🏆 ranking')
    .replace(/competitive/gi, '🥊 competitive')
    .replace(/search volume/gi, '🔍 search volume')
    .replace(/trend/gi, '📈 trend');
};

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

/**
 * Generate suggested replies based on message content
 */
export const getSuggestedReplies = (content: string, role: string): string[] => {
  if (role !== 'assistant') return [];
  
  // Convert to lowercase for case-insensitive matching
  const contentLower = content.toLowerCase();
  
  // More comprehensive keyword-based suggestions
  if (contentLower.includes('keyword')) {
    return [
      "Tell me more about top keywords", 
      "What's the competition like?",
      "How can I improve my keyword rankings?"
    ];
  } else if (contentLower.includes('performance')) {
    return [
      "Show me detailed metrics", 
      "How can I improve?",
      "Compare with industry benchmarks"
    ];
  } else if (contentLower.includes('trend')) {
    return [
      "What's driving this trend?", 
      "Compare to last month",
      "Is this seasonal?"
    ];
  } else if (contentLower.includes('analysis')) {
    return [
      "Show me the data breakdown", 
      "What actions should I take?",
      "What insights can you extract?"
    ];
  } else if (contentLower.includes('report') || contentLower.includes('insight')) {
    return [
      "Export this report", 
      "Highlight key findings",
      "Summarize the main points"
    ];
  } else if (contentLower.includes('competitors') || contentLower.includes('competition')) {
    return [
      "Who are my top competitors?",
      "How do I compare to the market?",
      "What strategies are working for others?"
    ];
  } else if (contentLower.includes('recommendation') || contentLower.includes('suggest')) {
    return [
      "Give me specific action items",
      "Prioritize these recommendations",
      "What's the expected impact?"
    ];
  } else if (contentLower.includes('data') || contentLower.includes('metrics')) {
    return [
      "Visualize this data",
      "Show me trends over time",
      "What metrics matter most?"
    ];
  }
  
  // If content contains numbers or percentages, offer analytics-focused replies
  if (/\d+%|\$\d+|[\d,]+\.?\d*/.test(content)) {
    return [
      "Analyze these numbers",
      "What's causing these changes?",
      "How can we improve these metrics?"
    ];
  }
  
  // Default suggestions
  return ["Tell me more", "Can you explain that?", "What actions should I take?"];
};

/**
 * Format timestamp 
 */
export const formatTimestamp = (timestamp: string | Date | undefined): string => {
  if (!timestamp) {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  try {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } catch (e) {
    console.warn('[MessageContentUtils] Error formatting timestamp:', e);
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
};

/**
 * Extract keywords from content for better suggestions
 * @param content The message content
 * @returns Array of extracted keywords
 */
export const extractKeywords = (content: string): string[] => {
  if (!content || typeof content !== 'string') return [];
  
  // Simple keyword extraction based on frequency and importance
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3)  // Only words longer than 3 chars
    .filter(word => !['this', 'that', 'with', 'from', 'have', 'your'].includes(word)); // Filter common words
  
  // Count word frequency
  const wordCounts: Record<string, number> = {};
  words.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });
  
  // Sort by frequency and return top keywords
  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(entry => entry[0]);
};

