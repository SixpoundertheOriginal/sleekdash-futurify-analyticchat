
import { BaseExtractor } from './BaseExtractor';
import { ProcessedAnalytics } from '../types';

/**
 * Extractor specialized for user retention metrics
 */
export class RetentionExtractor implements BaseExtractor<ProcessedAnalytics> {
  id = 'retention-extractor';
  name = 'User Retention Extractor';
  priority = 70; // Lower priority than main extractors
  
  private patterns = {
    day1: {
      value: [
        /day 1 retention:?\s*(\d+\.?\d*)%/i,
        /day 1:?\s*(\d+\.?\d*)%/i,
        /1-day retention:?\s*(\d+\.?\d*)%/i
      ],
      benchmark: [
        /day 1 retention.*?benchmark:?\s*(\d+\.?\d*)%/i,
        /day 1.*?average:?\s*(\d+\.?\d*)%/i,
        /typical day 1 retention:?\s*(\d+\.?\d*)%/i
      ]
    },
    day7: {
      value: [
        /day 7 retention:?\s*(\d+\.?\d*)%/i,
        /day 7:?\s*(\d+\.?\d*)%/i,
        /7-day retention:?\s*(\d+\.?\d*)%/i
      ],
      benchmark: [
        /day 7 retention.*?benchmark:?\s*(\d+\.?\d*)%/i,
        /day 7.*?average:?\s*(\d+\.?\d*)%/i,
        /typical day 7 retention:?\s*(\d+\.?\d*)%/i
      ]
    },
    day14: {
      value: [
        /day 14 retention:?\s*(\d+\.?\d*)%/i,
        /day 14:?\s*(\d+\.?\d*)%/i,
        /14-day retention:?\s*(\d+\.?\d*)%/i
      ],
      benchmark: [
        /day 14 retention.*?benchmark:?\s*(\d+\.?\d*)%/i,
        /day 14.*?average:?\s*(\d+\.?\d*)%/i,
        /typical day 14 retention:?\s*(\d+\.?\d*)%/i
      ]
    },
    day28: {
      value: [
        /day 28 retention:?\s*(\d+\.?\d*)%/i,
        /day 28:?\s*(\d+\.?\d*)%/i,
        /28-day retention:?\s*(\d+\.?\d*)%/i
      ],
      benchmark: [
        /day 28 retention.*?benchmark:?\s*(\d+\.?\d*)%/i,
        /day 28.*?average:?\s*(\d+\.?\d*)%/i,
        /typical day 28 retention:?\s*(\d+\.?\d*)%/i
      ]
    }
  };
  
  /**
   * Extract retention data from input text
   */
  extract(input: string): ProcessedAnalytics | null {
    try {
      if (!input || typeof input !== 'string') {
        console.log('[RetentionExtractor] Invalid input: not a string or empty');
        return null;
      }
      
      // Check if input contains retention data
      if (!input.match(/retention|day \d+|\d+-day/i)) {
        console.log('[RetentionExtractor] No retention data found in input');
        return null;
      }
      
      // Create base result structure with default values
      const result: ProcessedAnalytics = {
        summary: {
          title: "App Store Retention Analytics",
          dateRange: "",
          executiveSummary: ""
        },
        acquisition: {
          impressions: { value: 0, change: 0 },
          pageViews: { value: 0, change: 0 },
          conversionRate: { value: 0, change: 0 },
          downloads: { value: 0, change: 0 },
          funnelMetrics: {
            impressionsToViews: 0,
            viewsToDownloads: 0
          }
        },
        financial: {
          proceeds: { value: 0, change: 0 },
          proceedsPerUser: { value: 0, change: 0 },
          derivedMetrics: {
            arpd: 0,
            revenuePerImpression: 0,
            monetizationEfficiency: 0,
            payingUserPercentage: 0
          }
        },
        engagement: {
          sessionsPerDevice: { value: 0, change: 0 },
          retention: {
            day1: { value: 0, benchmark: 0 },
            day7: { value: 0, benchmark: 0 }
          },
          confidenceScores: {
            overall: 0,
            sessionsPerDevice: 0,
            retention: 0
          },
          validationState: {
            valid: false,
            warnings: []
          }
        },
        technical: {
          crashes: { value: 0, change: 0 },
          crashRate: { value: 0, percentile: "" }
        },
        geographical: {
          markets: [],
          devices: [],
          sources: []
        }
      };
      
      // Extract retention metrics
      this.extractRetentionMetric(input, 'day1', result);
      this.extractRetentionMetric(input, 'day7', result);
      this.extractRetentionMetric(input, 'day14', result);
      this.extractRetentionMetric(input, 'day28', result);
      
      // Check if we extracted any retention data
      const hasRetentionData = 
        result.engagement.retention.day1.value > 0 || 
        result.engagement.retention.day7.value > 0 || 
        (result.engagement.retention.day14?.value || 0) > 0 ||
        (result.engagement.retention.day28?.value || 0) > 0;
      
      if (!hasRetentionData) {
        console.log('[RetentionExtractor] No retention values extracted');
        return null;
      }
      
      return result;
    } catch (error) {
      console.error('[RetentionExtractor] Error extracting retention data:', error);
      return null;
    }
  }
  
  /**
   * Extract a specific retention metric
   */
  private extractRetentionMetric(input: string, metricKey: 'day1' | 'day7' | 'day14' | 'day28', result: ProcessedAnalytics): void {
    // For day14 and day28, initialize if not present
    if ((metricKey === 'day14' || metricKey === 'day28') && !result.engagement.retention[metricKey]) {
      result.engagement.retention[metricKey] = { value: 0, benchmark: 0 };
    }
    
    // Extract value
    for (const pattern of this.patterns[metricKey].value) {
      const match = input.match(pattern);
      if (match && match[1]) {
        if (result.engagement.retention[metricKey]) {
          result.engagement.retention[metricKey]!.value = parseFloat(match[1]);
        }
        break;
      }
    }
    
    // Extract benchmark
    for (const pattern of this.patterns[metricKey].benchmark) {
      const match = input.match(pattern);
      if (match && match[1]) {
        if (result.engagement.retention[metricKey]) {
          result.engagement.retention[metricKey]!.benchmark = parseFloat(match[1]);
        }
        break;
      }
    }
  }
  
  /**
   * Validate the extracted retention data
   */
  validate(result: ProcessedAnalytics): boolean {
    // Consider valid if we have at least one retention metric
    return (
      result.engagement.retention.day1.value > 0 || 
      result.engagement.retention.day7.value > 0 ||
      (result.engagement.retention.day14?.value || 0) > 0 ||
      (result.engagement.retention.day28?.value || 0) > 0
    );
  }
}
