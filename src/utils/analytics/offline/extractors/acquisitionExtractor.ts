/**
 * Extractor for acquisition-related metrics
 */
import { ProcessedAnalytics } from "../../types";
import { normalizeValue, normalizePercentageChange } from "../normalization";

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
  
  // Extract impressions - App Store Connect specific patterns
  const appStoreImpressionsPatterns = [
    // App Store Connect format with question mark on separate line
    /Impressions\s*\n\s*\?\s*\n\s*([0-9,.KMBkmb]+)\s*\n\s*([+-][0-9]+%)/i,
    /Impressions\s*\n\s*\?\s*\n\s*([0-9,.KMBkmb]+)/i
  ];
  
  // Standard patterns for impressions
  const standardImpressionsPatterns = [
    /Impressions:?\s*\??\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)/i,
    /Impressions:?\s*\??\s*([0-9,.KMBkmb]+)/i,
    /Impressions\s*\n\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)?/i,
    /([0-9,.KMBkmb]+)\s*impressions/i
  ];
  
  // Try App Store Connect patterns first
  let matchFound = false;
  for (const pattern of appStoreImpressionsPatterns) {
    const match = normalizedInput.match(pattern);
    if (match && match[1]) {
      result.acquisition.impressions = {
        value: normalizeValue(match[1]),
        change: match[2] ? normalizePercentageChange(match[2]) : 0
      };
      console.log('Extracted App Store impressions:', result.acquisition.impressions);
      matchFound = true;
      break;
    }
  }
  
  // If no match found, try standard patterns
  if (!matchFound) {
    for (const pattern of standardImpressionsPatterns) {
      const match = normalizedInput.match(pattern);
      if (match && match[1]) {
        result.acquisition.impressions = {
          value: normalizeValue(match[1]),
          change: match[2] ? normalizePercentageChange(match[2]) : 0
        };
        console.log('Extracted standard impressions:', result.acquisition.impressions);
        break;
      }
    }
  }
  
  // Extract page views - App Store Connect specific patterns
  const appStorePageViewsPatterns = [
    // App Store Connect format with question mark on separate line
    /(?:Product )?Page Views\s*\n\s*\?\s*\n\s*([0-9,.KMBkmb]+)\s*\n\s*([+-][0-9]+%)/i,
    /(?:Product )?Page Views\s*\n\s*\?\s*\n\s*([0-9,.KMBkmb]+)/i
  ];
  
  // Standard patterns for page views
  const standardPageViewsPatterns = [
    /(?:Product )?Page Views:?\s*\??\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)/i,
    /(?:Product )?Page Views:?\s*\??\s*([0-9,.KMBkmb]+)/i,
    /(?:Product )?Page Views\s*\n\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)?/i,
    /([0-9,.KMBkmb]+)\s*(?:product )?page views/i
  ];
  
  // Try App Store Connect patterns first for page views
  matchFound = false;
  for (const pattern of appStorePageViewsPatterns) {
    const match = normalizedInput.match(pattern);
    if (match && match[1]) {
      result.acquisition.pageViews = {
        value: normalizeValue(match[1]),
        change: match[2] ? normalizePercentageChange(match[2]) : 0
      };
      console.log('Extracted App Store page views:', result.acquisition.pageViews);
      matchFound = true;
      break;
    }
  }
  
  // If no match found, try standard patterns for page views
  if (!matchFound) {
    for (const pattern of standardPageViewsPatterns) {
      const match = normalizedInput.match(pattern);
      if (match && match[1]) {
        result.acquisition.pageViews = {
          value: normalizeValue(match[1]),
          change: match[2] ? normalizePercentageChange(match[2]) : 0
        };
        console.log('Extracted standard page views:', result.acquisition.pageViews);
        break;
      }
    }
  }
  
  // Extract conversion rate - App Store Connect specific patterns
  const appStoreConversionPatterns = [
    // App Store Connect format with question mark on separate line
    /Conversion Rate\s*\n\s*\?\s*\n\s*([0-9,.]+)%\s*\n\s*([+-][0-9]+%)/i,
    /Conversion Rate\s*\n\s*\?\s*\n\s*([0-9,.]+)%/i
  ];
  
  // Standard patterns for conversion rate
  const standardConversionPatterns = [
    /Conversion Rate:?\s*\??\s*([0-9,.]+)%\s*([+-][0-9]+%)/i,
    /Conversion Rate:?\s*\??\s*([0-9,.]+)%/i,
    /Conversion Rate:?\s*\??\s*([0-9,.]+)\s*%\s*([+-][0-9]+%)?/i,
    /Conversion Rate\s*\n\s*([0-9,.]+)%\s*([+-][0-9]+%)?/i,
    /([0-9,.]+)%\s*conversion rate/i
  ];
  
  // Try App Store Connect patterns first for conversion rate
  matchFound = false;
  for (const pattern of appStoreConversionPatterns) {
    const match = normalizedInput.match(pattern);
    if (match && match[1]) {
      result.acquisition.conversionRate = {
        value: parseFloat(match[1]),
        change: match[2] ? normalizePercentageChange(match[2]) : 0
      };
      console.log('Extracted App Store conversion rate:', result.acquisition.conversionRate);
      matchFound = true;
      break;
    }
  }
  
  // If no match found, try standard patterns for conversion rate
  if (!matchFound) {
    for (const pattern of standardConversionPatterns) {
      const match = normalizedInput.match(pattern);
      if (match && match[1]) {
        result.acquisition.conversionRate = {
          value: parseFloat(match[1]),
          change: match[2] ? normalizePercentageChange(match[2]) : 0
        };
        console.log('Extracted standard conversion rate:', result.acquisition.conversionRate);
        break;
      }
    }
  }
  
  // Extract downloads - App Store Connect specific patterns
  const appStoreDownloadsPatterns = [
    // App Store Connect format with question mark on separate line
    /(?:Total )?Downloads\s*\n\s*\?\s*\n\s*([0-9,.KMBkmb]+)\s*\n\s*([+-][0-9]+%)/i,
    /(?:Total )?Downloads\s*\n\s*\?\s*\n\s*([0-9,.KMBkmb]+)/i
  ];
  
  // Standard patterns for downloads
  const standardDownloadsPatterns = [
    /(?:Total )?Downloads:?\s*\??\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)/i,
    /(?:Total )?Downloads:?\s*\??\s*([0-9,.KMBkmb]+)/i,
    /(?:Total )?Downloads\s*\n\s*([0-9,.KMBkmb]+)\s*([+-][0-9]+%)?/i,
    /([0-9,.KMBkmb]+)\s*(?:total )?downloads/i
  ];
  
  // Try App Store Connect patterns first for downloads
  matchFound = false;
  for (const pattern of appStoreDownloadsPatterns) {
    const match = normalizedInput.match(pattern);
    if (match && match[1]) {
      result.acquisition.downloads = {
        value: normalizeValue(match[1]),
        change: match[2] ? normalizePercentageChange(match[2]) : 0
      };
      console.log('Extracted App Store downloads:', result.acquisition.downloads);
      matchFound = true;
      break;
    }
  }
  
  // If no match found, try standard patterns for downloads
  if (!matchFound) {
    for (const pattern of standardDownloadsPatterns) {
      const match = normalizedInput.match(pattern);
      if (match && match[1]) {
        result.acquisition.downloads = {
          value: normalizeValue(match[1]),
          change: match[2] ? normalizePercentageChange(match[2]) : 0
        };
        console.log('Extracted standard downloads:', result.acquisition.downloads);
        break;
      }
    }
  }

  return result;
};
