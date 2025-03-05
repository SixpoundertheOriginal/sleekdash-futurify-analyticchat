
import { MetricsRegistry } from './MetricsRegistry';

/**
 * Utility for finding correlations between metrics from different domains
 */
export interface CorrelationResult {
  source: {
    domain: string;
    key: string;
    value: number;
  };
  target: {
    domain: string;
    key: string;
    value: number;
  };
  score: number;  // Correlation score: -1 to 1
  significance: number; // Statistical significance: 0 to 1
}

/**
 * Find correlations between metrics across different domains
 * @param sourceDomain The source domain to correlate from
 * @param targetDomain The target domain to correlate with
 * @param options Correlation options
 * @returns Array of correlation results
 */
export function findCrossDomainCorrelations(
  sourceDomain: string = 'keywords',
  targetDomain: string = 'appStore',
  options: {
    minimumSignificance?: number;
    minimumCorrelation?: number;
  } = { minimumSignificance: 0.5, minimumCorrelation: 0.3 }
): CorrelationResult[] {
  const registry = MetricsRegistry.getInstance();
  const sourceMetrics = registry.getMetrics(sourceDomain);
  const targetMetrics = registry.getMetrics(targetDomain);
  
  const results: CorrelationResult[] = [];
  
  // If there are no metrics in either domain, return empty results
  if (Object.keys(sourceMetrics).length === 0 || Object.keys(targetMetrics).length === 0) {
    console.log(`[Correlation] No metrics available for correlation between ${sourceDomain} and ${targetDomain}`);
    return results;
  }
  
  // For each source metric, try to find correlations with target metrics
  for (const [sourceKey, sourceMetric] of Object.entries(sourceMetrics)) {
    // Skip if not a numeric value
    if (typeof sourceMetric.value !== 'number') continue;
    
    for (const [targetKey, targetMetric] of Object.entries(targetMetrics)) {
      // Skip if not a numeric value
      if (typeof targetMetric.value !== 'number') continue;
      
      // This is a simple correlation calculation - in a real implementation,
      // you would use proper statistical methods with sufficient data points
      
      // For demonstration purposes, we'll use a simple heuristic based on naming patterns
      // This should be replaced with actual correlation calculation in a production environment
      let correlationScore = 0;
      let significance = 0;
      
      // Keyword volume to downloads correlation pattern
      if (sourceKey.includes('volume') && targetKey.includes('downloads')) {
        correlationScore = 0.7;
        significance = 0.8;
      } 
      // Keyword difficulty to conversion rate correlation pattern
      else if (sourceKey.includes('difficulty') && targetKey.includes('conversion')) {
        correlationScore = -0.5;  // Negative correlation - higher difficulty, lower conversion
        significance = 0.6;
      }
      // Opportunity score to proceeds correlation pattern
      else if (sourceKey.includes('opportunity') && targetKey.includes('proceeds')) {
        correlationScore = 0.6;
        significance = 0.75;
      }
      // Generic weak correlation for other metrics
      else {
        correlationScore = 0.2;
        significance = 0.3;
      }
      
      // Filter based on minimum thresholds
      if (Math.abs(correlationScore) >= options.minimumCorrelation! && 
          significance >= options.minimumSignificance!) {
        results.push({
          source: {
            domain: sourceDomain,
            key: sourceKey,
            value: sourceMetric.value
          },
          target: {
            domain: targetDomain,
            key: targetKey,
            value: targetMetric.value
          },
          score: correlationScore,
          significance
        });
      }
    }
  }
  
  // Sort by significance and correlation strength
  results.sort((a, b) => 
    (b.significance * Math.abs(b.score)) - (a.significance * Math.abs(a.score))
  );
  
  console.log(`[Correlation] Found ${results.length} correlations between ${sourceDomain} and ${targetDomain}`);
  
  return results;
}

/**
 * Find the most significant metric correlations
 * @param limit Maximum number of correlations to return
 * @returns Top correlation results
 */
export function findMostSignificantCorrelations(limit: number = 5): CorrelationResult[] {
  // Get correlations in both directions
  const keywordsToAppStore = findCrossDomainCorrelations('keywords', 'appStore');
  const appStoreToKeywords = findCrossDomainCorrelations('appStore', 'keywords');
  
  // Combine and sort
  return [...keywordsToAppStore, ...appStoreToKeywords]
    .sort((a, b) => 
      (b.significance * Math.abs(b.score)) - (a.significance * Math.abs(a.score))
    )
    .slice(0, limit);
}
