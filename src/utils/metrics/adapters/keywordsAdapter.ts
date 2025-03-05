
import { MetricsProcessor } from '../MetricsProcessor';
import { MetricsRegistry } from '../MetricsRegistry';
import { KeywordMetric, ProcessedKeywordData } from '@/components/keywords/types';

/**
 * Adapter to convert keyword metrics to the standardized format
 * and register them with the MetricsRegistry
 */
export function registerKeywordMetrics(
  keywords: KeywordMetric[] | ProcessedKeywordData[],
  options: { source?: string; confidence?: number } = {}
): void {
  if (!keywords || keywords.length === 0) return;
  
  const registry = MetricsRegistry.getInstance();
  const processor = new MetricsProcessor('keywords');
  const standardizedMetrics: Record<string, any> = {};
  
  // Aggregate metrics
  const aggregates = {
    totalVolume: 0,
    avgDifficulty: 0,
    avgKei: 0,
    avgRelevancy: 0,
    avgChance: 0,
    avgGrowth: 0,
    highOpportunityCount: 0,
    opportunityScore: 0
  };
  
  // Calculate aggregate metrics
  keywords.forEach(keyword => {
    aggregates.totalVolume += keyword.volume || 0;
    aggregates.avgDifficulty += keyword.difficulty || 0;
    aggregates.avgKei += keyword.kei || 0;
    aggregates.avgRelevancy += keyword.relevancy || 0;
    aggregates.avgChance += keyword.chance || 0;
    aggregates.avgGrowth += keyword.growth || 0;
    
    // Count high opportunity keywords (opportunityScore > 70)
    if ('opportunityScore' in keyword && typeof keyword.opportunityScore === 'number' && keyword.opportunityScore > 70) {
      aggregates.highOpportunityCount++;
    }
    
    if ('opportunityScore' in keyword && typeof keyword.opportunityScore === 'number') {
      aggregates.opportunityScore += keyword.opportunityScore;
    }
  });
  
  // Normalize averages
  const count = keywords.length;
  aggregates.avgDifficulty /= count;
  aggregates.avgKei /= count;
  aggregates.avgRelevancy /= count;
  aggregates.avgChance /= count;
  aggregates.avgGrowth /= count;
  aggregates.opportunityScore /= count;
  
  // Register individual top keywords (limit to top 10 by volume)
  const topKeywords = [...keywords]
    .sort((a, b) => (b.volume || 0) - (a.volume || 0))
    .slice(0, 10);
  
  topKeywords.forEach((keyword, index) => {
    const keywordMetrics = {
      [`keyword_${index}_volume`]: {
        value: keyword.volume || 0,
        rawValue: keyword.volume || 0,
        formatted: keyword.volume?.toString() || '0',
        metadata: {
          domain: 'keywords',
          category: 'volume',
          metricKey: `keyword_${index}_volume`,
          keywordName: keyword.keyword,
          ...options
        }
      },
      [`keyword_${index}_difficulty`]: {
        value: keyword.difficulty || 0,
        rawValue: keyword.difficulty || 0,
        formatted: `${Math.round(keyword.difficulty || 0)}`,
        metadata: {
          domain: 'keywords',
          category: 'difficulty',
          metricKey: `keyword_${index}_difficulty`,
          keywordName: keyword.keyword,
          ...options
        }
      }
    };
    
    // Add opportunity score if available
    if ('opportunityScore' in keyword && typeof keyword.opportunityScore === 'number') {
      keywordMetrics[`keyword_${index}_opportunity`] = {
        value: keyword.opportunityScore,
        rawValue: keyword.opportunityScore,
        formatted: `${Math.round(keyword.opportunityScore)}`,
        metadata: {
          domain: 'keywords',
          category: 'opportunity',
          metricKey: `keyword_${index}_opportunity`,
          keywordName: keyword.keyword,
          ...options
        }
      };
    }
    
    Object.assign(standardizedMetrics, keywordMetrics);
  });
  
  // Register aggregate metrics
  standardizedMetrics['totalKeywordVolume'] = {
    value: aggregates.totalVolume,
    rawValue: aggregates.totalVolume,
    formatted: processor.formatValue('totalKeywordVolume', aggregates.totalVolume),
    metadata: {
      domain: 'keywords',
      category: 'volume',
      metricKey: 'totalKeywordVolume',
      ...options
    }
  };
  
  standardizedMetrics['avgKeywordDifficulty'] = {
    value: aggregates.avgDifficulty,
    rawValue: aggregates.avgDifficulty,
    formatted: Math.round(aggregates.avgDifficulty).toString(),
    metadata: {
      domain: 'keywords',
      category: 'difficulty',
      metricKey: 'avgKeywordDifficulty',
      ...options
    }
  };
  
  standardizedMetrics['avgOpportunityScore'] = {
    value: aggregates.opportunityScore,
    rawValue: aggregates.opportunityScore,
    formatted: Math.round(aggregates.opportunityScore).toString(),
    metadata: {
      domain: 'keywords',
      category: 'opportunity',
      metricKey: 'avgOpportunityScore',
      ...options
    }
  };
  
  standardizedMetrics['highOpportunityCount'] = {
    value: aggregates.highOpportunityCount,
    rawValue: aggregates.highOpportunityCount,
    formatted: aggregates.highOpportunityCount.toString(),
    metadata: {
      domain: 'keywords',
      category: 'opportunity',
      metricKey: 'highOpportunityCount',
      ...options
    }
  };
  
  // Register all standardized metrics with the registry
  registry.registerMetrics('keywords', standardizedMetrics);
  
  console.log(`[KeywordsAdapter] Registered ${Object.keys(standardizedMetrics).length} metrics with registry`);
}
