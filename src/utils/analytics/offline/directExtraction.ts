
import { ProcessedAnalytics } from "../types";
import { normalizeValue, normalizePercentChange } from "./normalization";
import { 
  extractAcquisitionMetrics, 
  extractFinancialMetrics, 
  extractTechnicalMetrics, 
  extractEngagementMetrics,
  extractDateRange,
  calculateDerivedMetrics
} from "./extractors";

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
  const dateInfo = extractDateRange(input, metrics);
  if (dateInfo.summary?.dateRange) {
    metrics.summary!.dateRange = dateInfo.summary.dateRange;
    console.log('Extracted date range:', metrics.summary!.dateRange);
  }
  
  // Use specialized extractors for each metric type
  const withAcquisition = extractAcquisitionMetrics(input, metrics);
  const withFinancial = extractFinancialMetrics(input, withAcquisition);
  const withTechnical = extractTechnicalMetrics(input, withFinancial);
  const withEngagement = extractEngagementMetrics(input, withTechnical);
  
  // Calculate derived metrics based on the extracted base metrics
  const finalMetrics = calculateDerivedMetrics(withEngagement);
  
  console.log('Direct extraction completed with success rate:', getExtractionSuccessRate(finalMetrics));
  return finalMetrics;
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

/**
 * Calculate a percentage indicating extraction success rate
 */
const getExtractionSuccessRate = (metrics: Partial<ProcessedAnalytics>): string => {
  const totalPossibleMetrics = 10; // Key metrics we expect to potentially find
  let foundMetrics = 0;
  
  // Count acquisition metrics
  if (metrics.acquisition?.impressions?.value) foundMetrics++;
  if (metrics.acquisition?.pageViews?.value) foundMetrics++;
  if (metrics.acquisition?.conversionRate?.value) foundMetrics++;
  if (metrics.acquisition?.downloads?.value) foundMetrics++;
  
  // Count financial metrics
  if (metrics.financial?.proceeds?.value) foundMetrics++;
  if (metrics.financial?.proceedsPerUser?.value) foundMetrics++;
  
  // Count engagement metrics
  if (metrics.engagement?.sessionsPerDevice?.value) foundMetrics++;
  if (metrics.engagement?.retention?.day1?.value) foundMetrics++;
  
  // Count technical metrics
  if (metrics.technical?.crashes?.value) foundMetrics++;
  if (metrics.technical?.crashRate?.value) foundMetrics++;
  
  const successRate = (foundMetrics / totalPossibleMetrics) * 100;
  return `${foundMetrics}/${totalPossibleMetrics} metrics (${successRate.toFixed(1)}%)`;
};
