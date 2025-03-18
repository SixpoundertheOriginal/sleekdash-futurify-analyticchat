
/**
 * Extractor for financial-related metrics
 */
import { ProcessedAnalytics } from "../../types";
import { normalizeValue } from "../normalization";

/**
 * Extract financial metrics from raw input
 */
export const extractFinancialMetrics = (rawInput: any, result: Partial<ProcessedAnalytics>) => {
  // Ensure rawInput is a string before attempting to use match
  if (typeof rawInput !== 'string') {
    console.log('Input to extractFinancialMetrics is not a string:', typeof rawInput);
    return result;
  }
  
  // Normalize input - trim whitespace, standardize newlines, and normalize spacing around question marks
  const normalizedInput = rawInput.replace(/\r\n/g, '\n')
                                 .replace(/\s*\?\s*/g, ' ? ')
                                 .trim();
  
  // Initialize financial object if it doesn't exist
  result.financial = result.financial || {
    proceeds: { value: 0, change: 0 },
    proceedsPerUser: { value: 0, change: 0 },
    derivedMetrics: {
      arpd: 0,
      revenuePerImpression: 0,
      monetizationEfficiency: 0,
      payingUserPercentage: 0
    }
  };
  
  // Extract proceeds with improved patterns for multiple formats
  const proceedsPatterns = [
    /Proceeds:?\s*\??\s*\$?([0-9,.KMkm]+)\s*([+-][0-9]+%)/i,
    /Proceeds:?\s*\??\s*\$?([0-9,.KMkm]+)/i,
    /Proceeds\s*\n\s*\$?([0-9,.KMkm]+)\s*([+-][0-9]+%)?/i,
    /\$?([0-9,.KMkm]+)\s*proceeds/i,
    /Revenue:?\s*\??\s*\$?([0-9,.KMkm]+)\s*([+-][0-9]+%)?/i
  ];
  
  for (const pattern of proceedsPatterns) {
    const match = normalizedInput.match(pattern);
    if (match && match[1]) {
      result.financial.proceeds = {
        value: normalizeValue(match[1]),
        change: match[2] ? parseInt(match[2]) : 0
      };
      console.log('Extracted proceeds:', result.financial.proceeds);
      break;
    }
  }

  // Extract proceeds per user with improved patterns for multiple formats
  const proceedsPerUserPatterns = [
    /Proceeds per (?:Paying )?User:?\s*\??\s*\$?([0-9,.]+)\s*([+-][0-9.]+%)/i,
    /Proceeds per (?:Paying )?User:?\s*\??\s*\$?([0-9,.]+)/i,
    /Proceeds per (?:Paying )?User\s*\n\s*\$?([0-9,.]+)\s*([+-][0-9.]+%)?/i,
    /\$?([0-9,.]+)\s*proceeds per (?:paying )?user/i,
    /Average Revenue per User:?\s*\??\s*\$?([0-9,.]+)\s*([+-][0-9.]+%)?/i,
    /ARPU:?\s*\??\s*\$?([0-9,.]+)\s*([+-][0-9.]+%)?/i
  ];
  
  for (const pattern of proceedsPerUserPatterns) {
    const match = normalizedInput.match(pattern);
    if (match && match[1]) {
      result.financial.proceedsPerUser = {
        value: parseFloat(match[1].replace(/,/g, '')),
        change: match[2] ? parseFloat(match[2]) : 0
      };
      console.log('Extracted proceeds per user:', result.financial.proceedsPerUser);
      break;
    }
  }
  
  // Check for benchmark information about proceeds per user
  const benchmarkSection = normalizedInput.match(/Benchmarks[\s\S]*?Proceeds per Paying User[\s\S]*?Your proceeds per paying user value of \$([0-9,.]+)[\s\S]*?(above|between)[\s\S]*?([\d]+)(?:th|st|nd|rd)/i);
  if (benchmarkSection && benchmarkSection[1]) {
    // If we already have a value, don't overwrite it, just log
    if (!result.financial.proceedsPerUser.value) {
      result.financial.proceedsPerUser.value = parseFloat(benchmarkSection[1].replace(/,/g, ''));
      console.log('Extracted proceeds per user from benchmark section:', result.financial.proceedsPerUser.value);
    }
  }
  
  // If we have proceeds and downloads data, calculate derived ARPD (Average Revenue Per Download)
  if (result.financial.proceeds.value > 0 && result?.acquisition?.downloads?.value > 0) {
    result.financial.derivedMetrics.arpd = result.financial.proceeds.value / result.acquisition.downloads.value;
    console.log('Calculated ARPD:', result.financial.derivedMetrics.arpd);
  }
  
  // If we have proceeds and impressions data, calculate revenue per impression
  if (result.financial.proceeds.value > 0 && result?.acquisition?.impressions?.value > 0) {
    result.financial.derivedMetrics.revenuePerImpression = 
      result.financial.proceeds.value / result.acquisition.impressions.value;
    console.log('Calculated revenue per impression:', result.financial.derivedMetrics.revenuePerImpression);
  }

  return result;
};
