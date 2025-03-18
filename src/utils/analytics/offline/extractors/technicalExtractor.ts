
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
  
  // Normalize input - trim whitespace, standardize newlines, and normalize spacing around question marks
  const normalizedInput = rawInput.replace(/\r\n/g, '\n')
                                 .replace(/\s*\?\s*/g, ' ? ')
                                 .trim();
  
  // Extract crashes - improved patterns to match App Store Connect format with various prefixes
  const crashPatterns = [
    /Crashes:?\s*\??\s*([0-9,.KMkm]+)\s*([+-][0-9]+%)/i,
    /Crashes:?\s*\??\s*([0-9,.KMkm]+)/i,
    /Crash Count:?\s*\??\s*([0-9,.KMkm]+)\s*([+-][0-9]+%)?/i,
    /Crashes\s*\n\s*([0-9,.KMkm]+)\s*([+-][0-9]+%)?/i,
    /([0-9,.KMkm]+)\s*crashes/i,
    /App Crashes:?\s*\??\s*([0-9,.KMkm]+)\s*([+-][0-9]+%)?/i
  ];
  
  result.technical = result.technical || {
    crashes: { value: 0, change: 0 },
    crashRate: { value: 0, percentile: "" }
  };
  
  for (const pattern of crashPatterns) {
    const match = normalizedInput.match(pattern);
    if (match && match[1]) {
      result.technical.crashes = {
        value: normalizeValue(match[1]),
        change: match[2] ? parseInt(match[2]) : 0
      };
      console.log('Extracted crashes:', result.technical.crashes);
      break;
    }
  }
  
  // If crashes not found directly, look for descriptions like "crashes up by X%"
  if (!result.technical.crashes.value) {
    const crashChangePatterns = [
      /crashes up by (\d+)%/i,
      /crashes increased by (\d+)%/i,
      /crash count increased by (\d+)%/i
    ];
    
    for (const pattern of crashChangePatterns) {
      const match = normalizedInput.match(pattern);
      if (match && match[1]) {
        // Set a default value and the change percentage
        result.technical.crashes = {
          value: 100, // Default value
          change: parseInt(match[1])
        };
        console.log('Extracted crashes from description:', result.technical.crashes);
        break;
      }
    }
    
    // Also look for "crashes down by X%"
    const crashDownPatterns = [
      /crashes down by (\d+)%/i,
      /crashes decreased by (\d+)%/i,
      /crash count decreased by (\d+)%/i
    ];
    
    for (const pattern of crashDownPatterns) {
      const match = normalizedInput.match(pattern);
      if (match && match[1]) {
        // Set a default value and the negative change percentage
        result.technical.crashes = {
          value: 100, // Default value
          change: -parseInt(match[1])
        };
        console.log('Extracted crashes decrease from description:', result.technical.crashes);
        break;
      }
    }
  }
  
  // Extract crash rate with various patterns
  const crashRatePatterns = [
    /Crash Rate:?\s*\??\s*([\d.]+)%/i,
    /Crash Rate:?\s*\??\s*([\d.]+)\s*%/i,
    /Crash Rate\s*\n\s*([\d.]+)%/i,
    /([\d.]+)%\s*crash rate/i,
    /crash rate of ([\d.]+)%/i
  ];
  
  for (const pattern of crashRatePatterns) {
    const match = normalizedInput.match(pattern);
    if (match && match[1]) {
      result.technical.crashRate.value = parseFloat(match[1]);
      console.log('Extracted crash rate:', result.technical.crashRate.value);
      break;
    }
  }
  
  // Try to extract percentile information
  const percentilePatterns = [
    /(\d+)(?:th|st|nd|rd) percentile/i,
    /crash rate.*?(\d+)(?:th|st|nd|rd) percentile/i,
    /crashes.*?(\d+)(?:th|st|nd|rd) percentile/i,
    /percentile\s*\n\s*(\d+)(?:th|st|nd|rd)/i
  ];
  
  for (const pattern of percentilePatterns) {
    const match = normalizedInput.match(pattern);
    if (match && match[1]) {
      result.technical.crashRate.percentile = match[1];
      console.log('Extracted crash rate percentile:', result.technical.crashRate.percentile);
      break;
    }
  }
  
  // Look for crash information in the benchmarks section
  const benchmarkSection = normalizedInput.match(/Benchmarks[\s\S]*?Crash Rate[\s\S]*?Your crash rate of ([\d.]+)%[\s\S]*?([\d]+)(?:th|st|nd|rd)/i);
  if (benchmarkSection) {
    if (benchmarkSection[1] && !result.technical.crashRate.value) {
      result.technical.crashRate.value = parseFloat(benchmarkSection[1]);
      console.log('Extracted crash rate from benchmark section:', result.technical.crashRate.value);
    }
    
    if (benchmarkSection[2] && !result.technical.crashRate.percentile) {
      result.technical.crashRate.percentile = benchmarkSection[2];
      console.log('Extracted crash rate percentile from benchmark section:', result.technical.crashRate.percentile);
    }
  }

  return result;
};
