
import { ProcessedAnalytics } from '@/utils/analytics/types';

/**
 * Analytics state interface
 */
export interface AnalyticsState {
  processedAnalytics: ProcessedAnalytics | null;
  directlyExtractedMetrics: Partial<ProcessedAnalytics> | null;
  dateRange: {
    from: Date | null;
    to: Date | null;
  } | null;
  isProcessing: boolean;
  isAnalyzing: boolean;
  processingError: string | null;
}

/**
 * Creates a default initial state for analytics
 */
export function createInitialAnalyticsState(): AnalyticsState {
  return {
    processedAnalytics: null,
    directlyExtractedMetrics: null,
    dateRange: null,
    isProcessing: false,
    isAnalyzing: false,
    processingError: null
  };
}

/**
 * Creates a default ProcessedAnalytics object with empty/zero values
 * Useful for initializing state or providing fallbacks
 */
export function createDefaultProcessedAnalytics(): ProcessedAnalytics {
  return {
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
}

/**
 * Validates if a ProcessedAnalytics object has enough data to be useful
 */
export function hasValidAnalyticsData(data: ProcessedAnalytics | null): boolean {
  if (!data) return false;
  
  // Check if we have at least some of the key metrics
  const hasAcquisitionData = 
    data.acquisition.downloads.value > 0 || 
    data.acquisition.impressions.value > 0;
    
  const hasFinancialData = data.financial.proceeds.value > 0;
  const hasEngagementData = data.engagement.sessionsPerDevice.value > 0;
  
  return hasAcquisitionData || hasFinancialData || hasEngagementData;
}

/**
 * Get a human-readable data completeness summary
 */
export function getAnalyticsCompletenessScore(data: ProcessedAnalytics | null): {
  score: number;
  label: string;
  description: string;
} {
  if (!data) {
    return { 
      score: 0, 
      label: "No Data", 
      description: "No analytics data available" 
    };
  }
  
  // Count filled metrics
  let filledMetrics = 0;
  let totalMetrics = 0;
  
  // Acquisition
  if (data.acquisition) {
    if (data.acquisition.downloads.value > 0) filledMetrics++;
    if (data.acquisition.impressions.value > 0) filledMetrics++;
    if (data.acquisition.pageViews.value > 0) filledMetrics++;
    if (data.acquisition.conversionRate.value > 0) filledMetrics++;
    totalMetrics += 4;
  }
  
  // Financial
  if (data.financial) {
    if (data.financial.proceeds.value > 0) filledMetrics++;
    if (data.financial.proceedsPerUser.value > 0) filledMetrics++;
    totalMetrics += 2;
  }
  
  // Engagement
  if (data.engagement) {
    if (data.engagement.sessionsPerDevice.value > 0) filledMetrics++;
    if (data.engagement.retention.day1.value > 0) filledMetrics++;
    if (data.engagement.retention.day7.value > 0) filledMetrics++;
    totalMetrics += 3;
  }
  
  // Technical
  if (data.technical) {
    if (data.technical.crashes.value > 0) filledMetrics++;
    totalMetrics += 1;
  }
  
  const score = totalMetrics > 0 ? Math.round((filledMetrics / totalMetrics) * 100) : 0;
  
  // Determine label and description
  let label = "No Data";
  let description = "No metrics could be extracted";
  
  if (score > 0 && score < 30) {
    label = "Minimal";
    description = "Only a few metrics were extracted";
  } else if (score >= 30 && score < 60) {
    label = "Partial";
    description = "Some key metrics were extracted";
  } else if (score >= 60 && score < 85) {
    label = "Good";
    description = "Most important metrics were extracted";
  } else if (score >= 85) {
    label = "Complete";
    description = "All key metrics were successfully extracted";
  }
  
  return { score, label, description };
}
