
import { ProcessedAnalytics } from "../types";

/**
 * Extract financial metrics from analysis text
 */
export const extractFinancialMetrics = (text: string): ProcessedAnalytics["financial"] => {
  const result: ProcessedAnalytics["financial"] = {
    proceeds: { value: 0, change: 0 },
    proceedsPerUser: { value: 0, change: 0 },
    derivedMetrics: {
      arpd: 0,
      revenuePerImpression: 0,
      monetizationEfficiency: 0,
      payingUserPercentage: 0,
    }
  };

  const financialSection = text.match(/Financial Performance(.*?)(?=###)/s);
  if (!financialSection) return result;
  
  const metrics = financialSection[1];

  // Extract proceeds
  const proceedsMatch = metrics.match(/Proceeds:\s*\$?([\d,]+)\s*\(([+-]\d+)%\)/);
  if (proceedsMatch) {
    result.proceeds = {
      value: parseInt(proceedsMatch[1].replace(/,/g, '')),
      change: parseInt(proceedsMatch[2])
    };
  }

  // Extract proceeds per user
  const proceedsPerUserMatch = metrics.match(/Proceeds per Paying User:\s*\$?([\d.]+)\s*\(([+-]\d+(?:\.\d+)?)%\)/);
  if (proceedsPerUserMatch) {
    result.proceedsPerUser = {
      value: parseFloat(proceedsPerUserMatch[1]),
      change: parseFloat(proceedsPerUserMatch[2])
    };
  }

  // Extract ARPD
  const arpdMatch = metrics.match(/ARPD.*?(\d+\.?\d*)/);
  if (arpdMatch) {
    result.derivedMetrics.arpd = parseFloat(arpdMatch[1]);
  }

  return result;
};
