
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
