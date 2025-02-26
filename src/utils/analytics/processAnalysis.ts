
import { formatValue } from "./metrics";

export interface ProcessedAnalytics {
  summary: {
    title: string;
    dateRange: string;
    executiveSummary: string;
  };
  acquisition: {
    impressions: { value: number; change: number };
    pageViews: { value: number; change: number };
    conversionRate: { value: number; change: number };
    downloads: { value: number; change: number };
    funnelMetrics: {
      impressionsToViews: number;
      viewsToDownloads: number;
    };
  };
  financial: {
    proceeds: { value: number; change: number };
    proceedsPerUser: { value: number; change: number };
    derivedMetrics: {
      arpd: number;
      revenuePerImpression: number;
      monetizationEfficiency: number;
      payingUserPercentage: number;
    };
  };
  engagement: {
    sessionsPerDevice: { value: number; change: number };
    retention: {
      day1: { value: number; benchmark: number };
      day7: { value: number; benchmark: number };
      day14?: { value: number; benchmark: number };
      day28?: { value: number; benchmark: number };
    };
  };
  technical: {
    crashes: { value: number; change: number };
    crashRate: { value: number; percentile: string };
  };
  geographical: {
    markets: Array<{
      country: string;
      percentage: number;
      downloads: number;
    }>;
    devices: Array<{
      type: string;
      percentage: number;
      count: number;
    }>;
  };
}

export const processAnalysisText = (text: string): ProcessedAnalytics => {
  try {
    // Initialize the result object
    const result: ProcessedAnalytics = {
      summary: { title: "", dateRange: "", executiveSummary: "" },
      acquisition: {
        impressions: { value: 0, change: 0 },
        pageViews: { value: 0, change: 0 },
        conversionRate: { value: 0, change: 0 },
        downloads: { value: 0, change: 0 },
        funnelMetrics: {
          impressionsToViews: 0,
          viewsToDownloads: 0,
        },
      },
      financial: {
        proceeds: { value: 0, change: 0 },
        proceedsPerUser: { value: 0, change: 0 },
        derivedMetrics: {
          arpd: 0,
          revenuePerImpression: 0,
          monetizationEfficiency: 0,
          payingUserPercentage: 0,
        },
      },
      engagement: {
        sessionsPerDevice: { value: 0, change: 0 },
        retention: {
          day1: { value: 0, benchmark: 0 },
          day7: { value: 0, benchmark: 0 },
        },
      },
      technical: {
        crashes: { value: 0, change: 0 },
        crashRate: { value: 0, percentile: "" },
      },
      geographical: {
        markets: [],
        devices: [],
      },
    };

    // Helper function to extract numbers and percentages
    const extractNumberAndChange = (text: string): { value: number; change: number } => {
      const numberMatch = text.match(/([\d,]+(?:\.\d+)?)/);
      const changeMatch = text.match(/([+-]\d+(?:\.\d+)?%)/);
      
      return {
        value: numberMatch ? parseFloat(numberMatch[1].replace(/,/g, "")) : 0,
        change: changeMatch ? parseFloat(changeMatch[1]) : 0,
      };
    };

    // Extract title and date range
    const titleMatch = text.match(/Monthly Performance Report: (.*?)(?:\n|$)/);
    const dateRangeMatch = text.match(/Date Range: (.*?)(?:\n|$)/);
    if (titleMatch) result.summary.title = titleMatch[1].trim();
    if (dateRangeMatch) result.summary.dateRange = dateRangeMatch[1].trim();

    // Extract executive summary
    const summaryMatch = text.match(/Executive Summary\n(.*?)(?=\n\n)/s);
    if (summaryMatch) result.summary.executiveSummary = summaryMatch[1].trim();

    // Extract acquisition metrics
    const impressionsMatch = text.match(/Impressions.*?(\d+,?\d*)\s*\(([-+]\d+%)\)/);
    if (impressionsMatch) {
      result.acquisition.impressions = extractNumberAndChange(impressionsMatch[0]);
    }

    // Extract page views
    const pageViewsMatch = text.match(/Product Page Views.*?(\d+,?\d*)\s*\(([-+]\d+%)\)/);
    if (pageViewsMatch) {
      result.acquisition.pageViews = extractNumberAndChange(pageViewsMatch[0]);
    }

    // Extract funnel metrics
    const funnelMatch = text.match(/Impressions to Product Page Views Rate.*?(\d+\.?\d*)%/);
    if (funnelMatch) {
      result.acquisition.funnelMetrics.impressionsToViews = parseFloat(funnelMatch[1]);
    }

    // Extract geographical data
    const marketsSection = text.match(/Top Markets by Downloads:(.*?)(?=\n\n)/s);
    if (marketsSection) {
      const marketLines = marketsSection[1].match(/[^:\n]+([\d.]+)%\s*\((\d+)\)/g) || [];
      result.geographical.markets = marketLines.map(line => {
        const [country, percentage, downloads] = line.match(/([^:]+):\s*([\d.]+)%\s*\((\d+)\)/)?.slice(1) || [];
        return {
          country: country.trim(),
          percentage: parseFloat(percentage),
          downloads: parseInt(downloads),
        };
      });
    }

    // Extract device distribution
    const devicesSection = text.match(/Device Distribution:(.*?)(?=\n\n)/s);
    if (devicesSection) {
      const deviceLines = devicesSection[1].match(/[^:\n]+([\d.]+)%\s*\((\d+)\)/g) || [];
      result.geographical.devices = deviceLines.map(line => {
        const [type, percentage, count] = line.match(/([^:]+):\s*([\d.]+)%\s*\((\d+)\)/)?.slice(1) || [];
        return {
          type: type.trim(),
          percentage: parseFloat(percentage),
          count: parseInt(count),
        };
      });
    }

    console.log('Processed Analysis Data:', result);
    return result;
  } catch (error) {
    console.error('Error processing analysis text:', error);
    throw new Error('Failed to process analysis text');
  }
};

export const formatMetric = (value: number, type: 'percentage' | 'currency' | 'number' = 'number'): string => {
  if (type === 'percentage') {
    return `${value.toFixed(1)}%`;
  } else if (type === 'currency') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  } else {
    return formatValue(value);
  }
};
