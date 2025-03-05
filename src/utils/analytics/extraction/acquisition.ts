
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

  // Looking for Acquisition section
  console.log('Searching for acquisition section...');
  const acquisitionSection = text.match(/(?:Acquisition|User Acquisition Metrics)(.*?)(?=###|Engagement|Monetization|Retention|Financial|Recommendations)/s);
  if (!acquisitionSection) {
    console.log('Acquisition section not found, using whole text');
    // If no specific section, search the whole text
    // Impressions
    const impressionsMatch = text.match(/Impressions:?\s*([\d,]+)\s*\(([+-]\d+)%\)/i);
    if (impressionsMatch) {
      result.impressions = {
        value: parseInt(impressionsMatch[1].replace(/,/g, '')),
        change: parseInt(impressionsMatch[2])
      };
      console.log('Found impressions:', result.impressions);
    }

    // Page Views
    const pageViewsMatch = text.match(/(?:Product Page Views|Page Views):?\s*([\d,]+)\s*\(([+-]\d+)%\)/i);
    if (pageViewsMatch) {
      result.pageViews = {
        value: parseInt(pageViewsMatch[1].replace(/,/g, '')),
        change: parseInt(pageViewsMatch[2])
      };
      console.log('Found page views:', result.pageViews);
    }

    // Conversion Rate
    const conversionMatch = text.match(/Conversion Rate:?\s*([\d.]+)%\s*\(([+-]\d+)%\)/i);
    if (conversionMatch) {
      result.conversionRate = {
        value: parseFloat(conversionMatch[1]),
        change: parseInt(conversionMatch[2])
      };
      console.log('Found conversion rate:', result.conversionRate);
    }

    // Downloads
    const downloadsMatch = text.match(/(?:Total Downloads|Downloads):?\s*([\d,]+)\s*\(([+-]\d+)%\)/i);
    if (downloadsMatch) {
      result.downloads = {
        value: parseInt(downloadsMatch[1].replace(/,/g, '')),
        change: parseInt(downloadsMatch[2])
      };
      console.log('Found downloads:', result.downloads);
    }
  } else {
    console.log('Found acquisition section');
    const metrics = acquisitionSection[1];

    // Impressions
    const impressionsMatch = metrics.match(/Impressions:?\s*([\d,]+)\s*\(([+-]\d+)%\)/i);
    if (impressionsMatch) {
      result.impressions = {
        value: parseInt(impressionsMatch[1].replace(/,/g, '')),
        change: parseInt(impressionsMatch[2])
      };
      console.log('Found impressions:', result.impressions);
    }

    // Page Views
    const pageViewsMatch = metrics.match(/(?:Product Page Views|Page Views):?\s*([\d,]+)\s*\(([+-]\d+)%\)/i);
    if (pageViewsMatch) {
      result.pageViews = {
        value: parseInt(pageViewsMatch[1].replace(/,/g, '')),
        change: parseInt(pageViewsMatch[2])
      };
      console.log('Found page views:', result.pageViews);
    }

    // Conversion Rate
    const conversionMatch = metrics.match(/Conversion Rate:?\s*([\d.]+)%\s*\(([+-]\d+)%\)/i);
    if (conversionMatch) {
      result.conversionRate = {
        value: parseFloat(conversionMatch[1]),
        change: parseInt(conversionMatch[2])
      };
      console.log('Found conversion rate:', result.conversionRate);
    }

    // Downloads
    const downloadsMatch = metrics.match(/(?:Total Downloads|Downloads):?\s*([\d,]+)\s*\(([+-]\d+)%\)/i);
    if (downloadsMatch) {
      result.downloads = {
        value: parseInt(downloadsMatch[1].replace(/,/g, '')),
        change: parseInt(downloadsMatch[2])
      };
      console.log('Found downloads:', result.downloads);
    }
  }

  // Calculate funnel metrics if we have the necessary data
  if (result.impressions.value > 0 && result.pageViews.value > 0 && result.downloads.value > 0) {
    result.funnelMetrics = {
      impressionsToViews: (result.pageViews.value / result.impressions.value) * 100,
      viewsToDownloads: (result.downloads.value / result.pageViews.value) * 100
    };
    console.log('Calculated funnel metrics:', result.funnelMetrics);
  }

  return result;
};
