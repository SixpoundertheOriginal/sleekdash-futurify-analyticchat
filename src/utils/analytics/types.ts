export interface ProcessedAnalytics {
  summary: {
    title: string;
    dateRange: string;
    executiveSummary: string;
  };
  acquisition: {
    impressions: { value: number; change: number };
    pageViews: { value: number; change: number };
    conversionRate: { value: number; change: number };
    downloads: { value: number; change: number };
    funnelMetrics: {
      impressionsToViews: number;
      viewsToDownloads: number;
    };
  };
  financial: {
    proceeds: { value: number; change: number };
    proceedsPerUser: { value: number; change: number };
    derivedMetrics: {
      arpd: number;
      revenuePerImpression: number;
      monetizationEfficiency: number;
      payingUserPercentage: number;
    };
  };
  engagement: {
    sessionsPerDevice: { value: number; change: number };
    retention: {
      day1: { value: number; benchmark: number };
      day7: { value: number; benchmark: number };
      day14?: { value: number; benchmark: number };
      day28?: { value: number; benchmark: number };
    };
  };
  technical: {
    crashes: { value: number; change: number };
    crashRate: { value: number; percentile: string };
  };
  geographical: {
    markets: Array<{
      country: string;
      percentage: number;
      downloads: number;
    }>;
    devices: Array<{
      type: string;
      percentage: number;
      count: number;
    }>;
    sources?: Array<{
      source: string;
      percentage: number;
      downloads: number;
    }>;
  };
}
