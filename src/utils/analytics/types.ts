
/**
 * Analytics data structure after processing
 */
export interface ProcessedAnalytics {
  summary: {
    title: string;
    dateRange: string;
    executiveSummary: string;
  };
  acquisition: {
    impressions: MetricWithChange;
    pageViews: MetricWithChange;
    conversionRate: MetricWithChange;
    downloads: MetricWithChange;
    funnelMetrics: {
      impressionsToViews: number;
      viewsToDownloads: number;
    };
  };
  financial: {
    proceeds: MetricWithChange;
    proceedsPerUser: MetricWithChange;
    derivedMetrics: {
      arpd: number;
      revenuePerImpression: number;
      monetizationEfficiency: number;
      payingUserPercentage: number;
    };
  };
  engagement: {
    sessionsPerDevice: MetricWithChange;
    retention: {
      day1: RetentionMetric;
      day7: RetentionMetric;
      day14?: RetentionMetric;
      day28?: RetentionMetric;
    };
    confidenceScores?: {
      overall: number;
      sessionsPerDevice: number;
      retention: number;
    };
    validationState?: {
      valid: boolean;
      warnings: string[];
    };
  };
  technical: {
    crashes: MetricWithChange;
    crashRate: {
      value: number;
      percentile: string;
    };
  };
  geographical: {
    markets: Territory[];
    devices: Device[];
    sources: Source[];
  };
  keywords?: {
    terms: KeywordTerm[];
  };
}

export interface MetricWithChange {
  value: number;
  change: number;
}

export interface RetentionMetric {
  value: number;
  benchmark: number;
}

export interface Territory {
  country: string;
  downloads: number;
  percentage: number;
}

export interface Device {
  type: string;
  count: number;
  percentage: number;
}

export interface Source {
  source: string;
  downloads: number;
  percentage: number;
}

export interface KeywordTerm {
  keyword: string;
  volume: number | null;
  difficulty: number | null;
}
