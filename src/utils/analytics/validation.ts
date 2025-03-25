
import { ProcessedAnalytics } from "./types";

/**
 * Validates if the analytics data has the minimal metrics required for visualization
 */
export function hasValidMetrics(data: ProcessedAnalytics | null): boolean {
  if (!data) return false;
  
  // Check if we have at least one of these key metrics
  const hasDownloads = data.acquisition?.downloads?.value > 0;
  const hasProceeds = data.financial?.proceeds?.value > 0;
  const hasSessions = data.engagement?.sessionsPerDevice?.value > 0;
  
  return hasDownloads || hasProceeds || hasSessions;
}

/**
 * Deep comparison utility for verifying state equivalence during migration
 * Used for Zustand migration to ensure state is preserved
 */
export function compareAnalyticsState(contextState: any, zustandState: any): {
  equivalent: boolean;
  differences: Array<{path: string, contextValue: any, zustandValue: any}>
} {
  const differences: Array<{path: string, contextValue: any, zustandValue: any}> = [];
  
  // Only compare specific fields we care about for migration
  const fieldsToCompare = [
    'processedAnalytics',
    'dateRange',
    'activeTab',
    'isProcessing',
    'isAnalyzing',
    'processingError',
    'extractedData',
    'analysisResult',
  ];
  
  let equivalent = true;
  
  fieldsToCompare.forEach(field => {
    if (JSON.stringify(contextState[field]) !== JSON.stringify(zustandState[field])) {
      equivalent = false;
      differences.push({
        path: field,
        contextValue: contextState[field],
        zustandValue: zustandState[field]
      });
    }
  });
  
  return { equivalent, differences };
}

/**
 * Validates if an extracted metric value is within expected ranges
 * @param metricKey The key of the metric to validate
 * @param value The extracted value to validate
 * @param relatedValues Optional related values for cross-validation
 * @returns Validation result with confidence score and warnings
 */
export function validateMetricValue(
  metricKey: string, 
  value: number,
  relatedValues?: Record<string, number>
): { 
  confidence: number;
  warnings: string[];
} {
  const warnings: string[] = [];
  let confidence = 85; // Start with high confidence, reduce based on validation issues
  
  // Skip validation for zero values
  if (value === 0) {
    return { confidence: 50, warnings: ['Zero value detected'] };
  }
  
  // Basic sanity checks based on metric type
  switch (metricKey) {
    case 'impressions':
      if (value < 10) {
        warnings.push('Impressions unusually low');
        confidence -= 20;
      } else if (value > 1000000000) {
        warnings.push('Impressions unusually high');
        confidence -= 15;
      }
      break;
      
    case 'pageViews':
      if (value < 5) {
        warnings.push('Page views unusually low');
        confidence -= 20;
      } else if (value > 100000000) {
        warnings.push('Page views unusually high');
        confidence -= 15;
      }
      
      // Cross-validate with impressions if available
      if (relatedValues?.impressions && value > relatedValues.impressions) {
        warnings.push('Page views higher than impressions');
        confidence -= 30;
      }
      break;
      
    case 'downloads':
      if (value < 1) {
        warnings.push('Downloads unusually low');
        confidence -= 20;
      } else if (value > 10000000) {
        warnings.push('Downloads unusually high');
        confidence -= 15;
      }
      
      // Cross-validate with page views if available
      if (relatedValues?.pageViews && value > relatedValues.pageViews) {
        warnings.push('Downloads higher than page views');
        confidence -= 25;
      }
      break;
      
    case 'conversionRate':
      if (value < 0 || value > 100) {
        warnings.push('Conversion rate outside valid range (0-100%)');
        confidence -= 40;
      } else if (value > 50) {
        warnings.push('Conversion rate unusually high');
        confidence -= 20;
      } else if (value < 0.1) {
        warnings.push('Conversion rate unusually low');
        confidence -= 10;
      }
      break;
      
    case 'proceeds':
      if (value < 0) {
        warnings.push('Negative proceeds value');
        confidence -= 30;
      } else if (value > 10000000) {
        warnings.push('Proceeds unusually high');
        confidence -= 15;
      }
      break;
      
    case 'proceedsPerUser':
      if (value < 0) {
        warnings.push('Negative proceeds per user');
        confidence -= 30;
      } else if (value > 1000) {
        warnings.push('Proceeds per user unusually high');
        confidence -= 20;
      }
      break;
      
    case 'sessionsPerDevice':
      if (value < 0) {
        warnings.push('Negative sessions per device');
        confidence -= 30;
      } else if (value > 100) {
        warnings.push('Sessions per device unusually high');
        confidence -= 20;
      }
      break;
      
    case 'crashes':
      if (value < 0) {
        warnings.push('Negative crashes value');
        confidence -= 30;
      }
      break;
  }
  
  // Cap confidence between 0-100
  confidence = Math.max(0, Math.min(100, confidence));
  
  return { confidence, warnings };
}

/**
 * Validates the consistency of a collection of metrics against each other
 * @param metrics Object containing multiple metrics
 * @returns Validation result with overall confidence and warnings
 */
export function validateMetricsConsistency(
  metrics: Record<string, number>
): {
  confidence: number;
  warnings: string[];
} {
  const warnings: string[] = [];
  let confidence = 90; // Start with high confidence
  
  // Check impressions > page views > downloads relationship
  if (metrics.impressions && metrics.pageViews && metrics.impressions < metrics.pageViews) {
    warnings.push('Impressions less than page views');
    confidence -= 25;
  }
  
  if (metrics.pageViews && metrics.downloads && metrics.pageViews < metrics.downloads) {
    warnings.push('Page views less than downloads');
    confidence -= 25;
  }
  
  // Check if downloads and conversion rate align with impressions
  if (metrics.downloads && metrics.impressions && metrics.conversionRate) {
    const expectedDownloads = metrics.impressions * (metrics.conversionRate / 100);
    const ratio = metrics.downloads / expectedDownloads;
    
    if (ratio < 0.5 || ratio > 2.0) {
      warnings.push('Downloads inconsistent with impressions and conversion rate');
      confidence -= 20;
    }
  }
  
  // Check if proceeds align with downloads (ARPD consistency)
  if (metrics.proceeds && metrics.downloads) {
    const arpd = metrics.proceeds / metrics.downloads;
    if (arpd > 100) {
      warnings.push('Average revenue per download unusually high');
      confidence -= 15;
    }
  }
  
  // Cap confidence between 0-100
  confidence = Math.max(0, Math.min(100, confidence));
  
  return { confidence, warnings };
}
