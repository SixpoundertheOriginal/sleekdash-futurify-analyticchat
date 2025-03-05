
import { ProcessedAnalytics } from "../types";

/**
 * Extract acquisition metrics from analysis text
 */
export const extractAcquisitionMetrics = (text: string): ProcessedAnalytics["acquisition"] => {
  const result: ProcessedAnalytics["acquisition"] = {
    impressions: { value: 0, change: 0 },
    pageViews: { value: 0, change: 0 },
    conversionRate: { value: 0, change: 0 },
    downloads: { value: 0, change: 0 },
    funnelMetrics: {
      impressionsToViews: 0,
      viewsToDownloads: 0,
    },
  };

  const acquisitionSection = text.match(/User Acquisition Metrics(.*?)(?=###)/s);
  if (!acquisitionSection) return result;
  
  const metrics = acquisitionSection[1];

  // Extract impressions
  const impressionsMatch = metrics.match(/Impressions:\s*([\d,]+)\s*\(([+-]\d+)%\)/);
  if (impressionsMatch) {
    result.impressions = {
      value: parseInt(impressionsMatch[1].replace(/,/g, '')),
      change: parseInt(impressionsMatch[2])
    };
  }

  // Extract page views
  const pageViewsMatch = metrics.match(/Product Page Views:\s*([\d,]+)\s*\(([+-]\d+)%\)/);
  if (pageViewsMatch) {
    result.pageViews = {
      value: parseInt(pageViewsMatch[1].replace(/,/g, '')),
      change: parseInt(pageViewsMatch[2])
    };
  }

  // Extract conversion rate
  const conversionMatch = metrics.match(/Conversion Rate:\s*([\d.]+)%\s*\(([+-]\d+)%\)/);
  if (conversionMatch) {
    result.conversionRate = {
      value: parseFloat(conversionMatch[1]),
      change: parseInt(conversionMatch[2])
    };
  }

  // Extract downloads
  const downloadsMatch = metrics.match(/Total Downloads:\s*([\d,]+)\s*\(([+-]\d+)%\)/);
  if (downloadsMatch) {
    result.downloads = {
      value: parseInt(downloadsMatch[1].replace(/,/g, '')),
      change: parseInt(downloadsMatch[2])
    };
  }

  // Calculate funnel metrics if we have the necessary data
  if (result.impressions.value > 0 && result.pageViews.value > 0 && result.downloads.value > 0) {
    result.funnelMetrics = {
      impressionsToViews: (result.pageViews.value / result.impressions.value) * 100,
      viewsToDownloads: (result.downloads.value / result.pageViews.value) * 100
    };
  }

  return result;
};
