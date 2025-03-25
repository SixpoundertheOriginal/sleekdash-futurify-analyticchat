
import { ProcessedAnalytics } from "../types";
import { extractorService } from "../extractors/ExtractorService";

/**
 * Extract metrics directly from text input without API calls
 * @param text Raw text to extract metrics from
 * @returns Extracted metrics in ProcessedAnalytics format
 */
export function extractDirectMetrics(text: string): Partial<ProcessedAnalytics> {
  if (!text || typeof text !== 'string') {
    console.log('[DirectExtraction] Invalid input: not a string or empty');
    return {};
  }
  
  try {
    console.log('[DirectExtraction] Extracting metrics from text, length:', text.length);
    
    // Use the extractor service to process the text
    const result = extractorService.processAppStoreData(text);
    
    if (result.success && result.data) {
      console.log('[DirectExtraction] Successfully extracted metrics');
      return result.data;
    } else {
      console.log('[DirectExtraction] Failed to extract metrics:', result.error || 'Unknown error');
      return extractBaseMetrics(text);
    }
  } catch (error) {
    console.error('[DirectExtraction] Error during extraction:', error);
    // Fallback to simpler extraction
    return extractBaseMetrics(text);
  }
}

/**
 * Extracts basic metrics using simplified pattern matching
 * Less comprehensive but more forgiving than the full extractor
 */
export function extractBaseMetrics(text: string): Partial<ProcessedAnalytics> {
  if (!text || typeof text !== 'string') {
    return {};
  }
  
  const result: Partial<ProcessedAnalytics> = {
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
    }
  };
  
  // Try to extract date range
  const dateRangeMatch = text.match(/(?:Date Range|Period):\s*([^\n]+)/i) || 
                          text.match(/([A-Za-z]+ \d+[^\n]*\d{4})/);
  
  if (dateRangeMatch) {
    result.summary = {
      title: "App Store Analytics",
      dateRange: dateRangeMatch[1].trim(),
      executiveSummary: "Basic metrics extracted from text."
    };
  } else {
    result.summary = {
      title: "App Store Analytics",
      dateRange: "Unknown date range",
      executiveSummary: "Basic metrics extracted from text."
    };
  }
  
  // Simple pattern matching for key metrics
  const patterns = {
    impressions: /impressions[^0-9]*([0-9,.kmb]+)/i,
    pageViews: /page views[^0-9]*([0-9,.kmb]+)/i,
    conversionRate: /conversion rate[^0-9]*([0-9,.]+)%/i,
    downloads: /downloads[^0-9]*([0-9,.kmb]+)/i,
    proceeds: /proceeds[^0-9]*\$?([0-9,.kmb]+)/i,
    proceedsPerUser: /proceeds per [^0-9]*\$?([0-9,.kmb]+)/i,
    sessionsPerDevice: /sessions per device[^0-9]*([0-9,.]+)/i,
    crashes: /crashes[^0-9]*([0-9,.kmb]+)/i
  };
  
  // Extract metrics
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern);
    if (match && match[1]) {
      let value = match[1].replace(/,/g, '');
      
      // Handle K/M/B suffixes
      if (/\d+(\.\d+)?[kK]$/.test(value)) {
        value = (parseFloat(value.replace(/[kK]$/, '')) * 1000).toString();
      } else if (/\d+(\.\d+)?[mM]$/.test(value)) {
        value = (parseFloat(value.replace(/[mM]$/, '')) * 1000000).toString();
      } else if (/\d+(\.\d+)?[bB]$/.test(value)) {
        value = (parseFloat(value.replace(/[bB]$/, '')) * 1000000000).toString();
      }
      
      const numValue = parseFloat(value);
      
      // Set the value in the appropriate place in the result object
      if (key === 'impressions' && result.acquisition) {
        result.acquisition.impressions.value = numValue;
      } else if (key === 'pageViews' && result.acquisition) {
        result.acquisition.pageViews.value = numValue;
      } else if (key === 'conversionRate' && result.acquisition) {
        result.acquisition.conversionRate.value = numValue;
      } else if (key === 'downloads' && result.acquisition) {
        result.acquisition.downloads.value = numValue;
      } else if (key === 'proceeds' && result.financial) {
        result.financial.proceeds.value = numValue;
      } else if (key === 'proceedsPerUser' && result.financial) {
        result.financial.proceedsPerUser.value = numValue;
      } else if (key === 'sessionsPerDevice' && result.engagement) {
        result.engagement.sessionsPerDevice.value = numValue;
      } else if (key === 'crashes' && result.technical) {
        result.technical.crashes.value = numValue;
      }
    }
  }
  
  // Calculate basic derived metrics
  if (result.acquisition) {
    // Calculate funnel metrics if possible
    if (result.acquisition.impressions.value > 0 && result.acquisition.pageViews.value > 0) {
      result.acquisition.funnelMetrics.impressionsToViews = 
        (result.acquisition.pageViews.value / result.acquisition.impressions.value) * 100;
    }
    
    if (result.acquisition.pageViews.value > 0 && result.acquisition.downloads.value > 0) {
      result.acquisition.funnelMetrics.viewsToDownloads = 
        (result.acquisition.downloads.value / result.acquisition.pageViews.value) * 100;
    }
  }
  
  // ARPD calculation
  if (result.financial && result.acquisition && 
      result.financial.proceeds.value > 0 && result.acquisition.downloads.value > 0) {
    result.financial.derivedMetrics.arpd = 
      result.financial.proceeds.value / result.acquisition.downloads.value;
  }
  
  return result;
}

/**
 * Checks if the extracted metrics are valid for visualization
 */
export function hasValidMetricsForVisualization(data: Partial<ProcessedAnalytics> | null): boolean {
  if (!data) return false;
  
  // Check if we have at least one of these key metrics
  const hasDownloads = data.acquisition?.downloads?.value > 0;
  const hasProceeds = data.financial?.proceeds?.value > 0;
  const hasSessions = data.engagement?.sessionsPerDevice?.value > 0;
  
  return hasDownloads || hasProceeds || hasSessions;
}
