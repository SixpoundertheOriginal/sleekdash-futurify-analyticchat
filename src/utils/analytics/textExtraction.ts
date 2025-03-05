
import { ProcessedAnalytics } from "./types";

/**
 * Extract title and date range from analysis text
 */
export const extractSummaryInfo = (text: string): Pick<ProcessedAnalytics["summary"], "title" | "dateRange"> => {
  const titleMatch = text.match(/Monthly Performance Report: (.*?)(?:\n|$)/);
  const dateRangeMatch = text.match(/Date Range: (.*?)(?:\n|$)/);
  
  return {
    title: titleMatch ? titleMatch[1].trim() : "",
    dateRange: dateRangeMatch ? dateRangeMatch[1].trim() : ""
  };
};

/**
 * Extract executive summary from analysis text
 */
export const extractExecutiveSummary = (text: string): string => {
  const summaryMatch = text.match(/Executive Summary\n(.*?)(?=\n\n)/s);
  return summaryMatch ? summaryMatch[1].trim() : "";
};

/**
 * Helper function to extract numbers and percentages from text
 */
export const extractNumberAndChange = (text: string): { value: number; change: number } => {
  const numberMatch = text.match(/(\d+(?:,\d{3})*(?:\.\d+)?)/);
  const changeMatch = text.match(/\(([+-]\d+(?:\.\d+)?)\%\)/);
  
  return {
    value: numberMatch ? parseFloat(numberMatch[1].replace(/,/g, "")) : 0,
    change: changeMatch ? parseFloat(changeMatch[1]) : 0,
  };
};

/**
 * Extract acquisition metrics from analysis text
 */
