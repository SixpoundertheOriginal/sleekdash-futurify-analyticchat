
/**
 * Extractor for acquisition-related metrics
 */
import { ProcessedAnalytics } from "../../types";
import { normalizeValue } from "../normalization";

/**
 * Extract acquisition metrics from raw input
 */
export const extractAcquisitionMetrics = (rawInput: any, result: Partial<ProcessedAnalytics>) => {
  // Ensure rawInput is a string before attempting to use match
  if (typeof rawInput !== 'string') {
    console.log('Input to extractAcquisitionMetrics is not a string:', typeof rawInput);
    return result;
  }
  
  // Normalize input - trim whitespace and standardize newlines
  const normalizedInput = rawInput.replace(/\r\n/g, '\n').trim();
  
  // Initialize acquisition object if it doesn't exist
  result.acquisition = result.acquisition || {
    impressions: { value: 0, change: 0 },
    pageViews: { value: 0, change: 0 },
    conversionRate: { value: 0, change: 0 },
    downloads: { value: 0, change: 0 },
    funnelMetrics: {
      impressionsToViews: 0,
      viewsToDownloads: 0
    }
  };
  
  // Extract impressions - improved pattern with question mark
  let impressionsMatch = normalizedInput.match(/Impressions:?\s*\??\s*([0-9,.KMkm]+)\s*([+-][0-9]+%)/i);
  
  // If not found, try alternate format without change percentage
  if (!impressionsMatch) {
    impressionsMatch = normalizedInput.match(/Impressions:?\s*\??\s*([0-9,.KMkm]+)/i);
  }
  
  if (impressionsMatch) {
    result.acquisition.impressions = {
      value: normalizeValue(impressionsMatch[1]),
      change: impressionsMatch[2] ? parseInt(impressionsMatch[2]) : 0
    };
    console.log('Extracted impressions:', result.acquisition.impressions);
  }

  // Extract page views - improved pattern with "Product" prefix and question mark
  let pageViewsMatch = normalizedInput.match(/(?:Product )?Page Views:?\s*\??\s*([0-9,.KMkm]+)\s*([+-][0-9]+%)/i);
  
  // If not found, try alternate format without change percentage
  if (!pageViewsMatch) {
    pageViewsMatch = normalizedInput.match(/(?:Product )?Page Views:?\s*\??\s*([0-9,.KMkm]+)/i);
  }
  
  if (pageViewsMatch) {
    result.acquisition.pageViews = {
      value: normalizeValue(pageViewsMatch[1]),
      change: pageViewsMatch[2] ? parseInt(pageViewsMatch[2]) : 0
    };
    console.log('Extracted page views:', result.acquisition.pageViews);
  }

  // Extract conversion rate - improved pattern with question mark
  let conversionRateMatch = normalizedInput.match(/Conversion Rate:?\s*\??\s*([0-9,.]+%)\s*([+-][0-9]+%)/i);
  
  // If not found, try without the % in the value (we'll add it later)
  if (!conversionRateMatch) {
    conversionRateMatch = normalizedInput.match(/Conversion Rate:?\s*\??\s*([0-9,.]+)\s*%\s*([+-][0-9]+%)/i);
  }
  
  // If still not found, try without change percentage
  if (!conversionRateMatch) {
    conversionRateMatch = normalizedInput.match(/Conversion Rate:?\s*\??\s*([0-9,.]+)%?/i);
  }
  
  if (conversionRateMatch) {
    const conversionValue = conversionRateMatch[1].replace('%', '');
    result.acquisition.conversionRate = {
      value: parseFloat(conversionValue),
      change: conversionRateMatch[2] ? parseInt(conversionRateMatch[2]) : 0
    };
    console.log('Extracted conversion rate:', result.acquisition.conversionRate);
  }

  // Extract downloads - improved pattern with "Total" prefix and "Daily Average" prefix
  let downloadsMatch = normalizedInput.match(/(?:Daily Average\s*\n)?(?:Total )?Downloads:?\s*\??\s*([0-9,.KMkm]+)\s*([+-][0-9]+%)/i);
  
  // If not found, try alternate format without change percentage
  if (!downloadsMatch) {
    downloadsMatch = normalizedInput.match(/(?:Daily Average\s*\n)?(?:Total )?Downloads:?\s*\??\s*([0-9,.KMkm]+)/i);
  }
  
  if (downloadsMatch) {
    result.acquisition.downloads = {
      value: normalizeValue(downloadsMatch[1]),
      change: downloadsMatch[2] ? parseInt(downloadsMatch[2]) : 0
    };
    console.log('Extracted downloads:', result.acquisition.downloads);
  }
  
  // Also look for the total downloads number at the bottom of the section
  const totalDownloadsMatch = normalizedInput.match(/([0-9,.KMkm]+)\s*\n\s*Total Downloads/i);
  if (totalDownloadsMatch && !result.acquisition.downloads.value) {
    result.acquisition.downloads.value = normalizeValue(totalDownloadsMatch[1]);
    console.log('Extracted total downloads from summary:', result.acquisition.downloads.value);
  }
  
  // Check for benchmark information in the Benchmarks section
  const benchmarkSection = normalizedInput.match(/Benchmarks[\s\S]*?Conversion Rate/i);
  if (benchmarkSection) {
    const conversionBenchmarkMatch = normalizedInput.match(/Your conversion rate of ([0-9.]+)%/i);
    if (conversionBenchmarkMatch && !result.acquisition.conversionRate.value) {
      result.acquisition.conversionRate.value = parseFloat(conversionBenchmarkMatch[1]);
      console.log('Extracted conversion rate from benchmark:', result.acquisition.conversionRate.value);
    }
  }

  // Calculate funnel metrics if we have the necessary data
  if (result.acquisition.impressions.value > 0 && result.acquisition.pageViews.value > 0) {
    result.acquisition.funnelMetrics.impressionsToViews = 
      (result.acquisition.pageViews.value / result.acquisition.impressions.value) * 100;
    console.log('Calculated impressions to views rate:', result.acquisition.funnelMetrics.impressionsToViews);
  }
  
  if (result.acquisition.pageViews.value > 0 && result.acquisition.downloads.value > 0) {
    result.acquisition.funnelMetrics.viewsToDownloads = 
      (result.acquisition.downloads.value / result.acquisition.pageViews.value) * 100;
    console.log('Calculated views to downloads rate:', result.acquisition.funnelMetrics.viewsToDownloads);
  }

  return result;
};
