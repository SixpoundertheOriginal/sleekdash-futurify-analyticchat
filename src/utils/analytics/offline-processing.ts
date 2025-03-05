/**
 * Offline processing utilities to reduce dependency on OpenAI API
 * Provides local metric extraction and message formatting capabilities
 */

import { extractMetricsLocally, processContentWithFallback } from "@/utils/message-content-utils";

// Known metric types for type safety
export type MetricType = 
  | 'downloads' 
  | 'revenue' 
  | 'impressions' 
  | 'conversions' 
  | 'userCount' 
  | 'sessionCount' 
  | 'crashCount' 
  | 'conversionRate'
  | 'retentionRate';

// Mapping to standardize metric names from various formats
const metricNameMap: Record<string, MetricType> = {
  'download': 'downloads',
  'downloads': 'downloads',
  'installs': 'downloads',
  'installations': 'downloads',
  'revenue': 'revenue',
  'proceeds': 'revenue',
  'sales': 'revenue',
  'earnings': 'revenue',
  'impression': 'impressions',
  'impressions': 'impressions',
  'views': 'impressions',
  'conversion': 'conversions',
  'conversions': 'conversions',
  'user': 'userCount',
  'users': 'userCount',
  'customers': 'userCount',
  'session': 'sessionCount',
  'sessions': 'sessionCount',
  'crash': 'crashCount',
  'crashes': 'crashCount',
  'errors': 'crashCount',
  'conversion rate': 'conversionRate',
  'cvr': 'conversionRate',
  'retention': 'retentionRate',
  'retention rate': 'retentionRate'
};

/**
 * Format metrics for display with proper units
 */
export const formatMetric = (value: number, type: MetricType | string): string => {
  if (!value && value !== 0) return 'N/A';
  
  // Format based on metric type
  switch (type) {
    case 'downloads':
    case 'impressions':
    case 'conversions':
    case 'userCount':
    case 'sessionCount':
    case 'crashCount':
      return value >= 1000000
        ? `${(value / 1000000).toFixed(1)}M`
        : value >= 1000
          ? `${(value / 1000).toFixed(1)}K`
          : Math.round(value).toString();
      
    case 'revenue':
      return value >= 1000000
        ? `$${(value / 1000000).toFixed(1)}M`
        : value >= 1000
          ? `$${(value / 1000).toFixed(1)}K`
          : `$${Math.round(value)}`;
      
    case 'conversionRate':
    case 'retentionRate':
      return `${value.toFixed(2)}%`;
      
    default:
      return value.toString();
  }
};

/**
 * Process metrics data with OpenAI fallback
 * @param content The text content to extract metrics from
 * @param openAiProcessor Function to process with OpenAI API
 * @returns Processed metrics with fallback to local extraction
 */
export const processMetricsWithFallback = async (
  content: string,
  openAiProcessor?: (content: string) => Promise<Record<string, any>>
): Promise<Record<string, any>> => {
  // If OpenAI processor is provided, use it with fallback
  if (openAiProcessor) {
    return await processContentWithFallback(content, openAiProcessor);
  }
  
  // Otherwise, just use local extraction
  return extractMetricsLocally(content);
};

/**
 * Standardize metric names from various input formats
 * @param metrics Object containing metrics with potentially non-standard names
 * @returns Object with standardized metric names
 */
export const standardizeMetricNames = (metrics: Record<string, any>): Record<string, any> => {
  const standardized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(metrics)) {
    // Look for matching standard name
    let standardKey: string | undefined;
    for (const [pattern, standardName] of Object.entries(metricNameMap)) {
      if (key.toLowerCase().includes(pattern.toLowerCase())) {
        standardKey = standardName;
        break;
      }
    }
    
    // Use standard key if found, otherwise keep original
    standardized[standardKey || key] = value;
  }
  
  return standardized;
};

/**
 * Detect important keyword metrics in text without using OpenAI
 * Useful for keyword analysis when OpenAI API is unavailable
 */
