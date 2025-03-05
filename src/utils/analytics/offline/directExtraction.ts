/**
 * Direct extraction utilities for getting KPIs from raw app store data
 * without relying on OpenAI analysis
 */

import { ProcessedAnalytics } from "../types";
import { normalizeValue } from "../metricTypes";

/**
 * Extract basic metrics from text input
 * This is used for immediate extraction of metrics from user input
 */
export const extractBaseMetrics = (rawInput: string): Partial<ProcessedAnalytics> => {
  return extractDirectMetrics(rawInput);
};

/**
 * Extract key metrics directly from raw App Store data input
 * This provides immediate visualization data even before OpenAI processing
 */
export const extractDirectMetrics = (rawInput: string): Partial<ProcessedAnalytics> => {
  console.log('Performing direct extraction from raw input');
  
  // Initialize the structure with null/empty values
  const result: Partial<ProcessedAnalytics> = {
    summary: {
      title: "App Analytics Report",
      dateRange: "Not specified",
      executiveSummary: ""
    },
    acquisition: {
      impressions: { value: 0, change: 0 },
      pageViews: { value: 0, change: 0 },
      conversionRate: { value: 0, change: 0 },
      downloads: { value: 0, change: 0 },
      funnelMetrics: {
        impressionsToViews: 0,
        viewsToDownloads: 0
      }
    },
    financial: {
      proceeds: { value: 0, change: 0 },
      proceedsPerUser: { value: 0, change: 0 },
      derivedMetrics: {
        arpd: 0,
        revenuePerImpression: 0,
        monetizationEfficiency: 0,
        payingUserPercentage: 0
      }
    },
    engagement: {
      sessionsPerDevice: { value: 0, change: 0 },
      retention: {
        day1: { value: 0, benchmark: 0 },
        day7: { value: 0, benchmark: 0 },
        day14: { value: 0, benchmark: 0 }
      }
    },
    technical: {
      crashes: { value: 0, change: 0 },
      crashRate: { value: 0, percentile: "average" }
    },
    geographical: {
      markets: [],
      devices: []
    }
  };

  try {
    // Extract date range
    const dateRangeMatch = rawInput.match(/([A-Za-z]+ \d{1,2}[-–]\w+ \d{1,2},? \d{4})/i) || 
                           rawInput.match(/Date Range:?\s*(.+?)(?:\n|$)/i);
    if (dateRangeMatch && dateRangeMatch[1]) {
      result.summary!.dateRange = dateRangeMatch[1].trim();
      console.log('Extracted date range:', result.summary!.dateRange);
    }

    // Extract acquisition metrics
    const impressionsMatch = rawInput.match(/Impressions:?\s*\??\s*([0-9,.KM]+)\s*([+-][0-9]+%)/i);
    if (impressionsMatch) {
      result.acquisition!.impressions = {
        value: normalizeValue(impressionsMatch[1]),
        change: parseInt(impressionsMatch[2])
      };
      console.log('Extracted impressions:', result.acquisition!.impressions);
    }

    const pageViewsMatch = rawInput.match(/(?:Product )?Page Views:?\s*\??\s*([0-9,.KM]+)\s*([+-][0-9]+%)/i);
    if (pageViewsMatch) {
      result.acquisition!.pageViews = {
        value: normalizeValue(pageViewsMatch[1]),
        change: parseInt(pageViewsMatch[2])
      };
      console.log('Extracted page views:', result.acquisition!.pageViews);
    }

    const conversionRateMatch = rawInput.match(/Conversion Rate:?\s*\??\s*([0-9,.]+%)\s*([+-][0-9]+%)/i);
    if (conversionRateMatch) {
      result.acquisition!.conversionRate = {
        value: parseFloat(conversionRateMatch[1]),
        change: parseInt(conversionRateMatch[2])
      };
      console.log('Extracted conversion rate:', result.acquisition!.conversionRate);
    }

    const downloadsMatch = rawInput.match(/(?:Total )?Downloads:?\s*\??\s*([0-9,.KM]+)\s*([+-][0-9]+%)/i);
    if (downloadsMatch) {
      result.acquisition!.downloads = {
        value: normalizeValue(downloadsMatch[1]),
        change: parseInt(downloadsMatch[2])
      };
      console.log('Extracted downloads:', result.acquisition!.downloads);
    }

    // Extract financial metrics
    const proceedsMatch = rawInput.match(/Proceeds:?\s*\??\s*\$?([0-9,.KM]+)\s*([+-][0-9]+%)/i);
    if (proceedsMatch) {
      result.financial!.proceeds = {
        value: normalizeValue(proceedsMatch[1]),
        change: parseInt(proceedsMatch[2])
      };
      console.log('Extracted proceeds:', result.financial!.proceeds);
    }

    const proceedsPerUserMatch = rawInput.match(/Proceeds per (?:Paying )?User:?\s*\??\s*\$?([0-9,.]+)\s*([+-][0-9]+%)/i);
    if (proceedsPerUserMatch) {
      result.financial!.proceedsPerUser = {
        value: parseFloat(proceedsPerUserMatch[1]),
        change: parseInt(proceedsPerUserMatch[2])
      };
      console.log('Extracted proceeds per user:', result.financial!.proceedsPerUser);
    }

    // Extract engagement metrics
    const sessionsMatch = rawInput.match(/Sessions per Active Device:?\s*\??\s*([0-9,.]+)\s*([+-][0-9]+%)/i);
    if (sessionsMatch) {
      result.engagement!.sessionsPerDevice = {
        value: parseFloat(sessionsMatch[1]),
        change: parseInt(sessionsMatch[2])
      };
      console.log('Extracted sessions per device:', result.engagement!.sessionsPerDevice);
    }

    // Extract technical metrics
    const crashesMatch = rawInput.match(/Crashes:?\s*\??\s*([0-9,.]+)\s*([+-][0-9]+%)/i);
    if (crashesMatch) {
      result.technical!.crashes = {
        value: parseFloat(crashesMatch[1]),
        change: parseInt(crashesMatch[2])
      };
      console.log('Extracted crashes:', result.technical!.crashes);
    }

    // Extract retention data if available
    const day1RetentionMatch = rawInput.match(/Day 1 retention.*?(\d+\.\d+)%/i);
    if (day1RetentionMatch) {
      result.engagement!.retention.day1.value = parseFloat(day1RetentionMatch[1]);
      // Try to get benchmark
      const day1BenchmarkMatch = rawInput.match(/Day 1.*?25th.*?~(\d+\.\d+)%/i);
      if (day1BenchmarkMatch) {
        result.engagement!.retention.day1.benchmark = parseFloat(day1BenchmarkMatch[1]);
      }
    }

    const day7RetentionMatch = rawInput.match(/Day 7 retention.*?(\d+\.\d+)%/i);
    if (day7RetentionMatch) {
      result.engagement!.retention.day7.value = parseFloat(day7RetentionMatch[1]);
      // Try to get benchmark
      const day7BenchmarkMatch = rawInput.match(/Day 7.*?25th.*?~(\d+\.\d+)%/i);
      if (day7BenchmarkMatch) {
        result.engagement!.retention.day7.benchmark = parseFloat(day7BenchmarkMatch[1]);
      }
    }

    // Extract geographical data if available
    const territorySection = rawInput.match(/Total Downloads by Territory[\s\S]*?See All([\s\S]*?)(?=Total Downloads by|$)/i);
    if (territorySection && territorySection[1]) {
      const territories = territorySection[1].split('\n').filter(line => line.trim());
      const markets = [];
      
      for (const territory of territories) {
        const match = territory.match(/([A-Za-z\s]+)\s+([0-9,]+)(?:\s+([0-9.]+%)?)?/);
        if (match) {
          markets.push({
            country: match[1].trim(),
            downloads: parseInt(match[2].replace(/,/g, '')),
            percentage: match[3] ? parseFloat(match[3]) : 0
          });
        }
      }
      
      if (markets.length > 0) {
        result.geographical!.markets = markets;
        console.log(`Extracted ${markets.length} territories`);
      }
    }

    // Extract device data if available
    const deviceSection = rawInput.match(/Total Downloads by Device[\s\S]*?See All([\s\S]*?)(?=Total Downloads|$)/i);
    if (deviceSection && deviceSection[1]) {
      const deviceLines = deviceSection[1].split('\n').filter(line => line.trim());
      const devices = [];
      
      for (const line of deviceLines) {
        const match = line.match(/([A-Za-z\s]+)\s+([0-9.]+%)\s+([0-9,]+)/);
        if (match) {
          devices.push({
            type: match[1].trim(),
            count: parseInt(match[3].replace(/,/g, '')),
            percentage: parseFloat(match[2])
          });
        }
      }
      
      if (devices.length > 0) {
        result.geographical!.devices = devices;
        console.log(`Extracted ${devices.length} devices`);
      }
    }

    // Calculate derived metrics if we have enough data
    if (result.acquisition!.downloads.value > 0 && result.financial!.proceeds.value > 0) {
      result.financial!.derivedMetrics.arpd = result.financial!.proceeds.value / result.acquisition!.downloads.value;
      console.log('Calculated ARPD:', result.financial!.derivedMetrics.arpd);
    }

    if (result.acquisition!.pageViews.value > 0 && result.acquisition!.impressions.value > 0) {
      result.acquisition!.funnelMetrics.impressionsToViews = 
        (result.acquisition!.pageViews.value / result.acquisition!.impressions.value) * 100;
      console.log('Calculated impressions to views:', result.acquisition!.funnelMetrics.impressionsToViews);
    }

    if (result.acquisition!.downloads.value > 0 && result.acquisition!.pageViews.value > 0) {
      result.acquisition!.funnelMetrics.viewsToDownloads = 
        (result.acquisition!.downloads.value / result.acquisition!.pageViews.value) * 100;
      console.log('Calculated views to downloads:', result.acquisition!.funnelMetrics.viewsToDownloads);
    }

    return result;
  } catch (error) {
    console.error('Error during direct extraction:', error);
    return result;
  }
};

/**
 * Check if the metrics contain enough valid data for visualization
 */
export const hasValidMetricsForVisualization = (metrics: Partial<ProcessedAnalytics>): boolean => {
  // Check if we have at least acquisition or financial data
  const hasAcquisitionData = 
    (metrics.acquisition?.downloads?.value || 0) > 0 || 
    (metrics.acquisition?.impressions?.value || 0) > 0;
    
  const hasFinancialData = (metrics.financial?.proceeds?.value || 0) > 0;
  
  return hasAcquisitionData || hasFinancialData;
};
