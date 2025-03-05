
/**
 * Content type detection utilities for offline processing
 */

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
