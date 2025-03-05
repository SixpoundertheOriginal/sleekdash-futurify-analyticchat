
/**
 * Calculator for derived metrics based on extracted base metrics
 */
import { ProcessedAnalytics } from "../../types";

/**
 * Calculate derived metrics based on extracted values
 */
export const calculateDerivedMetrics = (metrics: Partial<ProcessedAnalytics>): Partial<ProcessedAnalytics> => {
  // Calculate ARPD (Average Revenue Per Download)
  if (metrics.acquisition?.downloads.value > 0 && metrics.financial?.proceeds.value > 0) {
    metrics.financial.derivedMetrics.arpd = metrics.financial.proceeds.value / metrics.acquisition.downloads.value;
    console.log('Calculated ARPD:', metrics.financial.derivedMetrics.arpd);
  }

  // Calculate funnel metrics - impressions to views
  if (metrics.acquisition?.pageViews.value > 0 && metrics.acquisition?.impressions.value > 0) {
    metrics.acquisition.funnelMetrics.impressionsToViews = 
      (metrics.acquisition.pageViews.value / metrics.acquisition.impressions.value) * 100;
    console.log('Calculated impressions to views:', metrics.acquisition.funnelMetrics.impressionsToViews);
  }

  // Calculate funnel metrics - views to downloads
  if (metrics.acquisition?.downloads.value > 0 && metrics.acquisition?.pageViews.value > 0) {
    metrics.acquisition.funnelMetrics.viewsToDownloads = 
      (metrics.acquisition.downloads.value / metrics.acquisition.pageViews.value) * 100;
    console.log('Calculated views to downloads:', metrics.acquisition.funnelMetrics.viewsToDownloads);
  }

  return metrics;
};
