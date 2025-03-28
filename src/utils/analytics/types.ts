
/**
 * Base metric type with value and change percentage
 */
export interface BaseMetric {
  value: number;
  change: number;
  formatted?: string; // Adding formatted property to BaseMetric
}

/**
 * Retention metric with value and benchmark
 */
export interface RetentionMetric {
  value: number;
  benchmark: number;
}

/**
 * Market/territory breakdown
 */
export interface MarketBreakdown {
  country: string;
  downloads: number;
  percentage: number;
}

/**
 * Device breakdown
 */
export interface DeviceBreakdown {
  type: string;
  count: number;
  percentage: number;
}

/**
 * Source breakdown
 */
export interface SourceBreakdown {
  source: string;
  downloads: number;
  percentage: number;
}

/**
 * Funnel metrics
 */
export interface FunnelMetrics {
  impressionsToViews: number;
  viewsToDownloads: number;
}

/**
 * Derived financial metrics
 */
export interface DerivedFinancialMetrics {
  arpd: number; // Average Revenue Per Download
  revenuePerImpression: number;
  monetizationEfficiency: number;
  payingUserPercentage: number;
}

/**
 * Acquisition metrics
 */
export interface AcquisitionMetrics {
  impressions: BaseMetric;
  pageViews: BaseMetric;
  conversionRate: BaseMetric;
  downloads: BaseMetric;
  funnelMetrics: FunnelMetrics;
}

/**
 * Financial metrics
 */
export interface FinancialMetrics {
  proceeds: BaseMetric;
  proceedsPerUser: BaseMetric;
  derivedMetrics: DerivedFinancialMetrics;
}

/**
 * Confidence scores for metrics
 */
export interface ConfidenceScores {
  overall: number;
  sessionsPerDevice: number;
  retention: number;
}

/**
 * Validation state for metrics
 */
export interface ValidationState {
  valid: boolean;
  warnings: string[];
}

/**
 * Engagement metrics
 */
export interface EngagementMetrics {
  sessionsPerDevice: BaseMetric;
  retention: {
    day1: RetentionMetric;
    day7: RetentionMetric;
    day14?: RetentionMetric;
    day28?: RetentionMetric;
  };
  confidenceScores?: ConfidenceScores; // Adding confidenceScores to EngagementMetrics
  validationState?: ValidationState; // Adding validationState to EngagementMetrics
}

/**
 * Technical metrics
 */
export interface TechnicalMetrics {
  crashes: BaseMetric;
  crashRate: {
    value: number;
    percentile: string;
  };
  crashFreeUsers: BaseMetric;
}

/**
 * Geographical & dimensional metrics
 */
export interface GeographicalMetrics {
  markets: MarketBreakdown[];
  devices: DeviceBreakdown[];
  sources: SourceBreakdown[];
}

/**
 * Summary information
 */
export interface AnalyticsSummary {
  title: string;
  dateRange: string;
  executiveSummary: string;
}

/**
 * Keyword metrics for ASO
 */
export interface KeywordMetrics {
  keyword: string;
  rank: number;
  difficulty: number;
  traffic: number;
  relevance: number;
}

/**
 * Complete processed analytics data
 */
export interface ProcessedAnalytics {
  summary: AnalyticsSummary;
  acquisition: AcquisitionMetrics;
  financial: FinancialMetrics;
  engagement: EngagementMetrics;
  technical: TechnicalMetrics;
  geographical: GeographicalMetrics;
  keywords?: KeywordMetrics[]; // Adding optional keywords property
}
