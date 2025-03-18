
/**
 * Extractor for technical-related metrics
 */
import { ProcessedAnalytics } from "../../types";

/**
 * Extract technical metrics from raw input
 */
export const extractTechnicalMetrics = (rawInput: any, result: Partial<ProcessedAnalytics>) => {
  // Ensure rawInput is a string before attempting to use match
  if (typeof rawInput !== 'string') {
    console.log('Input to extractTechnicalMetrics is not a string:', typeof rawInput);
    return result;
  }
  
  // Extract crashes
  const crashesMatch = rawInput.match(/Crashes:?\s*\??\s*([0-9,.]+)\s*([+-][0-9]+%)/i);
  if (crashesMatch) {
    result.technical!.crashes = {
      value: parseFloat(crashesMatch[1]),
      change: parseInt(crashesMatch[2])
    };
    console.log('Extracted crashes:', result.technical!.crashes);
  }

  return result;
};
