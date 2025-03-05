
/**
 * Extractor for technical-related metrics
 */
import { ProcessedAnalytics } from "../../types";

/**
 * Extract technical metrics from raw input
 */
export const extractTechnicalMetrics = (rawInput: string, result: Partial<ProcessedAnalytics>) => {
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
