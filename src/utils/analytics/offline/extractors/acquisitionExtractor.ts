
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
  
  // Extract impressions
  const impressionsMatch = rawInput.match(/Impressions:?\s*\??\s*([0-9,.KM]+)\s*([+-][0-9]+%)/i);
  if (impressionsMatch) {
    result.acquisition!.impressions = {
      value: normalizeValue(impressionsMatch[1]),
      change: parseInt(impressionsMatch[2])
    };
    console.log('Extracted impressions:', result.acquisition!.impressions);
  }

  // Extract page views
  const pageViewsMatch = rawInput.match(/(?:Product )?Page Views:?\s*\??\s*([0-9,.KM]+)\s*([+-][0-9]+%)/i);
  if (pageViewsMatch) {
    result.acquisition!.pageViews = {
      value: normalizeValue(pageViewsMatch[1]),
      change: parseInt(pageViewsMatch[2])
    };
    console.log('Extracted page views:', result.acquisition!.pageViews);
  }

  // Extract conversion rate
  const conversionRateMatch = rawInput.match(/Conversion Rate:?\s*\??\s*([0-9,.]+%)\s*([+-][0-9]+%)/i);
  if (conversionRateMatch) {
    result.acquisition!.conversionRate = {
      value: parseFloat(conversionRateMatch[1]),
      change: parseInt(conversionRateMatch[2])
    };
    console.log('Extracted conversion rate:', result.acquisition!.conversionRate);
  }

  // Extract downloads
  const downloadsMatch = rawInput.match(/(?:Total )?Downloads:?\s*\??\s*([0-9,.KM]+)\s*([+-][0-9]+%)/i);
  if (downloadsMatch) {
    result.acquisition!.downloads = {
      value: normalizeValue(downloadsMatch[1]),
      change: parseInt(downloadsMatch[2])
    };
    console.log('Extracted downloads:', result.acquisition!.downloads);
  }

  return result;
};
