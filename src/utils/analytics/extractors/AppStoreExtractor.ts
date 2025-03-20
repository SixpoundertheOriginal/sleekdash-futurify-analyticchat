
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
  confidence = 0.8;
  
  // Store patterns for different metrics
  private patterns = {
    impressions: [
      // App Store Connect format with question mark on separate line
      /Impressions\s*\n\s*\?\s*\n\s*([0-9,.KMBkmb]+)\s*\n\s*([+-][0-9]+%)/i,
      /Impressions\s*\n\s*\?\s*\n\s*([0-9,.KMBkmb]+)/i,
      // Standard patterns
      /Impressions:?\s*\??\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)/i,
      /Impressions:?\s*\??\s*([0-9,.KMBkmb]+)/i,
      /Impressions\s*\n\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)?/i,
      /([0-9,.KMBkmb]+)\s*impressions/i
    ],
    pageViews: [
      // App Store Connect format with question mark on separate line
      /(?:Product )?Page Views\s*\n\s*\?\s*\n\s*([0-9,.KMBkmb]+)\s*\n\s*([+-][0-9]+%)/i,
      /(?:Product )?Page Views\s*\n\s*\?\s*\n\s*([0-9,.KMBkmb]+)/i,
      // Standard patterns
      /(?:Product )?Page Views:?\s*\??\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)/i,
      /(?:Product )?Page Views:?\s*\??\s*([0-9,.KMBkmb]+)/i,
      /(?:Product )?Page Views\s*\n\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)?/i,
      /([0-9,.KMBkmb]+)\s*(?:product )?page views/i
    ],
    conversionRate: [
      // App Store Connect format with question mark on separate line
      /Conversion Rate\s*\n\s*\?\s*\n\s*([0-9,.]+)%\s*\n\s*([+-][0-9]+%)/i,
      /Conversion Rate\s*\n\s*\?\s*\n\s*([0-9,.]+)%/i,
      // Standard patterns
      /Conversion Rate:?\s*\??\s*([0-9,.]+)%\s*([+-][0-9]+%)/i,
      /Conversion Rate:?\s*\??\s*([0-9,.]+)%/i,
      /Conversion Rate:?\s*\??\s*([0-9,.]+)\s*%\s*([+-][0-9]+%)?/i,
      /Conversion Rate\s*\n\s*([0-9,.]+)%\s*([+-][0-9]+%)?/i,
      /([0-9,.]+)%\s*conversion rate/i
    ],
    downloads: [
      // App Store Connect format with question mark on separate line
      /(?:Total )?Downloads\s*\n\s*\?\s*\n\s*([0-9,.KMBkmb]+)\s*\n\s*([+-][0-9]+%)/i,
      /(?:Total )?Downloads\s*\n\s*\?\s*\n\s*([0-9,.KMBkmb]+)/i,
      // Standard patterns
      /(?:Total )?Downloads:?\s*\??\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)/i,
      /(?:Total )?Downloads:?\s*\??\s*([0-9,.KMBkmb]+)/i,
      /(?:Total )?Downloads\s*\n\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)?/i,
      /([0-9,.KMBkmb]+)\s*(?:total )?downloads/i
    ],
    proceeds: [
      // App Store Connect format with question mark on separate line
      /Proceeds\s*\n\s*\?\s*\n\s*\$?([0-9,.KMBkmb]+)\s*\n\s*([+-][0-9]+%)/i,
      /Proceeds\s*\n\s*\?\s*\n\s*\$?([0-9,.KMBkmb]+)/i,
      // Standard patterns
      /Proceeds:?\s*\??\s*\$?([0-9,.KMBkmb]+)\s*([+-][0-9]+%)/i,
      /Proceeds:?\s*\??\s*\$?([0-9,.KMBkmb]+)/i,
      /Proceeds\s*\n\s*\$?([0-9,.KMBkmb]+)\s*([+-][0-9]+%)?/i,
      /\$?([0-9,.KMBkmb]+)\s*proceeds/i
    ],
    proceedsPerUser: [
      // App Store Connect format with question mark on separate line
      /Proceeds per (?:Paying )?User\s*\n\s*\?\s*\n\s*\$?([0-9,.KMBkmb]+)\s*\n\s*([+-][0-9,.]+%)/i,
      /Proceeds per (?:Paying )?User\s*\n\s*\?\s*\n\s*\$?([0-9,.KMBkmb]+)/i,
      // Standard patterns
      /Proceeds per (?:Paying )?User:?\s*\??\s*\$?([0-9,.KMBkmb]+)\s*([+-][0-9,.]+%)/i,
      /Proceeds per (?:Paying )?User:?\s*\??\s*\$?([0-9,.KMBkmb]+)/i,
      /\$?([0-9,.KMBkmb]+)\s*proceeds per (?:paying )?user/i
    ],
    sessionsPerDevice: [
      // App Store Connect format with question mark on separate line
      /Sessions per (?:Active )?Device\s*\n\s*\?\s*\n\s*([0-9,.]+)\s*\n\s*([+-][0-9,.]+%)/i,
      /Sessions per (?:Active )?Device\s*\n\s*\?\s*\n\s*([0-9,.]+)/i,
      // Standard patterns
      /Sessions per (?:Active )?Device:?\s*\??\s*([0-9,.]+)\s*([+-][0-9,.]+%)/i,
      /Sessions per (?:Active )?Device:?\s*\??\s*([0-9,.]+)/i,
      /([0-9,.]+)\s*sessions per (?:active )?device/i
    ],
    crashes: [
      // App Store Connect format with question mark on separate line
      /Crashes\s*\n\s*\?\s*\n\s*([0-9,.KMBkmb]+)\s*\n\s*([+-][0-9]+%)/i,
      /Crashes\s*\n\s*\?\s*\n\s*([0-9,.KMBkmb]+)/i,
      // Standard patterns
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
          crashRate: { value: 0, percentile: "" },
          crashFreeUsers: { value: 0, change: 0 }
        },
        geographical: {
          markets: [],
          devices: [],
          sources: []
        }
      };
      
      // Normalize input - trim whitespace, standardize newlines, and normalize spacing around question marks
      const normalizedInput = input.replace(/\r\n/g, '\n')
                                  .replace(/\s*\?\s*/g, ' ? ')
                                  .trim();
      
      // Extract key metrics
      this.extractMetric(normalizedInput, 'impressions', result);
      this.extractMetric(normalizedInput, 'pageViews', result);
      this.extractMetric(normalizedInput, 'conversionRate', result);
      this.extractMetric(normalizedInput, 'downloads', result);
      this.extractMetric(normalizedInput, 'proceeds', result);
      this.extractMetric(normalizedInput, 'proceedsPerUser', result);
      this.extractMetric(normalizedInput, 'sessionsPerDevice', result);
      this.extractMetric(normalizedInput, 'crashes', result);
      
      // Extract date range
      for (const pattern of this.patterns.dateRange) {
        const match = normalizedInput.match(pattern);
        if (match && match[1]) {
          result.summary.dateRange = match[1].trim();
          break;
        }
      }
      
      // Calculate crash-free users
      if (result.technical.crashes.value > 0) {
        // Using a heuristic for active users (if we don't have the actual number)
        const estimatedActiveUsers = 100000; // Default estimate
        const crashFreePercentage = 100 - (result.technical.crashes.value / estimatedActiveUsers * 100);
        result.technical.crashFreeUsers = { 
          value: Math.min(Math.max(crashFreePercentage, 0), 100), // Ensure value is between 0-100%
          change: 0 // We don't have change data for this derived metric
        };
      } else {
        // If no crashes detected, assume 100% crash-free
        result.technical.crashFreeUsers = { value: 100, change: 0 };
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
        let value: number;
        
        // Handle K, M, B suffixes properly 
        if (metricName === 'conversionRate') {
          value = parseFloat(match[1]);
        } else {
          const rawValue = match[1];
          value = this.parseValueWithSuffix(rawValue);
        }
        
        // Extract change value from the second capture group if it exists
        let change = 0;
        if (match[2] && typeof match[2] === 'string') {
          // Handle the change value that might be on a separate line
          const changeMatch = match[2].match(/([+-]?\d+(?:\.\d+)?)%/);
          if (changeMatch && changeMatch[1]) {
            change = parseFloat(changeMatch[1]);
          }
        }
        
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
          case 'proceedsPerUser':
            result.financial.proceedsPerUser = { value, change };
            break;
          case 'sessionsPerDevice':
            result.engagement.sessionsPerDevice = { value, change };
            break;
          case 'crashes':
            result.technical.crashes = { value, change };
            break;
        }
        
        console.log(`[AppStoreExtractor] Extracted ${metricName}: ${value} (change: ${change}%)`);
        break;
      }
    }
  }
  
  /**
   * Parse a value string that might have K, M, B suffixes
   */
  private parseValueWithSuffix(valueStr: string): number {
    const cleanValue = valueStr.trim().replace(/,/g, '');
    
    // Check for suffixes
    if (/\d+(\.\d+)?[Kk]$/.test(cleanValue)) {
      return parseFloat(cleanValue.replace(/[Kk]$/, '')) * 1000;
    } else if (/\d+(\.\d+)?[Mm]$/.test(cleanValue)) {
      return parseFloat(cleanValue.replace(/[Mm]$/, '')) * 1000000;
    } else if (/\d+(\.\d+)?[Bb]$/.test(cleanValue)) {
      return parseFloat(cleanValue.replace(/[Bb]$/, '')) * 1000000000;
    }
    
    return parseFloat(cleanValue);
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
    const hasEngagementMetrics = result.engagement.sessionsPerDevice.value > 0;
    
    // At least one category of metrics should have data
    return hasAcquisitionMetrics || hasFinancialMetrics || hasTechnicalMetrics || hasEngagementMetrics;
  }
}
