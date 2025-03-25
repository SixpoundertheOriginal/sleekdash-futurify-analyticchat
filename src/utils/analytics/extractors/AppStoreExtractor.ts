
import { BaseExtractor } from './BaseExtractor';
import { normalizeValue } from '../metricTypes';
import { ProcessedAnalytics, MarketBreakdown, DeviceBreakdown, SourceBreakdown } from '../types';

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
      // App Store Connect format with question mark
      /Impressions\s*\n\s*\?\s*\n\s*([0-9,.KMBkmb]+)\s*\n\s*([+-][0-9]+%)/i,
      /Impressions\s*\n\s*\?\s*\n\s*([0-9,.KMBkmb]+)/i,
      // Standard patterns
      /Impressions:?\s*\??\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)/i,
      /Impressions:?\s*\??\s*([0-9,.KMBkmb]+)/i,
      /Impressions\s*\n\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)?/i,
      /([0-9,.KMBkmb]+)\s*impressions/i
    ],
    pageViews: [
      // App Store Connect format
      /(?:Product )?Page Views\s*\n\s*\?\s*\n\s*([0-9,.KMBkmb]+)\s*\n\s*([+-][0-9]+%)/i,
      /(?:Product )?Page Views\s*\n\s*\?\s*\n\s*([0-9,.KMBkmb]+)/i,
      // Standard patterns
      /(?:Product )?Page Views:?\s*\??\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)/i,
      /(?:Product )?Page Views:?\s*\??\s*([0-9,.KMBkmb]+)/i,
      /(?:Product )?Page Views\s*\n\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)?/i,
      /([0-9,.KMBkmb]+)\s*(?:product )?page views/i
    ],
    conversionRate: [
      // App Store Connect format
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
      // App Store Connect format
      /(?:Total )?Downloads\s*\n\s*\?\s*\n\s*([0-9,.KMBkmb]+)\s*\n\s*([+-][0-9]+%)/i,
      /(?:Total )?Downloads\s*\n\s*\?\s*\n\s*([0-9,.KMBkmb]+)/i,
      // Standard patterns
      /(?:Total )?Downloads:?\s*\??\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)/i,
      /(?:Total )?Downloads:?\s*\??\s*([0-9,.KMBkmb]+)/i,
      /(?:Total )?Downloads\s*\n\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)?/i,
      /([0-9,.KMBkmb]+)\s*(?:total )?downloads/i
    ],
    proceeds: [
      // App Store Connect format
      /Proceeds\s*\n\s*\?\s*\n\s*\$?([0-9,.KMBkmb]+)\s*\n\s*([+-][0-9]+%)/i,
      /Proceeds\s*\n\s*\?\s*\n\s*\$?([0-9,.KMBkmb]+)/i,
      // Standard patterns
      /Proceeds:?\s*\??\s*\$?([0-9,.KMBkmb]+)\s*([+-][0-9]+%)/i,
      /Proceeds:?\s*\??\s*\$?([0-9,.KMBkmb]+)/i,
      /Proceeds\s*\n\s*\$?([0-9,.KMBkmb]+)\s*([+-][0-9]+%)?/i,
      /\$?([0-9,.KMBkmb]+)\s*proceeds/i
    ],
    proceedsPerUser: [
      // App Store Connect format
      /Proceeds per (?:Paying )?User\s*\n\s*\?\s*\n\s*\$?([0-9,.KMBkmb]+)\s*\n\s*([+-][0-9,.]+%)/i,
      /Proceeds per (?:Paying )?User\s*\n\s*\?\s*\n\s*\$?([0-9,.KMBkmb]+)/i,
      // Standard patterns
      /Proceeds per (?:Paying )?User:?\s*\??\s*\$?([0-9,.KMBkmb]+)\s*([+-][0-9,.]+%)/i,
      /Proceeds per (?:Paying )?User:?\s*\??\s*\$?([0-9,.KMBkmb]+)/i,
      /\$?([0-9,.KMBkmb]+)\s*proceeds per (?:paying )?user/i
    ],
    sessionsPerDevice: [
      // App Store Connect format
      /(?:Daily Average )?Sessions per (?:Active )?Device\s*\n\s*\?\s*\n\s*([0-9,.]+)\s*\n\s*([+-][0-9,.]+%)/i,
      /(?:Daily Average )?Sessions per (?:Active )?Device\s*\n\s*\?\s*\n\s*([0-9,.]+)/i,
      // Standard patterns
      /(?:Daily Average )?Sessions per (?:Active )?Device:?\s*\??\s*([0-9,.]+)\s*([+-][0-9,.]+%)/i,
      /(?:Daily Average )?Sessions per (?:Active )?Device:?\s*\??\s*([0-9,.]+)/i,
      /([0-9,.]+)\s*(?:daily average )?sessions per (?:active )?device/i
    ],
    crashes: [
      // App Store Connect format
      /Crashes\s*\n\s*\?\s*\n\s*([0-9,.KMBkmb]+)\s*\n\s*([+-][0-9]+%)/i,
      /Crashes\s*\n\s*\?\s*\n\s*([0-9,.KMBkmb]+)/i,
      // Standard patterns
      /Crashes:?\s*\??\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)/i,
      /Crashes:?\s*\??\s*([0-9,.KMBkmb]+)/i,
      /Crash Count:?\s*\??\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)?/i,
      /Crashes\s*\n\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)?/i,
      /([0-9,.KMBkmb]+)\s*crashes/i
    ],
    retentionDay1: [
      /Day 1 Retention:?\s*([0-9,.]+)%/i,
      /Day 1:?\s*([0-9,.]+)%/i,
      /Day 1 retention rate:?\s*([0-9,.]+)%/i
    ],
    retentionDay7: [
      /Day 7 Retention:?\s*([0-9,.]+)%/i,
      /Day 7:?\s*([0-9,.]+)%/i,
      /Day 7 retention rate:?\s*([0-9,.]+)%/i
    ],
    retentionDay14: [
      /Day 14 Retention:?\s*([0-9,.]+)%/i,
      /Day 14:?\s*([0-9,.]+)%/i,
      /Day 14 retention rate:?\s*([0-9,.]+)%/i
    ],
    retentionDay28: [
      /Day 28 Retention:?\s*([0-9,.]+)%/i,
      /Day 28:?\s*([0-9,.]+)%/i,
      /Day 28 retention rate:?\s*([0-9,.]+)%/i
    ],
    dateRange: [
      /([A-Za-z]+ \d{1,2}[-–]\w+ \d{1,2},? \d{4})/i,
      /Date Range:?\s*(.+?)(?:\n|$)/i,
      /([A-Za-z]+ \d{1,2} ?[-–] ?[A-Za-z]+ \d{1,2},? \d{4})/i,
      /([A-Za-z]+ \d{1,2} to [A-Za-z]+ \d{1,2},? \d{4})/i
    ],
    territorySection: [
      /Total Downloads by Territory[\s\S]*?See All([\s\S]*?)(?=Total Downloads|$)/i,
      /Downloads by Territory[\s\S]*?See All([\s\S]*?)(?=Downloads by|$)/i,
      /Territory Breakdown[\s\S]*?See All([\s\S]*?)(?=Territory|$)/i
    ],
    deviceSection: [
      /Total Downloads by Device[\s\S]*?See All([\s\S]*?)(?=Total Downloads|$)/i,
      /Downloads by Device[\s\S]*?See All([\s\S]*?)(?=Downloads by|$)/i,
      /Device Breakdown[\s\S]*?See All([\s\S]*?)(?=Device|$)/i
    ],
    sourceSection: [
      /Total Downloads by Source[\s\S]*?See All([\s\S]*?)(?=Total Downloads|$)/i,
      /Downloads by Source[\s\S]*?See All([\s\S]*?)(?=Downloads by|$)/i,
      /Source Breakdown[\s\S]*?See All([\s\S]*?)(?=Source|$)/i
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
      this.extractAcquisitionMetrics(normalizedInput, result);
      this.extractFinancialMetrics(normalizedInput, result);
      this.extractEngagementMetrics(normalizedInput, result);
      this.extractTechnicalMetrics(normalizedInput, result);
      this.extractGeographicalMetrics(normalizedInput, result);
      
      // Extract date range
      for (const pattern of this.patterns.dateRange) {
        const match = normalizedInput.match(pattern);
        if (match && match[1]) {
          result.summary.dateRange = match[1].trim();
          break;
        }
      }
      
      // Calculate derived metrics
      this.calculateDerivedMetrics(result);
      
      // Generate a basic executive summary based on the extracted metrics
      result.summary.executiveSummary = this.generateExecutiveSummary(result);
      
      return result;
    } catch (error) {
      console.error('[AppStoreExtractor] Error extracting App Store metrics:', error);
      return null;
    }
  }
  
  /**
   * Extract acquisition metrics
   */
  private extractAcquisitionMetrics(text: string, result: ProcessedAnalytics): void {
    // Extract impressions
    const impressions = this.extractMetricWithChange(text, this.patterns.impressions);
    if (impressions) {
      result.acquisition.impressions = impressions;
    }
    
    // Extract page views
    const pageViews = this.extractMetricWithChange(text, this.patterns.pageViews);
    if (pageViews) {
      result.acquisition.pageViews = pageViews;
    }
    
    // Extract conversion rate (percentage)
    const conversionRate = this.extractMetricWithChange(text, this.patterns.conversionRate);
    if (conversionRate) {
      result.acquisition.conversionRate = conversionRate;
    }
    
    // Extract downloads
    const downloads = this.extractMetricWithChange(text, this.patterns.downloads);
    if (downloads) {
      result.acquisition.downloads = downloads;
    }
  }
  
  /**
   * Extract financial metrics
   */
  private extractFinancialMetrics(text: string, result: ProcessedAnalytics): void {
    // Extract proceeds
    const proceeds = this.extractMetricWithChange(text, this.patterns.proceeds);
    if (proceeds) {
      result.financial.proceeds = proceeds;
    }
    
    // Extract proceeds per user
    const proceedsPerUser = this.extractMetricWithChange(text, this.patterns.proceedsPerUser);
    if (proceedsPerUser) {
      result.financial.proceedsPerUser = proceedsPerUser;
    }
  }
  
  /**
   * Extract engagement metrics
   */
  private extractEngagementMetrics(text: string, result: ProcessedAnalytics): void {
    // Extract sessions per device
    const sessionsPerDevice = this.extractMetricWithChange(text, this.patterns.sessionsPerDevice);
    if (sessionsPerDevice) {
      result.engagement.sessionsPerDevice = sessionsPerDevice;
    }
    
    // Extract retention rates
    // Day 1 retention
    const day1Retention = this.extractSingleMetric(text, this.patterns.retentionDay1);
    if (day1Retention) {
      result.engagement.retention.day1 = { value: day1Retention, benchmark: 0 };
    }
    
    // Day 7 retention
    const day7Retention = this.extractSingleMetric(text, this.patterns.retentionDay7);
    if (day7Retention) {
      result.engagement.retention.day7 = { value: day7Retention, benchmark: 0 };
    }
    
    // Day 14 retention
    const day14Retention = this.extractSingleMetric(text, this.patterns.retentionDay14);
    if (day14Retention) {
      result.engagement.retention.day14 = { value: day14Retention, benchmark: 0 };
    }
    
    // Day 28 retention
    const day28Retention = this.extractSingleMetric(text, this.patterns.retentionDay28);
    if (day28Retention) {
      result.engagement.retention.day28 = { value: day28Retention, benchmark: 0 };
    }
  }
  
  /**
   * Extract technical metrics
   */
  private extractTechnicalMetrics(text: string, result: ProcessedAnalytics): void {
    // Extract crashes
    const crashes = this.extractMetricWithChange(text, this.patterns.crashes);
    if (crashes) {
      result.technical.crashes = crashes;
      
      // Estimate crash rate if we have downloads data
      if (result.acquisition.downloads.value > 0) {
        result.technical.crashRate = {
          value: (crashes.value / result.acquisition.downloads.value) * 100,
          percentile: ""
        };
      }
      
      // Estimate crash-free users (as a percentage)
      // Using a heuristic if we don't have the actual number
      const estimatedActiveUsers = result.acquisition.downloads.value || 100000;
      const crashFreePercentage = 100 - (crashes.value / estimatedActiveUsers * 100);
      result.technical.crashFreeUsers = {
        value: Math.min(Math.max(crashFreePercentage, 0), 100),
        change: 0
      };
    }
  }
  
  /**
   * Extract geographical metrics
   */
  private extractGeographicalMetrics(text: string, result: ProcessedAnalytics): void {
    // Extract territory breakdown
    const markets = this.extractTerritoryBreakdown(text);
    if (markets.length > 0) {
      result.geographical.markets = markets;
    }
    
    // Extract device breakdown
    const devices = this.extractDeviceBreakdown(text);
    if (devices.length > 0) {
      result.geographical.devices = devices;
    }
    
    // Extract source breakdown
    const sources = this.extractSourceBreakdown(text);
    if (sources.length > 0) {
      result.geographical.sources = sources;
    }
  }
  
  /**
   * Extract market/territory breakdown
   */
  private extractTerritoryBreakdown(text: string): MarketBreakdown[] {
    const territories: MarketBreakdown[] = [];
    
    // Try to find the territory section
    let territoriesSection = null;
    for (const pattern of this.patterns.territorySection) {
      const match = text.match(pattern);
      if (match && match[1]) {
        territoriesSection = match[1];
        break;
      }
    }
    
    if (!territoriesSection) return territories;
    
    // Process territory data
    const territoryLines = territoriesSection.split('\n').filter(line => line.trim());
    
    for (const line of territoryLines) {
      // Try different patterns
      const patterns = [
        /([A-Za-z\s]+)\s+([0-9,]+)\s+([0-9.]+%)?/,  // Country Downloads Percentage
        /([A-Za-z\s]+)\s+([0-9.]+%)\s+([0-9,]+)/,   // Country Percentage Downloads
        /([A-Za-z\s]+)\s+([0-9,]+)/                // Country Downloads
      ];
      
      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          // Handle different pattern matches
          if (pattern.toString().includes('[0-9.]+%')) {
            // Pattern with percentage
            territories.push({
              country: match[1].trim(),
              downloads: parseInt(match[3].replace(/,/g, '')),
              percentage: parseFloat(match[2].replace(/%/g, ''))
            });
          } else {
            // Pattern without percentage
            territories.push({
              country: match[1].trim(),
              downloads: parseInt(match[2].replace(/,/g, '')),
              percentage: 0
            });
          }
          break;
        }
      }
    }
    
    return territories;
  }
  
  /**
   * Extract device breakdown
   */
  private extractDeviceBreakdown(text: string): DeviceBreakdown[] {
    const devices: DeviceBreakdown[] = [];
    
    // Try to find the device section
    let devicesSection = null;
    for (const pattern of this.patterns.deviceSection) {
      const match = text.match(pattern);
      if (match && match[1]) {
        devicesSection = match[1];
        break;
      }
    }
    
    if (!devicesSection) return devices;
    
    // Process device data
    const deviceLines = devicesSection.split('\n').filter(line => line.trim());
    
    for (const line of deviceLines) {
      // Try different patterns
      const patterns = [
        /([A-Za-z\s]+)\s+([0-9.]+%)\s+([0-9,]+)/,  // Device Percentage Downloads
        /([A-Za-z\s]+)\s+([0-9,]+)\s+([0-9.]+%)?/, // Device Downloads Percentage
        /([A-Za-z\s]+)\s+([0-9,]+)/                // Device Downloads
      ];
      
      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          // Handle different pattern matches
          if (pattern.toString().includes('[0-9.]+%\\s+\\([0-9,]+\\)')) {
            // Pattern with percentage then downloads
            devices.push({
              type: match[1].trim(),
              count: parseInt(match[3].replace(/,/g, '')),
              percentage: parseFloat(match[2].replace(/%/g, ''))
            });
          } else if (pattern.toString().includes('\\([0-9,]+\\)\\s+[0-9.]+%')) {
            // Pattern with downloads then percentage
            devices.push({
              type: match[1].trim(),
              count: parseInt(match[2].replace(/,/g, '')),
              percentage: parseFloat(match[3].replace(/%/g, ''))
            });
          } else {
            // Pattern without percentage
            devices.push({
              type: match[1].trim(),
              count: parseInt(match[2].replace(/,/g, '')),
              percentage: 0
            });
          }
          break;
        }
      }
    }
    
    return devices;
  }
  
  /**
   * Extract source breakdown
   */
  private extractSourceBreakdown(text: string): SourceBreakdown[] {
    const sources: SourceBreakdown[] = [];
    
    // Try to find the source section
    let sourcesSection = null;
    for (const pattern of this.patterns.sourceSection) {
      const match = text.match(pattern);
      if (match && match[1]) {
        sourcesSection = match[1];
        break;
      }
    }
    
    if (!sourcesSection) return sources;
    
    // Process source data
    const sourceLines = sourcesSection.split('\n').filter(line => line.trim());
    
    for (const line of sourceLines) {
      // Try different patterns
      const patterns = [
        /([A-Za-z\s]+)\s+([0-9.]+%)\s+([0-9,]+)/,  // Source Percentage Downloads
        /([A-Za-z\s]+)\s+([0-9,]+)\s+([0-9.]+%)?/, // Source Downloads Percentage
        /([A-Za-z\s]+)\s+([0-9,]+)/                // Source Downloads
      ];
      
      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          // Handle different pattern matches
          if (pattern.toString().includes('[0-9.]+%\\s+\\([0-9,]+\\)')) {
            // Pattern with percentage then downloads
            sources.push({
              source: match[1].trim(),
              downloads: parseInt(match[3].replace(/,/g, '')),
              percentage: parseFloat(match[2].replace(/%/g, ''))
            });
          } else if (pattern.toString().includes('\\([0-9,]+\\)\\s+[0-9.]+%')) {
            // Pattern with downloads then percentage
            sources.push({
              source: match[1].trim(),
              downloads: parseInt(match[2].replace(/,/g, '')),
              percentage: parseFloat(match[3].replace(/%/g, ''))
            });
          } else {
            // Pattern without percentage
            sources.push({
              source: match[1].trim(),
              downloads: parseInt(match[2].replace(/,/g, '')),
              percentage: 0
            });
          }
          break;
        }
      }
    }
    
    return sources;
  }
  
  /**
   * Calculate derived metrics
   */
  private calculateDerivedMetrics(result: ProcessedAnalytics): void {
    // Calculate funnel metrics
    if (result.acquisition.impressions.value > 0 && result.acquisition.pageViews.value > 0) {
      result.acquisition.funnelMetrics.impressionsToViews = 
        (result.acquisition.pageViews.value / result.acquisition.impressions.value) * 100;
    }
    
    if (result.acquisition.pageViews.value > 0 && result.acquisition.downloads.value > 0) {
      result.acquisition.funnelMetrics.viewsToDownloads = 
        (result.acquisition.downloads.value / result.acquisition.pageViews.value) * 100;
    }
    
    // Calculate financial derived metrics
    if (result.financial.proceeds.value > 0 && result.acquisition.downloads.value > 0) {
      result.financial.derivedMetrics.arpd = 
        result.financial.proceeds.value / result.acquisition.downloads.value;
    }
    
    if (result.financial.proceeds.value > 0 && result.acquisition.impressions.value > 0) {
      result.financial.derivedMetrics.revenuePerImpression = 
        result.financial.proceeds.value / result.acquisition.impressions.value;
    }
    
    // We'll use a heuristic for the percentage of paying users if we don't have real data
    // Typically only a small percentage of users pay
    const estimatedPayingUsers = result.acquisition.downloads.value * 0.03; // 3% as a default
    
    if (estimatedPayingUsers > 0) {
      result.financial.derivedMetrics.payingUserPercentage = 3; // Our default assumption
      
      if (result.financial.proceeds.value > 0) {
        result.financial.derivedMetrics.monetizationEfficiency = 
          result.financial.proceeds.value / estimatedPayingUsers;
      }
    }
  }
  
  /**
   * Generate a basic executive summary based on metrics
   */
  private generateExecutiveSummary(result: ProcessedAnalytics): string {
    // Simple executive summary generation based on the most important metrics
    const summaryParts = [];
    
    if (result.acquisition.downloads.value > 0) {
      const trend = result.acquisition.downloads.change > 0 ? 'increased' : 'decreased';
      summaryParts.push(`Downloads ${trend} by ${Math.abs(result.acquisition.downloads.change)}%.`);
    }
    
    if (result.financial.proceeds.value > 0) {
      const trend = result.financial.proceeds.change > 0 ? 'increased' : 'decreased';
      summaryParts.push(`Revenue ${trend} by ${Math.abs(result.financial.proceeds.change)}%.`);
    }
    
    if (result.technical.crashes.value > 0) {
      const trend = result.technical.crashes.change > 0 ? 'increased' : 'decreased';
      summaryParts.push(`Crashes ${trend} by ${Math.abs(result.technical.crashes.change)}%.`);
    }
    
    if (summaryParts.length === 0) {
      return "No significant metrics were detected in the data.";
    }
    
    return summaryParts.join(' ');
  }
  
  /**
   * Extract a metric with its change value
   */
  private extractMetricWithChange(text: string, patterns: RegExp[]): { value: number, change: number } | null {
    // Try each pattern
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        // Convert value to number (handling K/M/B suffixes)
        const value = normalizeValue(match[1]);
        
        // Extract change percentage if available
        let change = 0;
        if (match[2]) {
          change = this.parsePercentageChange(match[2]);
        }
        
        return { value, change };
      }
    }
    
    return null;
  }
  
  /**
   * Extract a single metric value without change
   */
  private extractSingleMetric(text: string, patterns: RegExp[]): number | null {
    // Try each pattern
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        // Convert value to number
        return parseFloat(match[1]);
      }
    }
    
    return null;
  }
  
  /**
   * Parse percentage change value
   */
  private parsePercentageChange(changeStr: string): number {
    if (!changeStr) return 0;
    
    // Remove the % symbol and convert to number
    const cleanChange = changeStr.replace(/[%\s]/g, '');
    
    if (cleanChange.startsWith('+')) {
      return parseFloat(cleanChange.substring(1));
    } else if (cleanChange.startsWith('-')) {
      return parseFloat(cleanChange);
    } else {
      return parseFloat(cleanChange);
    }
  }
}
