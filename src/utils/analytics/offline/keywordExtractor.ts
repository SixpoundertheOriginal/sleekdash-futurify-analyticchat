
/**
 * Keyword extraction utilities for offline processing
 */

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
