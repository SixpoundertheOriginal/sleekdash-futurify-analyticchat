import { BaseExtractor } from './BaseExtractor';
import { ProcessedAnalytics } from '../types';

/**
 * Extractor specialized for geographical distribution data
 */
export class GeographicalExtractor implements BaseExtractor<ProcessedAnalytics> {
  id = 'geographical-extractor';
  name = 'Geographical Data Extractor';
  priority = 60; // Lower priority than main extractors
  confidence = 0.7;
  
  private patterns = {
    territorySections: [
      /Total Downloads by Territory[\s\S]*?See All([\s\S]*?)(?=Total Downloads|$)/i,
      /Downloads by Territory[\s\S]*?(?:See All|See More)([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i,
      /Top Territories[\s\S]*?(?:See All|See More)([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i
    ],
    territoryItem: /([A-Za-z\s]+)\s+([0-9.,]+%?)(?:\s+([0-9.,]+))?/g,
    deviceSections: [
      /Total Downloads by Device[\s\S]*?See All([\s\S]*?)(?=Total Downloads|$)/i,
      /Downloads by Device[\s\S]*?(?:See All|See More)([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i,
      /Device Types[\s\S]*?(?:See All|See More)([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i
    ],
    deviceItem: /([A-Za-z\s]+)\s+([0-9.,]+%?)(?:\s+([0-9.,]+))?/g,
    sourceSections: [
      /Total Downloads by Source[\s\S]*?See All([\s\S]*?)(?=Total Downloads|$)/i,
      /Downloads by Source[\s\S]*?(?:See All|See More)([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i,
      /Source Breakdown[\s\S]*?(?:See All|See More)([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i
    ],
    sourceItem: /([A-Za-z\s]+)\s+([0-9.,]+%?)(?:\s+([0-9.,]+))?/g
  };
  
  /**
   * Extract geographical data from input text
   */
  extract(input: string): ProcessedAnalytics | null {
    try {
      if (!input || typeof input !== 'string') {
        console.log('[GeographicalExtractor] Invalid input: not a string or empty');
        return null;
      }
      
      // Create base result structure with default values
      const result: ProcessedAnalytics = {
        summary: {
          title: "App Store Geographical Analytics",
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
      
      // Extract territories, devices, and sources
      this.extractTerritories(input, result);
      this.extractDevices(input, result);
      this.extractSources(input, result);
      
      // Check if we extracted any geographical data
      const hasGeoData = 
        result.geographical.markets.length > 0 || 
        result.geographical.devices.length > 0 || 
        result.geographical.sources.length > 0;
      
      if (!hasGeoData) {
        console.log('[GeographicalExtractor] No geographical data extracted');
        return null;
      }
      
      return result;
    } catch (error) {
      console.error('[GeographicalExtractor] Error extracting geographical data:', error);
      return null;
    }
  }
  
  /**
   * Extract territory data
   */
  private extractTerritories(input: string, result: ProcessedAnalytics): void {
    let territorySection: string | null = null;
    
    // Find the territory section in the input
    for (const pattern of this.patterns.territorySections) {
      const match = input.match(pattern);
      if (match && match[1]) {
        territorySection = match[1].trim();
        break;
      }
    }
    
    if (!territorySection) {
      console.log('[GeographicalExtractor] No territory section found');
      return;
    }
    
    // Extract individual territory items
    let territoryMatch;
    const territories = [];
    
    while ((territoryMatch = this.patterns.territoryItem.exec(territorySection)) !== null) {
      const country = territoryMatch[1]?.trim();
      const percentage = territoryMatch[2]?.includes('%') 
        ? parseFloat(territoryMatch[2].replace('%', '')) 
        : null;
      const downloads = territoryMatch[3] 
        ? parseInt(territoryMatch[3].replace(/,/g, ''), 10)
        : territoryMatch[2] && !territoryMatch[2].includes('%')
          ? parseInt(territoryMatch[2].replace(/,/g, ''), 10)
          : 0;
      
      if (country) {
        territories.push({
          country,
          percentage: percentage || 0,
          downloads: downloads || 0
        });
      }
    }
    
    // Sort by downloads (highest first) and add to result
    result.geographical.markets = territories
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 10); // Limit to top 10
  }
  
  /**
   * Extract device data
   */
  private extractDevices(input: string, result: ProcessedAnalytics): void {
    let deviceSection: string | null = null;
    
    // Find the device section in the input
    for (const pattern of this.patterns.deviceSections) {
      const match = input.match(pattern);
      if (match && match[1]) {
        deviceSection = match[1].trim();
        break;
      }
    }
    
    if (!deviceSection) {
      console.log('[GeographicalExtractor] No device section found');
      return;
    }
    
    // Extract individual device items
    let deviceMatch;
    const devices = [];
    
    while ((deviceMatch = this.patterns.deviceItem.exec(deviceSection)) !== null) {
      const type = deviceMatch[1]?.trim();
      const percentage = deviceMatch[2]?.includes('%') 
        ? parseFloat(deviceMatch[2].replace('%', '')) 
        : null;
      const count = deviceMatch[3] 
        ? parseInt(deviceMatch[3].replace(/,/g, ''), 10)
        : deviceMatch[2] && !deviceMatch[2].includes('%')
          ? parseInt(deviceMatch[2].replace(/,/g, ''), 10)
          : 0;
      
      if (type) {
        devices.push({
          type,
          percentage: percentage || 0,
          count: count || 0
        });
      }
    }
    
    // Sort by count (highest first) and add to result
    result.geographical.devices = devices
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Limit to top 10
  }
  
  /**
   * Extract source data
   */
  private extractSources(input: string, result: ProcessedAnalytics): void {
    let sourceSection: string | null = null;
    
    // Find the source section in the input
    for (const pattern of this.patterns.sourceSections) {
      const match = input.match(pattern);
      if (match && match[1]) {
        sourceSection = match[1].trim();
        break;
      }
    }
    
    if (!sourceSection) {
      console.log('[GeographicalExtractor] No source section found');
      return;
    }
    
    // Extract individual source items
    let sourceMatch;
    const sources = [];
    
    while ((sourceMatch = this.patterns.sourceItem.exec(sourceSection)) !== null) {
      const source = sourceMatch[1]?.trim();
      const percentage = sourceMatch[2]?.includes('%') 
        ? parseFloat(sourceMatch[2].replace('%', '')) 
        : null;
      const downloads = sourceMatch[3] 
        ? parseInt(sourceMatch[3].replace(/,/g, ''), 10)
        : sourceMatch[2] && !sourceMatch[2].includes('%')
          ? parseInt(sourceMatch[2].replace(/,/g, ''), 10)
          : 0;
      
      if (source) {
        sources.push({
          source,
          percentage: percentage || 0,
          downloads: downloads || 0
        });
      }
    }
    
    // Sort by downloads (highest first) and add to result
    result.geographical.sources = sources
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 10); // Limit to top 10
  }
  
  /**
   * Validate the extracted data
   */
  validate(result: ProcessedAnalytics): boolean {
    // We consider the extraction valid if we have at least one type of geographical data
    return (
      result.geographical.markets.length > 0 || 
      result.geographical.devices.length > 0 || 
      result.geographical.sources.length > 0
    );
  }
}
