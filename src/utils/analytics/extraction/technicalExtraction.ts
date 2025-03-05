
import { ProcessedAnalytics } from "../types";

/**
 * Extract technical metrics from analysis text
 */
export const extractTechnicalMetrics = (text: string): ProcessedAnalytics["technical"] => {
  const result: ProcessedAnalytics["technical"] = {
    crashes: { value: 0, change: 0 },
    crashRate: { value: 0, percentile: "" }
  };

  const technicalSection = text.match(/Technical Performance(.*?)(?=###)/s);
  if (!technicalSection) return result;
  
  const metrics = technicalSection[1];

  // Extract crash count
  const crashMatch = metrics.match(/Crash Count:\s*(\d+)\s*\(([+-]\d+)%\)/);
  if (crashMatch) {
    result.crashes = {
      value: parseInt(crashMatch[1]),
      change: parseInt(crashMatch[2])
    };
  }

  // Extract crash rate
  const crashRateMatch = metrics.match(/Crash Rate:\s*([\d.]+)%/);
  const percentileMatch = metrics.match(/(\d+)(?:th|st|nd|rd) percentile/);
  if (crashRateMatch) {
    result.crashRate = {
      value: parseFloat(crashRateMatch[1]),
      percentile: percentileMatch ? percentileMatch[1] : '50th'
    };
  }

  return result;
};
