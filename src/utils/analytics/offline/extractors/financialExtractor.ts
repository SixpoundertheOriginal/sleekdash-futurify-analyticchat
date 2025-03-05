
/**
 * Extractor for financial-related metrics
 */
import { ProcessedAnalytics } from "../../types";
import { normalizeValue } from "../normalization";

/**
 * Extract financial metrics from raw input
 */
export const extractFinancialMetrics = (rawInput: string, result: Partial<ProcessedAnalytics>) => {
  // Extract proceeds
  const proceedsMatch = rawInput.match(/Proceeds:?\s*\??\s*\$?([0-9,.KM]+)\s*([+-][0-9]+%)/i);
  if (proceedsMatch) {
    result.financial!.proceeds = {
      value: normalizeValue(proceedsMatch[1]),
      change: parseInt(proceedsMatch[2])
    };
    console.log('Extracted proceeds:', result.financial!.proceeds);
  }

  // Extract proceeds per user
  const proceedsPerUserMatch = rawInput.match(/Proceeds per (?:Paying )?User:?\s*\??\s*\$?([0-9,.]+)\s*([+-][0-9]+%)/i);
  if (proceedsPerUserMatch) {
    result.financial!.proceedsPerUser = {
      value: parseFloat(proceedsPerUserMatch[1]),
      change: parseInt(proceedsPerUserMatch[2])
    };
    console.log('Extracted proceeds per user:', result.financial!.proceedsPerUser);
  }

  return result;
};
