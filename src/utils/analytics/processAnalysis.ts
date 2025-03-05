
import { ProcessedAnalytics } from "./types";
import { formatMetric } from "./formatting";
import {
  extractSummaryInfo,
  extractExecutiveSummary,
  extractAcquisitionMetrics,
  extractFinancialMetrics,
  extractEngagementMetrics,
  extractTechnicalMetrics,
  extractGeographicalData
} from "./extraction";

export { formatMetric };
export type { ProcessedAnalytics };

/**
 * Process analysis text to extract structured analytics data
 */
export const processAnalysisText = (text: string): ProcessedAnalytics => {
  try {
    console.log('Starting text analysis with input:', {
      length: text.length,
      preview: text.substring(0, 100)
    });

    // Extract summary information
    console.log('Extracting title and date range...');
    const summaryInfo = extractSummaryInfo(text);
    
    // Extract executive summary
    console.log('Extracting executive summary...');
    const executiveSummary = extractExecutiveSummary(text);
    console.log('Found executive summary:', {
      length: executiveSummary.length,
      preview: executiveSummary.substring(0, 50) + '...'
    });

    // Process acquisition metrics
    console.log('Processing acquisition metrics...');
    const acquisition = extractAcquisitionMetrics(text);

    // Process financial metrics
    console.log('Processing financial metrics...');
    const financial = extractFinancialMetrics(text);

    // Process engagement metrics
    console.log('Processing engagement metrics...');
    const engagement = extractEngagementMetrics(text);

    // Process technical metrics
    console.log('Processing technical metrics...');
    const technical = extractTechnicalMetrics(text);

    // Process geographical data
    console.log('Processing geographical data...');
    const geographical = extractGeographicalData(text);

    // Log the extracted metrics for debugging
    console.log('Extracted acquisition metrics:', acquisition);
    console.log('Extracted financial metrics:', financial);
    console.log('Extracted engagement metrics:', engagement);
    console.log('Extracted technical metrics:', technical);

    // Extract direct values for key metrics from the text
    // (additional parsing to ensure we catch values that might be missed by extractors)
    const extractNumberWithChange = (regexp: RegExp): { value: number, change: number } | null => {
      const match = text.match(regexp);
      if (match && match[1] && match[2]) {
        return {
          value: parseFloat(match[1].replace(/,/g, '')),
          change: parseFloat(match[2])
        };
      }
      return null;
    };
    
    // Try to extract specific metrics directly from the text
    const downloadsMatch = extractNumberWithChange(/downloads:?\s*([\d,]+)\s*\(\+?(-?\d+(?:\.\d+)?)%\)/i) ||
                           extractNumberWithChange(/total downloads:?\s*([\d,]+)\s*\(\+?(-?\d+(?:\.\d+)?)%\)/i);
    
    const proceedsMatch = extractNumberWithChange(/proceeds:?\s*\$?([\d,]+)\s*\(\+?(-?\d+(?:\.\d+)?)%\)/i) ||
                          extractNumberWithChange(/revenue:?\s*\$?([\d,]+)\s*\(\+?(-?\d+(?:\.\d+)?)%\)/i);
    
    const impressionsMatch = extractNumberWithChange(/impressions:?\s*([\d,]+)\s*\(\+?(-?\d+(?:\.\d+)?)%\)/i);
    
    const crashesMatch = extractNumberWithChange(/crashes:?\s*([\d,]+)\s*\(\+?(-?\d+(?:\.\d+)?)%\)/i) ||
                         extractNumberWithChange(/crash:?\s*increased by\s*(\d+(?:\.\d+)?)%/i);
    
    const conversionMatch = extractNumberWithChange(/conversion rate:?\s*([\d.]+)%\s*\((-?\d+(?:\.\d+)?)%\)/i);
    
    // Override extracted values with direct matches from text if available
    if (downloadsMatch && downloadsMatch.value > 0) {
      console.log('Override: Found downloads in text:', downloadsMatch);
      acquisition.downloads = downloadsMatch;
    }
    
    if (proceedsMatch && proceedsMatch.value > 0) {
      console.log('Override: Found proceeds in text:', proceedsMatch);
      financial.proceeds = proceedsMatch;
    }
    
    if (impressionsMatch && impressionsMatch.value > 0) {
      console.log('Override: Found impressions in text:', impressionsMatch);
      acquisition.impressions = impressionsMatch;
    }
    
    if (crashesMatch && crashesMatch.value > 0) {
      console.log('Override: Found crashes in text:', crashesMatch);
      technical.crashes = crashesMatch;
    }
    
    if (conversionMatch && conversionMatch.value > 0) {
      console.log('Override: Found conversion rate in text:', conversionMatch);
      acquisition.conversionRate = conversionMatch;
    }

    // Assemble the complete result
    const result: ProcessedAnalytics = {
      summary: {
        title: summaryInfo.title || "App Analytics Report",
        dateRange: summaryInfo.dateRange || "Not specified",
        executiveSummary
      },
      acquisition,
      financial,
      engagement,
      technical,
      geographical
    };

    console.log('Analysis processing complete. Final result:', result);
    return result;
  } catch (error) {
    console.error('Error in processAnalysisText:', error);
    throw error;
  }
};
