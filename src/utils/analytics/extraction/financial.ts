
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

  console.log('Searching for financial/monetization section...');
  const financialSection = text.match(/(?:Financial Performance|Monetization)(.*?)(?=###|Engagement|Acquisition|Retention|Technical|Recommendations)/s);
  if (!financialSection) {
    console.log('Financial section not found, using whole text');
    // If no specific section, search the whole text
    // Proceeds
    const proceedsMatch = text.match(/Proceeds:?\s*\$?([\d,]+)\s*\(([+-]\d+)%\)/i);
    if (proceedsMatch) {
      result.proceeds = {
        value: parseInt(proceedsMatch[1].replace(/,/g, '')),
        change: parseInt(proceedsMatch[2])
      };
      console.log('Found proceeds:', result.proceeds);
    }

    // Proceeds per user
    const proceedsPerUserMatch = text.match(/Proceeds per (?:Paying )?User:?\s*\$?([\d.]+)\s*\(([+-]\d+(?:\.\d+)?)%\)/i);
    if (proceedsPerUserMatch) {
      result.proceedsPerUser = {
        value: parseFloat(proceedsPerUserMatch[1]),
        change: parseFloat(proceedsPerUserMatch[2])
      };
      console.log('Found proceeds per user:', result.proceedsPerUser);
    }
  } else {
    console.log('Found financial section');
    const metrics = financialSection[1];

    // Proceeds
    const proceedsMatch = metrics.match(/Proceeds:?\s*\$?([\d,]+)\s*\(([+-]\d+)%\)/i);
    if (proceedsMatch) {
      result.proceeds = {
        value: parseInt(proceedsMatch[1].replace(/,/g, '')),
        change: parseInt(proceedsMatch[2])
      };
      console.log('Found proceeds:', result.proceeds);
    }

    // Proceeds per user
    const proceedsPerUserMatch = metrics.match(/Proceeds per (?:Paying )?User:?\s*\$?([\d.]+)\s*\(([+-]\d+(?:\.\d+)?)%\)/i);
    if (proceedsPerUserMatch) {
      result.proceedsPerUser = {
        value: parseFloat(proceedsPerUserMatch[1]),
        change: parseFloat(proceedsPerUserMatch[2])
      };
      console.log('Found proceeds per user:', result.proceedsPerUser);
    }
  }

  // Calculate derived metrics if we have proceeds data
  if (result.proceeds.value > 0) {
    // If we have downloads data (imported from the acquisition metrics), calculate ARPD
    const downloadsMatch = text.match(/(?:Total Downloads|Downloads):?\s*([\d,]+)/i);
    if (downloadsMatch) {
      const downloads = parseInt(downloadsMatch[1].replace(/,/g, ''));
      if (downloads > 0) {
        result.derivedMetrics.arpd = result.proceeds.value / downloads;
        console.log('Calculated ARPD:', result.derivedMetrics.arpd);
      }
    }
  }

  return result;
};
