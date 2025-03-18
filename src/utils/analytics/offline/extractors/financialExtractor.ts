
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
  
  // Normalize input - trim whitespace and standardize newlines
  const normalizedInput = rawInput.replace(/\r\n/g, '\n').trim();
  
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
  
  // Extract proceeds - improved patterns to match App Store Connect format with question mark
  let proceedsMatch = normalizedInput.match(/Proceeds:?\s*\??\s*\$?([0-9,.KMkm]+)\s*([+-][0-9]+%)/i);
  
  // If not found, try alternate format without change percentage
  if (!proceedsMatch) {
    proceedsMatch = normalizedInput.match(/Proceeds:?\s*\??\s*\$?([0-9,.KMkm]+)/i);
  }
  
  if (proceedsMatch) {
    result.financial.proceeds = {
      value: normalizeValue(proceedsMatch[1]),
      change: proceedsMatch[2] ? parseInt(proceedsMatch[2]) : 0
    };
    console.log('Extracted proceeds:', result.financial.proceeds);
  }

  // Extract proceeds per user - improved patterns with question mark and optional "Paying" word
  let proceedsPerUserMatch = normalizedInput.match(/Proceeds per (?:Paying )?User:?\s*\??\s*\$?([0-9,.]+)\s*([+-][0-9.]+%)/i);
  
  // If not found, try alternate format without change percentage
  if (!proceedsPerUserMatch) {
    proceedsPerUserMatch = normalizedInput.match(/Proceeds per (?:Paying )?User:?\s*\??\s*\$?([0-9,.]+)/i);
  }
  
  if (proceedsPerUserMatch) {
    result.financial.proceedsPerUser = {
      value: parseFloat(proceedsPerUserMatch[1].replace(/,/g, '')),
      change: proceedsPerUserMatch[2] ? parseFloat(proceedsPerUserMatch[2]) : 0
    };
    console.log('Extracted proceeds per user:', result.financial.proceedsPerUser);
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

  return result;
};
