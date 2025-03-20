
import { ProcessedAnalytics } from "../types";
import { normalizeValue, normalizePercentChange } from "./normalization";

/**
 * Directly extract metrics from text input
 */
export const extractDirectMetrics = (input: string): Partial<ProcessedAnalytics> => {
  if (!input || typeof input !== 'string') {
    console.log('Invalid input to extractDirectMetrics');
    return {};
  }
  
  console.log('Starting direct extraction from text of length:', input.length);
  
  // Initialize metrics structure
  const metrics: Partial<ProcessedAnalytics> = {
    summary: {
      title: "App Analytics",
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
    }
  };
  
  // Extract date range
  const dateRangeMatch = input.match(/([A-Za-z]+ \d{1,2}[-–][A-Za-z]+ \d{1,2},? \d{4})/i);
  if (dateRangeMatch && dateRangeMatch[1]) {
    metrics.summary!.dateRange = dateRangeMatch[1];
    console.log('Extracted date range:', metrics.summary!.dateRange);
  }
  
  // Extract impressions - with App Store Connect format patterns
  const impressionsPatterns = [
    // App Store Connect format with question mark on separate line
    /Impressions\s*\n\s*\?\s*\n\s*([0-9,.KMBkmb]+)\s*\n\s*([+-][0-9]+%)/i,
    /Impressions\s*\n\s*\?\s*\n\s*([0-9,.KMBkmb]+)/i,
    // Standard patterns
    /Impressions:?\s*\??\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)/i,
    /Impressions:?\s*\??\s*([0-9,.KMBkmb]+)/i,
    /([0-9,.KMBkmb]+)\s*impressions/i
  ];
  
  for (const pattern of impressionsPatterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      metrics.acquisition!.impressions!.value = normalizeValue(match[1]);
      
      // Extract change if available
      if (match[2]) {
        metrics.acquisition!.impressions!.change = normalizePercentChange(match[2]);
      }
      
      console.log('Extracted impressions:', metrics.acquisition!.impressions);
      break;
    }
  }
  
  // Extract page views - with App Store Connect format patterns
  const pageViewsPatterns = [
    // App Store Connect format with question mark on separate line
    /(?:Product )?Page Views\s*\n\s*\?\s*\n\s*([0-9,.KMBkmb]+)\s*\n\s*([+-][0-9]+%)/i,
    /(?:Product )?Page Views\s*\n\s*\?\s*\n\s*([0-9,.KMBkmb]+)/i,
    // Standard patterns
    /(?:Product )?Page Views:?\s*\??\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)/i,
    /(?:Product )?Page Views:?\s*\??\s*([0-9,.KMBkmb]+)/i
  ];
  
  for (const pattern of pageViewsPatterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      metrics.acquisition!.pageViews!.value = normalizeValue(match[1]);
      
      // Extract change if available
      if (match[2]) {
        metrics.acquisition!.pageViews!.change = normalizePercentChange(match[2]);
      }
      
      console.log('Extracted page views:', metrics.acquisition!.pageViews);
      break;
    }
  }
  
  // Extract conversion rate - with App Store Connect format patterns
  const conversionRatePatterns = [
    // App Store Connect format with question mark on separate line
    /Conversion Rate\s*\n\s*\?\s*\n\s*([0-9,.]+)%\s*\n\s*([+-][0-9]+%)/i,
    /Conversion Rate\s*\n\s*\?\s*\n\s*([0-9,.]+)%/i,
    // Standard patterns
    /Conversion Rate:?\s*\??\s*([0-9,.]+)%\s*([+-][0-9]+%)/i,
    /Conversion Rate:?\s*\??\s*([0-9,.]+)%/i
  ];
  
  for (const pattern of conversionRatePatterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      metrics.acquisition!.conversionRate!.value = parseFloat(match[1]);
      
      // Extract change if available
      if (match[2]) {
        metrics.acquisition!.conversionRate!.change = normalizePercentChange(match[2]);
      }
      
      console.log('Extracted conversion rate:', metrics.acquisition!.conversionRate);
      break;
    }
  }
  
  // Extract downloads - with App Store Connect format patterns
  const downloadsPatterns = [
    // App Store Connect format with question mark on separate line
    /(?:Total )?Downloads\s*\n\s*\?\s*\n\s*([0-9,.KMBkmb]+)\s*\n\s*([+-][0-9]+%)/i,
    /(?:Total )?Downloads\s*\n\s*\?\s*\n\s*([0-9,.KMBkmb]+)/i,
    // Standard patterns
    /(?:Total )?Downloads:?\s*\??\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)/i,
    /(?:Total )?Downloads:?\s*\??\s*([0-9,.KMBkmb]+)/i
  ];
  
  for (const pattern of downloadsPatterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      metrics.acquisition!.downloads!.value = normalizeValue(match[1]);
      
      // Extract change if available
      if (match[2]) {
        metrics.acquisition!.downloads!.change = normalizePercentChange(match[2]);
      }
      
      console.log('Extracted downloads:', metrics.acquisition!.downloads);
      break;
    }
  }
  
  // Extract proceeds - with App Store Connect format patterns
  const proceedsPatterns = [
    // App Store Connect format with question mark on separate line
    /Proceeds\s*\n\s*\?\s*\n\s*\$?([0-9,.KMBkmb]+)\s*\n\s*([+-][0-9]+%)/i,
    /Proceeds\s*\n\s*\?\s*\n\s*\$?([0-9,.KMBkmb]+)/i,
    // Standard patterns
    /Proceeds:?\s*\??\s*\$?([0-9,.KMBkmb]+)\s*([+-][0-9]+%)/i,
    /Proceeds:?\s*\??\s*\$?([0-9,.KMBkmb]+)/i
  ];
  
  for (const pattern of proceedsPatterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      metrics.financial!.proceeds!.value = normalizeValue(match[1]);
      
      // Extract change if available
      if (match[2]) {
        metrics.financial!.proceeds!.change = normalizePercentChange(match[2]);
      }
      
      console.log('Extracted proceeds:', metrics.financial!.proceeds);
      break;
    }
  }
  
  // Extract crashes - with App Store Connect format patterns
  const crashesPatterns = [
    // App Store Connect format with question mark on separate line
    /Crashes\s*\n\s*\?\s*\n\s*([0-9,.KMBkmb]+)\s*\n\s*([+-][0-9]+%)/i,
    /Crashes\s*\n\s*\?\s*\n\s*([0-9,.KMBkmb]+)/i,
    // Standard patterns
    /Crashes:?\s*\??\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)/i,
    /Crashes:?\s*\??\s*([0-9,.KMBkmb]+)/i
  ];
  
  for (const pattern of crashesPatterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      metrics.technical!.crashes!.value = normalizeValue(match[1]);
      
      // Extract change if available
      if (match[2]) {
        metrics.technical!.crashes!.change = normalizePercentChange(match[2]);
      }
      
      console.log('Extracted crashes:', metrics.technical!.crashes);
      break;
    }
  }
  
  // Calculate crashFreeUsers if we have crashes data
  if (metrics.technical!.crashes!.value > 0) {
    // Using a heuristic for active users (if we don't have the actual number)
    const estimatedActiveUsers = 100000; // Default estimate
    const crashFreePercentage = 100 - (metrics.technical!.crashes!.value / estimatedActiveUsers * 100);
    metrics.technical!.crashFreeUsers = { 
      value: Math.min(Math.max(crashFreePercentage, 0), 100), // Ensure value is between 0-100%
      change: 0 // We don't have change data for this derived metric
    };
  } else {
    // If no crashes detected, assume 100% crash-free
    metrics.technical!.crashFreeUsers = { value: 100, change: 0 };
  }
  
  // Calculate derived metrics
  if (metrics.acquisition!.impressions!.value > 0 && metrics.acquisition!.pageViews!.value > 0) {
    metrics.acquisition!.funnelMetrics!.impressionsToViews = 
      (metrics.acquisition!.pageViews!.value / metrics.acquisition!.impressions!.value) * 100;
    console.log('Calculated impressions to views:', metrics.acquisition!.funnelMetrics!.impressionsToViews);
  }
  
  if (metrics.acquisition!.pageViews!.value > 0 && metrics.acquisition!.downloads!.value > 0) {
    metrics.acquisition!.funnelMetrics!.viewsToDownloads = 
      (metrics.acquisition!.downloads!.value / metrics.acquisition!.pageViews!.value) * 100;
    console.log('Calculated views to downloads:', metrics.acquisition!.funnelMetrics!.viewsToDownloads);
  }
  
  if (metrics.financial!.proceeds!.value > 0 && metrics.acquisition!.downloads!.value > 0) {
    metrics.financial!.derivedMetrics!.arpd = 
      metrics.financial!.proceeds!.value / metrics.acquisition!.downloads!.value;
    console.log('Calculated ARPD:', metrics.financial!.derivedMetrics!.arpd);
  }
  
  console.log('Direct extraction completed.');
  return metrics;
};

/**
 * Check if the metrics contain enough valid data for visualization
 */
export const hasValidMetricsForVisualization = (metrics: Partial<ProcessedAnalytics>): boolean => {
  if (!metrics) return false;
  
  // Check if we have at least acquisition or financial data
  const hasAcquisitionData = 
    (metrics.acquisition?.downloads?.value || 0) > 0 || 
    (metrics.acquisition?.impressions?.value || 0) > 0;
    
  const hasFinancialData = (metrics.financial?.proceeds?.value || 0) > 0;
  
  return hasAcquisitionData || hasFinancialData;
};

/**
 * Extract base metrics from text for quick visualization
 */
export const extractBaseMetrics = (input: string): Partial<ProcessedAnalytics> => {
  return extractDirectMetrics(input);
};