export const extractKeywordMetrics = (content: string): Record<string, any> => {
  const metrics: Record<string, any> = {
    keywords: [],
    topOpportunities: [],
    competitorGaps: []
  };
  
  // Extract keywords with search volume and difficulty
  const keywordPattern = /([a-z0-9\s]+)[\s\-]+(\d+)[\s\-]+(\d+)/gi;
  let match;
  
  while ((match = keywordPattern.exec(content)) !== null) {
    if (match[1] && match[2] && match[3]) {
      metrics.keywords.push({
        term: match[1].trim(),
        volume: parseInt(match[2]),
        difficulty: parseInt(match[3])
      });
    }
  }
  
  // Sort extracted keywords by implied opportunity (volume/difficulty ratio)
  metrics.keywords = metrics.keywords
    .filter(k => k.difficulty > 0)  // Avoid division by zero
    .sort((a, b) => (b.volume / b.difficulty) - (a.volume / a.difficulty))
    .slice(0, 20);  // Limit to top 20
  
  // Extract top opportunities based on keyword phrases
  const opportunityPattern = /(high|top|best) opportunities?:?\s*([\s\S]+?)(?=\n\n|\n[A-Z]|$)/i;
  const opportunityMatch = content.match(opportunityPattern);
  
  if (opportunityMatch && opportunityMatch[2]) {
    const opportunities = opportunityMatch[2]
      .split(/\n|-/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    metrics.topOpportunities = opportunities.slice(0, 5);
  }
  
  return metrics;
};

/**
 * Detect if content contains specific types of data
 */
export const detectContentType = (content: string): 'keywords' | 'analytics' | 'general' => {
  // Check for keyword-specific terms
  const keywordTerms = ['keyword', 'search volume', 'difficulty', 'ranking', 'aso', 'search term'];
  const hasKeywordIndicators = keywordTerms.some(term => content.toLowerCase().includes(term));
  
  // Check for analytics-specific terms
  const analyticsTerms = ['conversion rate', 'revenue', 'impressions', 'downloads', 'user retention'];
  const hasAnalyticsIndicators = analyticsTerms.some(term => content.toLowerCase().includes(term));
  
  if (hasKeywordIndicators && !hasAnalyticsIndicators) {
    return 'keywords';
  } else if (hasAnalyticsIndicators) {
    return 'analytics';
  } else {
    return 'general';
  }
};

/**
 * Extract actionable recommendations from text without OpenAI
 */
export const extractRecommendations = (content: string): string[] => {
  // Look for recommendation sections
  const recommendationPatterns = [
    /recommendations?:?\s*([\s\S]+?)(?=\n\n|\n[A-Z]|$)/i,
    /suggested actions?:?\s*([\s\S]+?)(?=\n\n|\n[A-Z]|$)/i,
    /what you should do:?\s*([\s\S]+?)(?=\n\n|\n[A-Z]|$)/i,
    /action items?:?\s*([\s\S]+?)(?=\n\n|\n[A-Z]|$)/i
  ];
  
  for (const pattern of recommendationPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      return match[1]
        .split(/\n|-|•|[0-9]+\./)
        .map(item => item.trim())
        .filter(item => item.length > 0)
        .slice(0, 5);  // Limit to top 5 recommendations
    }
  }
  
  return [];
};

/**
 * Format message content without OpenAI processing
 * For use when OpenAI API is unavailable
 */
export const formatMessageOffline = (content: string): string => {
  // Basic formatting to structure the message content
  let formattedContent = content;
  
  // Add section headers if they don't exist
  if (!content.includes('Summary') && !content.includes('summary')) {
    const contentType = detectContentType(content);
    
    if (contentType === 'keywords') {
      formattedContent = `## Keywords Analysis\n\n${formattedContent}`;
    } else if (contentType === 'analytics') {
      formattedContent = `## Performance Analysis\n\n${formattedContent}`;
    }
  }
  
  // Extract recommendations and add them if they exist
  const recommendations = extractRecommendations(content);
  if (recommendations.length > 0 && !content.includes('Recommendation')) {
    formattedContent += '\n\n## Recommendations\n\n';
    formattedContent += recommendations.map(rec => `- ${rec}`).join('\n');
  }
  
  return formattedContent;
};
