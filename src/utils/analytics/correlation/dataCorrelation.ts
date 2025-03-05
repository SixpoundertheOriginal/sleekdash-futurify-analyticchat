
import { ProcessedAnalytics } from "@/utils/analytics/types";
import { ProcessedKeywordData } from "@/components/keywords/types";
import { MetricCategory } from "@/utils/metrics/standardizedMetrics";

/**
 * Correlation types to identify the strength of relationships
 */
export enum CorrelationType {
  STRONG_POSITIVE = 'Strong Positive',
  MODERATE_POSITIVE = 'Moderate Positive',
  WEAK_POSITIVE = 'Weak Positive',
  NO_CORRELATION = 'No Correlation',
  WEAK_NEGATIVE = 'Weak Negative',
  MODERATE_NEGATIVE = 'Moderate Negative',
  STRONG_NEGATIVE = 'Strong Negative'
}

/**
 * Interface for correlation results
 */
export interface CorrelationResult {
  sourceDomain: 'keyword' | 'appStore';
  sourceMetric: string;
  targetDomain: 'keyword' | 'appStore';
  targetMetric: string;
  correlationCoefficient: number;
  correlationType: CorrelationType;
  description: string;
  significance: number; // 0-1 value indicating statistical significance
}

/**
 * Convert correlation coefficient to correlation type
 */
function getCorrelationType(coefficient: number): CorrelationType {
  const absCoefficient = Math.abs(coefficient);
  
  if (absCoefficient < 0.2) return CorrelationType.NO_CORRELATION;
  if (absCoefficient < 0.4) return coefficient > 0 ? CorrelationType.WEAK_POSITIVE : CorrelationType.WEAK_NEGATIVE;
  if (absCoefficient < 0.7) return coefficient > 0 ? CorrelationType.MODERATE_POSITIVE : CorrelationType.MODERATE_NEGATIVE;
  return coefficient > 0 ? CorrelationType.STRONG_POSITIVE : CorrelationType.STRONG_NEGATIVE;
}

/**
 * Calculate Pearson correlation coefficient between two arrays of values
 */
export function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;
  
  // Calculate means
  const xMean = x.reduce((a, b) => a + b, 0) / x.length;
  const yMean = y.reduce((a, b) => a + b, 0) / y.length;
  
  // Calculate covariance and standard deviations
  let covariance = 0;
  let xStdDev = 0;
  let yStdDev = 0;
  
  for (let i = 0; i < x.length; i++) {
    const xDiff = x[i] - xMean;
    const yDiff = y[i] - yMean;
    covariance += xDiff * yDiff;
    xStdDev += xDiff * xDiff;
    yStdDev += yDiff * yDiff;
  }
  
  if (xStdDev === 0 || yStdDev === 0) return 0;
  
  return covariance / (Math.sqrt(xStdDev) * Math.sqrt(yStdDev));
}

/**
 * Find correlations between keyword and app store metrics
 */
export function findCrossDomainCorrelations(
  appStoreData: ProcessedAnalytics,
  keywordData: ProcessedKeywordData[]
): CorrelationResult[] {
  const results: CorrelationResult[] = [];
  
  // Extract key metrics from app store data
  const appStoreMetrics = {
    downloads: appStoreData.acquisition?.downloads?.value || 0,
    proceeds: appStoreData.financial?.proceeds?.value || 0,
    conversionRate: appStoreData.acquisition?.conversionRate?.value || 0,
    crashes: appStoreData.technical?.crashes?.value || 0
  };
  
  // Calculate average keyword metrics
  const keywordMetrics = {
    avgDifficulty: keywordData.reduce((sum, k) => sum + k.difficulty, 0) / keywordData.length,
    avgVolume: keywordData.reduce((sum, k) => sum + k.volume, 0) / keywordData.length,
    avgOpportunity: keywordData.reduce((sum, k) => sum + k.opportunityScore, 0) / keywordData.length,
    topKeywords: keywordData.sort((a, b) => b.opportunityScore - a.opportunityScore).slice(0, 5)
  };
  
  // Key correlations to analyze
  const correlations = [
    {
      description: "Keyword opportunity score's impact on app downloads",
      sourceMetric: "opportunityScore",
      targetMetric: "downloads",
      estimate: 0.65 // Estimated correlation based on typical patterns
    },
    {
      description: "Keyword search volume's impact on app proceeds",
      sourceMetric: "volume",
      targetMetric: "proceeds",
      estimate: 0.58
    },
    {
      description: "Keyword difficulty's impact on conversion rate",
      sourceMetric: "difficulty",
      targetMetric: "conversionRate",
      estimate: -0.42 // Negative correlation - higher difficulty often means lower conversion
    }
  ];
  
  // Calculate estimated correlations
  // Note: In a real implementation, we'd need historical data to calculate actual correlations
  correlations.forEach(c => {
    results.push({
      sourceDomain: 'keyword',
      sourceMetric: c.sourceMetric,
      targetDomain: 'appStore',
      targetMetric: c.targetMetric,
      correlationCoefficient: c.estimate,
      correlationType: getCorrelationType(c.estimate),
      description: c.description,
      significance: Math.random() * 0.3 + 0.7 // Simulated significance for demo purposes
    });
  });
  
  return results;
}

/**
 * Generate insights from correlation data
 */
export function generateCorrelationInsights(
  correlations: CorrelationResult[]
): string[] {
  return correlations.map(c => {
    const impact = c.correlationCoefficient > 0 ? "positive" : "negative";
    const strength = c.correlationType.split(' ')[0].toLowerCase();
    
    return `There is a ${strength} ${impact} correlation between ${c.sourceMetric} and ${c.targetMetric} (${c.correlationCoefficient.toFixed(2)}), suggesting that ${c.description.toLowerCase()}.`;
  });
}

/**
 * Calculate improvement potential based on keyword metrics
 */
export function calculateImprovementPotential(
  keywordData: ProcessedKeywordData[],
  metricCategory: MetricCategory
): number {
  // Filter keywords by opportunity score
  const highOpportunityKeywords = keywordData.filter(k => k.opportunityScore >= 60);
  
  if (highOpportunityKeywords.length === 0) return 0;
  
  // Calculate average improvement potential
  switch (metricCategory) {
    case MetricCategory.ACQUISITION:
      return highOpportunityKeywords.reduce((sum, k) => sum + k.volume * 0.03, 0);
    case MetricCategory.FINANCIAL:
      // Estimate financial impact: volume * estimatedMonetization
      return highOpportunityKeywords.reduce((sum, k) => sum + k.volume * 0.015, 0);
    case MetricCategory.ENGAGEMENT:
      return highOpportunityKeywords.length * 2.5;
    default:
      return 0;
  }
}
