
/**
 * Local extraction utilities to extract metrics without API calls
 */

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
  metrics.downloadsChange = extractChangePercentage('downloads', content) || 0;
  metrics.revenueChange = extractChangePercentage('revenue', content) || 
                          extractChangePercentage('proceeds', content) || 0;
  metrics.conversionChange = extractChangePercentage('conversion', content) || 0;
  metrics.impressionsChange = extractChangePercentage('impressions', content) || 0;
  
  return metrics;
};

/**
 * Extract percentage changes for metrics from text content
 */
const extractChangePercentage = (metricName: string, content: string): number | null => {
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