export const extractAcquisitionMetrics = (text: string): ProcessedAnalytics["acquisition"] => {
  const result: ProcessedAnalytics["acquisition"] = {
    impressions: { value: 0, change: 0 },
    pageViews: { value: 0, change: 0 },
    conversionRate: { value: 0, change: 0 },
    downloads: { value: 0, change: 0 },
    funnelMetrics: {
      impressionsToViews: 0,
      viewsToDownloads: 0,
    },
  };

  const acquisitionSection = text.match(/User Acquisition Metrics(.*?)(?=###)/s);
  if (!acquisitionSection) return result;
  
  const metrics = acquisitionSection[1];

  // Extract impressions
  const impressionsMatch = metrics.match(/Impressions:\s*([\d,]+)\s*\(([+-]\d+)%\)/);
  if (impressionsMatch) {
    result.impressions = {
      value: parseInt(impressionsMatch[1].replace(/,/g, '')),
      change: parseInt(impressionsMatch[2])
    };
  }

  // Extract page views
  const pageViewsMatch = metrics.match(/Product Page Views:\s*([\d,]+)\s*\(([+-]\d+)%\)/);
  if (pageViewsMatch) {
    result.pageViews = {
      value: parseInt(pageViewsMatch[1].replace(/,/g, '')),
      change: parseInt(pageViewsMatch[2])
    };
  }

  // Extract conversion rate
  const conversionMatch = metrics.match(/Conversion Rate:\s*([\d.]+)%\s*\(([+-]\d+)%\)/);
  if (conversionMatch) {
    result.conversionRate = {
      value: parseFloat(conversionMatch[1]),
      change: parseInt(conversionMatch[2])
    };
  }

  // Extract downloads
  const downloadsMatch = metrics.match(/Total Downloads:\s*([\d,]+)\s*\(([+-]\d+)%\)/);
  if (downloadsMatch) {
    result.downloads = {
      value: parseInt(downloadsMatch[1].replace(/,/g, '')),
      change: parseInt(downloadsMatch[2])
    };
  }

  // Calculate funnel metrics if we have the necessary data
  if (result.impressions.value > 0 && result.pageViews.value > 0 && result.downloads.value > 0) {
    result.funnelMetrics = {
      impressionsToViews: (result.pageViews.value / result.impressions.value) * 100,
      viewsToDownloads: (result.downloads.value / result.pageViews.value) * 100
    };
  }

  return result;
};

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

/**
 * Extract engagement metrics from analysis text
 */
export const extractEngagementMetrics = (text: string): ProcessedAnalytics["engagement"] => {
  const result: ProcessedAnalytics["engagement"] = {
    sessionsPerDevice: { value: 0, change: 0 },
    retention: {
      day1: { value: 0, benchmark: 0 },
      day7: { value: 0, benchmark: 0 }
    }
  };

  const engagementSection = text.match(/User Engagement & Retention(.*?)(?=###)/s);
  if (!engagementSection) return result;
  
  const metrics = engagementSection[1];

  // Extract sessions per device
  const sessionsMatch = metrics.match(/Sessions per Active Device:\s*([\d.]+)\s*\(([+-]\d+)%\)/);
  if (sessionsMatch) {
    result.sessionsPerDevice = {
      value: parseFloat(sessionsMatch[1]),
      change: parseInt(sessionsMatch[2])
    };
  }

  // Extract retention metrics
  const day1Match = metrics.match(/Day 1 Retention.*?(\d+(?:\.\d+)?)\%.*?(\d+(?:\.\d+)?)\%/);
  if (day1Match) {
    result.retention.day1 = {
      value: parseFloat(day1Match[1]),
      benchmark: parseFloat(day1Match[2])
    };
  }

  const day7Match = metrics.match(/Day 7 Retention.*?(\d+(?:\.\d+)?)\%.*?(\d+(?:\.\d+)?)\%/);
  if (day7Match) {
    result.retention.day7 = {
      value: parseFloat(day7Match[1]),
      benchmark: parseFloat(day7Match[2])
    };
  }

  const day14Match = metrics.match(/Day 14 Retention.*?(\d+(?:\.\d+)?)\%.*?(\d+(?:\.\d+)?)\%/);
  if (day14Match) {
    result.retention.day14 = {
      value: parseFloat(day14Match[1]),
      benchmark: parseFloat(day14Match[2])
    };
  }

  const day28Match = metrics.match(/Day 28 Retention.*?(\d+(?:\.\d+)?)\%.*?(\d+(?:\.\d+)?)\%/);
  if (day28Match) {
    result.retention.day28 = {
      value: parseFloat(day28Match[1]),
      benchmark: parseFloat(day28Match[2])
    };
  }

  return result;
};

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

/**
 * Extract geographical data from analysis text
 */
export const extractGeographicalData = (text: string): ProcessedAnalytics["geographical"] => {
  const result: ProcessedAnalytics["geographical"] = {
    markets: [],
    devices: []
  };

  try {
    // Extract markets data
    const marketsSection = text.match(/Top Markets by Downloads:(.*?)(?=\n\n)/s);
    
    if (marketsSection && marketsSection[1]) {
      const marketLines = marketsSection[1].match(/[^:\n]+([\d.]+)%\s*\((\d+)\)/g) || [];
      
      result.markets = marketLines.map(line => {
        try {
          const match = line.match(/([^:]+):\s*([\d.]+)%\s*\((\d+)\)/);
          if (!match) {
            return {
              country: 'Unknown',
              percentage: 0,
              downloads: 0
            };
          }
          
          return {
            country: match[1]?.trim() || 'Unknown',
            percentage: match[2] ? parseFloat(match[2]) : 0,
            downloads: match[3] ? parseInt(match[3], 10) : 0
          };
        } catch (err) {
          return {
            country: 'Unknown',
            percentage: 0,
            downloads: 0
          };
        }
      });
    }

    // Extract device distribution
    const devicesSection = text.match(/Device Distribution:(.*?)(?=\n\n)/s);
    
    if (devicesSection && devicesSection[1]) {
      const deviceLines = devicesSection[1].match(/[^:\n]+([\d.]+)%\s*\((\d+)\)/g) || [];
      
      result.devices = deviceLines.map(line => {
        try {
          const match = line.match(/([^:]+):\s*([\d.]+)%\s*\((\d+)\)/);
          if (!match) {
            return {
              type: 'Unknown',
              percentage: 0,
              count: 0
            };
          }
          
          return {
            type: match[1]?.trim() || 'Unknown',
            percentage: match[2] ? parseFloat(match[2]) : 0,
            count: match[3] ? parseInt(match[3], 10) : 0
          };
        } catch (err) {
          return {
            type: 'Unknown',
            percentage: 0,
            count: 0
          };
        }
      });
    }
  } catch (err) {
    console.error('Error processing geographical data:', err);
  }

  return result;
};
