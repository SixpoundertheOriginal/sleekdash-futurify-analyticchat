
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
  
  // Normalize input - trim whitespace, standardize newlines, and normalize spacing around question marks
  const normalizedInput = rawInput.replace(/\r\n/g, '\n')
                                 .replace(/\s*\?\s*/g, ' ? ')
                                 .trim();
  
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
  
  // Try multiple pattern variants for each metric to increase extraction success rate
  
  // Extract impressions - improved patterns for different formats
  const impressionPatterns = [
    /Impressions:?\s*\??\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)/i,
    /Impressions:?\s*\??\s*([0-9,.KMBkmb]+)/i,
    /Impressions\s*\n\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)?/i,
    /([0-9,.KMBkmb]+)\s*impressions/i,
    /Impressions\s*\n\s*([0-9,.KMBkmb]+)/i
  ];
  
  for (const pattern of impressionPatterns) {
    const match = normalizedInput.match(pattern);
    if (match && match[1]) {
      result.acquisition.impressions = {
        value: normalizeValue(match[1]),
        change: match[2] ? parseInt(match[2]) : 0
      };
      console.log('Extracted impressions:', result.acquisition.impressions);
      break;
    }
  }

  // Extract page views - improved patterns with "Product" prefix and without
  const pageViewPatterns = [
    /(?:Product )?Page Views:?\s*\??\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)/i,
    /(?:Product )?Page Views:?\s*\??\s*([0-9,.KMBkmb]+)/i,
    /(?:Product )?Page Views\s*\n\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)?/i,
    /([0-9,.KMBkmb]+)\s*(?:product )?page views/i,
    /(?:Product )?Page Views\s*\n\s*([0-9,.KMBkmb]+)/i
  ];
  
  for (const pattern of pageViewPatterns) {
    const match = normalizedInput.match(pattern);
    if (match && match[1]) {
      result.acquisition.pageViews = {
        value: normalizeValue(match[1]),
        change: match[2] ? parseInt(match[2]) : 0
      };
      console.log('Extracted page views:', result.acquisition.pageViews);
      break;
    }
  }

  // Extract conversion rate - improved patterns with more variations
  const conversionPatterns = [
    /Conversion Rate:?\s*\??\s*([0-9,.]+)%\s*([+-][0-9]+%)/i,
    /Conversion Rate:?\s*\??\s*([0-9,.]+)%/i,
    /Conversion Rate:?\s*\??\s*([0-9,.]+)\s*%\s*([+-][0-9]+%)?/i,
    /Conversion Rate\s*\n\s*([0-9,.]+)%\s*([+-][0-9]+%)?/i,
    /([0-9,.]+)%\s*conversion rate/i,
    /Conversion Rate\s*\n\s*([0-9,.]+)%/i
  ];
  
  for (const pattern of conversionPatterns) {
    const match = normalizedInput.match(pattern);
    if (match && match[1]) {
      const conversionValue = match[1].replace('%', '');
      result.acquisition.conversionRate = {
        value: parseFloat(conversionValue),
        change: match[2] ? parseInt(match[2]) : 0
      };
      console.log('Extracted conversion rate:', result.acquisition.conversionRate);
      break;
    }
  }

  // Extract downloads - improved patterns with "Total" prefix and without
  const downloadPatterns = [
    /(?:Total )?Downloads:?\s*\??\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)/i,
    /(?:Total )?Downloads:?\s*\??\s*([0-9,.KMBkmb]+)/i,
    /(?:Total )?Downloads\s*\n\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)?/i,
    /([0-9,.KMBkmb]+)\s*(?:total )?downloads/i,
    /([0-9,.KMBkmb]+)\s*\n\s*Total Downloads/i,
    /(?:Total )?Downloads\s*\n\s*([0-9,.KMBkmb]+)/i
  ];
  
  for (const pattern of downloadPatterns) {
    const match = normalizedInput.match(pattern);
    if (match && match[1]) {
      result.acquisition.downloads = {
        value: normalizeValue(match[1]),
        change: match[2] ? parseInt(match[2]) : 0
      };
      console.log('Extracted downloads:', result.acquisition.downloads);
      break;
    }
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

  // Look for total downloads section at the bottom if we haven't found it yet
  if (!result.acquisition.downloads.value) {
    const territorySection = normalizedInput.match(/Total Downloads by Territory[\s\S]*?See All([\s\S]*?)(?=Total Downloads by|$)/i);
    if (territorySection) {
      const totalMatch = normalizedInput.match(/([0-9,.KMBkmb]+)\s*Total/i);
      if (totalMatch && totalMatch[1]) {
        result.acquisition.downloads.value = normalizeValue(totalMatch[1]);
        console.log('Extracted total downloads from territory section:', result.acquisition.downloads.value);
      }
    }
  }

  return result;
};
