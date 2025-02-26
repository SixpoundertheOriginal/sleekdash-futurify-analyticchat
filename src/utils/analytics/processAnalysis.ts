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
    console.log('Starting text analysis with input:', {
      length: text.length,
      preview: text.substring(0, 100)
    });

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

    // Extract title and date range
    console.log('Extracting title and date range...');
    const titleMatch = text.match(/Monthly Performance Report: (.*?)(?:\n|$)/);
    const dateRangeMatch = text.match(/Date Range: (.*?)(?:\n|$)/);
    
    if (titleMatch) {
      result.summary.title = titleMatch[1].trim();
      console.log('Found title:', result.summary.title);
    } else {
      console.warn('No title match found in text');
    }
    
    if (dateRangeMatch) {
      result.summary.dateRange = dateRangeMatch[1].trim();
      console.log('Found date range:', result.summary.dateRange);
    } else {
      console.warn('No date range match found in text');
    }

    // Extract executive summary
    console.log('Extracting executive summary...');
    const summaryMatch = text.match(/Executive Summary\n(.*?)(?=\n\n)/s);
    if (summaryMatch) {
      result.summary.executiveSummary = summaryMatch[1].trim();
      console.log('Found executive summary:', {
        length: result.summary.executiveSummary.length,
        preview: result.summary.executiveSummary.substring(0, 50) + '...'
      });
    } else {
      console.warn('No executive summary match found');
    }

    // Helper function to extract numbers and percentages
    const extractNumberAndChange = (text: string): { value: number; change: number } => {
      const numberMatch = text.match(/(\d+(?:,\d{3})*(?:\.\d+)?)/);
      const changeMatch = text.match(/\(([+-]\d+(?:\.\d+)?)\%\)/);
      
      const result = {
        value: numberMatch ? parseFloat(numberMatch[1].replace(/,/g, "")) : 0,
        change: changeMatch ? parseFloat(changeMatch[1]) : 0,
      };

      console.log('Extracted number and change:', { input: text, result });
      return result;
    };

    // Extract acquisition metrics
    console.log('Processing acquisition metrics...');
    const acquisitionMetrics = text.match(/User Acquisition Metrics(.*?)(?=###)/s);
    if (acquisitionMetrics) {
      const metrics = acquisitionMetrics[1];
      console.log('Found acquisition metrics section:', {
        length: metrics.length,
        preview: metrics.substring(0, 100)
      });

      // Extract impressions
      const impressionsMatch = metrics.match(/Impressions:\s*([\d,]+)\s*\(([+-]\d+)%\)/);
      if (impressionsMatch) {
        result.acquisition.impressions = {
          value: parseInt(impressionsMatch[1].replace(/,/g, '')),
          change: parseInt(impressionsMatch[2])
        };
      }

      // Extract page views
      const pageViewsMatch = metrics.match(/Product Page Views:\s*([\d,]+)\s*\(([+-]\d+)%\)/);
      if (pageViewsMatch) {
        result.acquisition.pageViews = {
          value: parseInt(pageViewsMatch[1].replace(/,/g, '')),
          change: parseInt(pageViewsMatch[2])
        };
      }

      // Extract conversion rate
      const conversionMatch = metrics.match(/Conversion Rate:\s*([\d.]+)%\s*\(([+-]\d+)%\)/);
      if (conversionMatch) {
        result.acquisition.conversionRate = {
          value: parseFloat(conversionMatch[1]),
          change: parseInt(conversionMatch[2])
        };
      }

      // Extract downloads
      const downloadsMatch = metrics.match(/Total Downloads:\s*([\d,]+)\s*\(([+-]\d+)%\)/);
      if (downloadsMatch) {
        result.acquisition.downloads = {
          value: parseInt(downloadsMatch[1].replace(/,/g, '')),
          change: parseInt(downloadsMatch[2])
        };
      }
    } else {
      console.warn('No acquisition metrics section found');
    }

    // Extract financial metrics
    const financialSection = text.match(/Financial Performance(.*?)(?=###)/s);
    if (financialSection) {
      const metrics = financialSection[1];

      // Extract proceeds
      const proceedsMatch = metrics.match(/Proceeds:\s*\$?([\d,]+)\s*\(([+-]\d+)%\)/);
      if (proceedsMatch) {
        result.financial.proceeds = {
          value: parseInt(proceedsMatch[1].replace(/,/g, '')),
          change: parseInt(proceedsMatch[2])
        };
      }

      // Extract proceeds per user
      const proceedsPerUserMatch = metrics.match(/Proceeds per Paying User:\s*\$?([\d.]+)\s*\(([+-]\d+(?:\.\d+)?)%\)/);
      if (proceedsPerUserMatch) {
        result.financial.proceedsPerUser = {
          value: parseFloat(proceedsPerUserMatch[1]),
          change: parseFloat(proceedsPerUserMatch[2])
        };
      }

      // Extract derived metrics
      const arpdMatch = metrics.match(/ARPD.*?(\d+\.?\d*)/);
      if (arpdMatch) {
        result.financial.derivedMetrics.arpd = parseFloat(arpdMatch[1]);
      }
    }

    // Extract engagement metrics
    const engagementSection = text.match(/User Engagement & Retention(.*?)(?=###)/s);
    if (engagementSection) {
      const metrics = engagementSection[1];

      // Extract sessions per device
      const sessionsMatch = metrics.match(/Sessions per Active Device:\s*([\d.]+)\s*\(([+-]\d+)%\)/);
      if (sessionsMatch) {
        result.engagement.sessionsPerDevice = {
          value: parseFloat(sessionsMatch[1]),
          change: parseInt(sessionsMatch[2])
        };
      }

      // Extract retention metrics
      const day1Match = metrics.match(/Day 1 Retention.*?(\d+(?:\.\d+)?)\%.*?(\d+(?:\.\d+)?)\%/);
      if (day1Match) {
        result.engagement.retention.day1 = {
          value: parseFloat(day1Match[1]),
          benchmark: parseFloat(day1Match[2])
        };
      }

      const day7Match = metrics.match(/Day 7 Retention.*?(\d+(?:\.\d+)?)\%.*?(\d+(?:\.\d+)?)\%/);
      if (day7Match) {
        result.engagement.retention.day7 = {
          value: parseFloat(day7Match[1]),
          benchmark: parseFloat(day7Match[2])
        };
      }
    }

    // Extract technical metrics
    const technicalSection = text.match(/Technical Performance(.*?)(?=###)/s);
    if (technicalSection) {
      const metrics = technicalSection[1];

      // Extract crash count
      const crashMatch = metrics.match(/Crash Count:\s*(\d+)\s*\(([+-]\d+)%\)/);
      if (crashMatch) {
        result.technical.crashes = {
          value: parseInt(crashMatch[1]),
          change: parseInt(crashMatch[2])
        };
      }

      // Extract crash rate
      const crashRateMatch = metrics.match(/Crash Rate:\s*([\d.]+)%/);
      const percentileMatch = metrics.match(/(\d+)(?:th|st|nd|rd) percentile/);
      if (crashRateMatch) {
        result.technical.crashRate = {
          value: parseFloat(crashRateMatch[1]),
          percentile: percentileMatch ? percentileMatch[1] : '50th'
        };
      }
    }

    // Extract geographical data with safer parsing
    try {
      console.log('Processing geographical data...');
      const marketsSection = text.match(/Top Markets by Downloads:(.*?)(?=\n\n)/s);
      
      if (marketsSection && marketsSection[1]) {
        console.log('Found markets section:', marketsSection[1].trim());
        const marketLines = marketsSection[1].match(/[^:\n]+([\d.]+)%\s*\((\d+)\)/g) || [];
        
        result.geographical.markets = marketLines.map(line => {
          try {
            const match = line.match(/([^:]+):\s*([\d.]+)%\s*\((\d+)\)/);
            if (!match) {
              console.warn('Invalid market line format:', line);
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
            console.warn('Error processing market line:', { line, error: err });
            return {
              country: 'Unknown',
              percentage: 0,
              downloads: 0
            };
          }
        });
      } else {
        console.warn('No markets section found in analysis text');
      }

      // Extract device distribution with safer parsing
      const devicesSection = text.match(/Device Distribution:(.*?)(?=\n\n)/s);
      
      if (devicesSection && devicesSection[1]) {
        console.log('Found devices section:', devicesSection[1].trim());
        const deviceLines = devicesSection[1].match(/[^:\n]+([\d.]+)%\s*\((\d+)\)/g) || [];
        
        result.geographical.devices = deviceLines.map(line => {
          try {
            const match = line.match(/([^:]+):\s*([\d.]+)%\s*\((\d+)\)/);
            if (!match) {
              console.warn('Invalid device line format:', line);
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
            console.warn('Error processing device line:', { line, error: err });
            return {
              type: 'Unknown',
              percentage: 0,
              count: 0
            };
          }
        });
      } else {
        console.warn('No devices section found in analysis text');
      }
    } catch (err) {
      console.error('Error processing geographical data:', err);
      // Keep the default empty arrays for markets and devices
    }

    console.log('Analysis processing complete. Final result:', result);
    return result;
  } catch (error) {
    console.error('Error in processAnalysisText:', error);
    throw error;
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
