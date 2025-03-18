
/**
 * Extractor for technical-related metrics
 */
import { ProcessedAnalytics } from "../../types";
import { normalizeValue } from "../normalization";

/**
 * Extract technical metrics from raw input
 */
export const extractTechnicalMetrics = (rawInput: any, result: Partial<ProcessedAnalytics>) => {
  // Ensure rawInput is a string before attempting to use match
  if (typeof rawInput !== 'string') {
    console.log('Input to extractTechnicalMetrics is not a string:', typeof rawInput);
    return result;
  }
  
  // Normalize input - trim whitespace and standardize newlines
  const normalizedInput = rawInput.replace(/\r\n/g, '\n').trim();
  
  // Extract crashes - improved patterns to match App Store Connect format
  // First try the standard format with question mark
  let crashesMatch = normalizedInput.match(/Crashes:?\s*\??\s*([0-9,.KMkm]+)\s*([+-][0-9]+%)/i);
  
  // If not found, try alternate format without change percentage
  if (!crashesMatch) {
    crashesMatch = normalizedInput.match(/Crashes:?\s*\??\s*([0-9,.KMkm]+)/i);
  }
  
  // If still not found, try looking for "Crash Count" which is sometimes used
  if (!crashesMatch) {
    crashesMatch = normalizedInput.match(/Crash Count:?\s*\??\s*([0-9,.KMkm]+)\s*([+-][0-9]+%)?/i);
  }
  
  if (crashesMatch) {
    result.technical = result.technical || {
      crashes: { value: 0, change: 0 },
      crashRate: { value: 0, percentile: "" }
    };
    
    result.technical.crashes = {
      value: normalizeValue(crashesMatch[1]),
      change: crashesMatch[2] ? parseInt(crashesMatch[2]) : 0
    };
    console.log('Extracted crashes:', result.technical.crashes);
  }
  
  // Extract crash rate
  const crashRateMatch = normalizedInput.match(/Crash Rate:?\s*\??\s*([\d.]+)%/i);
  if (crashRateMatch) {
    result.technical = result.technical || {
      crashes: { value: 0, change: 0 },
      crashRate: { value: 0, percentile: "" }
    };
    
    result.technical.crashRate.value = parseFloat(crashRateMatch[1]);
    
    // Try to extract percentile information
    const percentileMatch = normalizedInput.match(/(\d+)(?:th|st|nd|rd) percentile/i);
    if (percentileMatch) {
      result.technical.crashRate.percentile = percentileMatch[1];
    }
    
    console.log('Extracted crash rate:', result.technical.crashRate);
  }
  
  // Look for crash information in the benchmarks section
  const benchmarkSection = normalizedInput.match(/Benchmarks[\s\S]*?Crash Rate[\s\S]*?Your crash rate of ([\d.]+)%[\s\S]*?([\d]+)(?:th|st|nd|rd)/i);
  if (benchmarkSection) {
    result.technical = result.technical || {
      crashes: { value: 0, change: 0 },
      crashRate: { value: 0, percentile: "" }
    };
    
    if (benchmarkSection[1]) {
      result.technical.crashRate.value = parseFloat(benchmarkSection[1]);
    }
    
    if (benchmarkSection[2]) {
      result.technical.crashRate.percentile = benchmarkSection[2];
    }
    
    console.log('Extracted crash rate from benchmark section:', result.technical.crashRate);
  }

  return result;
};
