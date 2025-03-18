
/**
 * Initial structure for metrics with defaults
 */
import { ProcessedAnalytics } from "../types";

/**
 * Create initial metrics structure with default values
 */
export const createBaseMetricsStructure = (): Partial<ProcessedAnalytics> => {
  return {
    summary: {
      title: "App Analytics Report",
      dateRange: "Not specified",
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
        day7: { value: 0, benchmark: 0 },
        day14: { value: 0, benchmark: 0 }
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
      crashRate: { value: 0, percentile: "average" }
    },
    geographical: {
      markets: [],
      devices: [],
      sources: []
    }
  };
};
