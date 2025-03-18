
import { BaseExtractor, ExtractionResult } from './BaseExtractor';
import { normalizeValue } from '../offline/normalization';
import { ProcessedAnalytics } from '../types';

/**
 * App Store metrics extractor
 */
export class AppStoreExtractor implements BaseExtractor<ProcessedAnalytics> {
  id = 'app-store-extractor';
  name = 'App Store Extractor';
  priority = 100;
  
  // Store patterns for different metrics
  private patterns = {
    impressions: [
      /Impressions:?\s*\??\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)/i,
      /Impressions:?\s*\??\s*([0-9,.KMBkmb]+)/i,
      /Impressions\s*\n\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)?/i,
      /([0-9,.KMBkmb]+)\s*impressions/i
    ],
    pageViews: [
      /(?:Product )?Page Views:?\s*\??\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)/i,
      /(?:Product )?Page Views:?\s*\??\s*([0-9,.KMBkmb]+)/i,
      /(?:Product )?Page Views\s*\n\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)?/i,
      /([0-9,.KMBkmb]+)\s*(?:product )?page views/i
    ],
    conversionRate: [
      /Conversion Rate:?\s*\??\s*([0-9,.]+)%\s*([+-][0-9]+%)/i,
      /Conversion Rate:?\s*\??\s*([0-9,.]+)%/i,
      /Conversion Rate:?\s*\??\s*([0-9,.]+)\s*%\s*([+-][0-9]+%)?/i,
      /Conversion Rate\s*\n\s*([0-9,.]+)%\s*([+-][0-9]+%)?/i,
      /([0-9,.]+)%\s*conversion rate/i
    ],
    downloads: [
      /(?:Total )?Downloads:?\s*\??\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)/i,
      /(?:Total )?Downloads:?\s*\??\s*([0-9,.KMBkmb]+)/i,
      /(?:Total )?Downloads\s*\n\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)?/i,
      /([0-9,.KMBkmb]+)\s*(?:total )?downloads/i
    ],
    proceeds: [
      /Proceeds:?\s*\??\s*\$?([0-9,.KMBkmb]+)\s*([+-][0-9]+%)/i,
      /Proceeds:?\s*\??\s*\$?([0-9,.KMBkmb]+)/i,
      /Proceeds\s*\n\s*\$?([0-9,.KMBkmb]+)\s*([+-][0-9]+%)?/i,
      /\$?([0-9,.KMBkmb]+)\s*proceeds/i
    ],
    crashes: [
      /Crashes:?\s*\??\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)/i,
      /Crashes:?\s*\??\s*([0-9,.KMBkmb]+)/i,
      /Crash Count:?\s*\??\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)?/i,
      /Crashes\s*\n\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)?/i,
      /([0-9,.KMBkmb]+)\s*crashes/i
    ],
    dateRange: [
      /([A-Za-z]+ \d{1,2}[-–]\w+ \d{1,2},? \d{4})/i,
      /Date Range:?\s*(.+?)(?:\n|$)/i,
      /([A-Za-z]+ \d{1,2} ?[-–] ?[A-Za-z]+ \d{1,2},? \d{4})/i,
      /([A-Za-z]+ \d{1,2} to [A-Za-z]+ \d{1,2},? \d{4})/i
    ]
  };
  
  /**
   * Extract metrics from App Store data
   */
  extract(input: string): ProcessedAnalytics | null {
    try {
      if (!input || typeof input !== 'string') {
        console.log('[AppStoreExtractor] Invalid input: not a string or empty');
        return null;
      }
      
      // Create the base result structure
      const result: ProcessedAnalytics = {
        summary: {
          title: "App Store Analytics",
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
      
      // Extract key metrics
      this.extractMetric(input, 'impressions', result);
      this.extractMetric(input, 'pageViews', result);
      this.extractMetric(input, 'conversionRate', result);
      this.extractMetric(input, 'downloads', result);
      this.extractMetric(input, 'proceeds', result);
      this.extractMetric(input, 'crashes', result);
      
      // Extract date range
      for (const pattern of this.patterns.dateRange) {
        const match = input.match(pattern);
        if (match && match[1]) {
          result.summary.dateRange = match[1].trim();
          break;
        }
      }
      
      // Calculate derived metrics
      if (result.acquisition.impressions.value > 0 && result.acquisition.pageViews.value > 0) {
        result.acquisition.funnelMetrics.impressionsToViews = 
          (result.acquisition.pageViews.value / result.acquisition.impressions.value) * 100;
      }
      
      if (result.acquisition.pageViews.value > 0 && result.acquisition.downloads.value > 0) {
        result.acquisition.funnelMetrics.viewsToDownloads = 
          (result.acquisition.downloads.value / result.acquisition.pageViews.value) * 100;
      }
      
      if (result.financial.proceeds.value > 0 && result.acquisition.downloads.value > 0) {
        result.financial.derivedMetrics.arpd = 
          result.financial.proceeds.value / result.acquisition.downloads.value;
      }
      
      // Validate the extracted data
      const isValid = this.validate(result);
      if (!isValid) {
        console.log('[AppStoreExtractor] Validation failed');
        return null;
      }
      
      return result;
    } catch (error) {
      console.error('[AppStoreExtractor] Error extracting metrics:', error);
      return null;
    }
  }
  
  /**
   * Extract a specific metric and update the result
   */
  private extractMetric(input: string, metricName: string, result: ProcessedAnalytics): void {
    const patterns = this.patterns[metricName as keyof typeof this.patterns];
    if (!patterns) return;
    
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        const value = metricName === 'conversionRate' 
          ? parseFloat(match[1]) 
          : normalizeValue(match[1]);
          
        const change = match[2] ? parseInt(match[2]) : 0;
        
        // Update the appropriate section of the result
        switch (metricName) {
          case 'impressions':
            result.acquisition.impressions = { value, change };
            break;
          case 'pageViews':
            result.acquisition.pageViews = { value, change };
            break;
          case 'conversionRate':
            result.acquisition.conversionRate = { value, change };
            break;
          case 'downloads':
            result.acquisition.downloads = { value, change };
            break;
          case 'proceeds':
            result.financial.proceeds = { value, change };
            break;
          case 'crashes':
            result.technical.crashes = { value, change };
            break;
        }
        
        break;
      }
    }
  }
  
  /**
   * Validate the extracted data
   */
  validate(result: ProcessedAnalytics): boolean {
    // Ensure we have at least some key metrics
    const hasAcquisitionMetrics = 
      result.acquisition.downloads.value > 0 || 
      result.acquisition.impressions.value > 0;
      
    const hasFinancialMetrics = result.financial.proceeds.value > 0;
    const hasTechnicalMetrics = result.technical.crashes.value > 0;
    
    // At least one category of metrics should have data
    return hasAcquisitionMetrics || hasFinancialMetrics || hasTechnicalMetrics;
  }
}
