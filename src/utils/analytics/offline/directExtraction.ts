
/**
 * Direct extraction utilities for getting KPIs from raw app store data
 * without relying on OpenAI analysis
 */

import { ProcessedAnalytics } from "../types";
import { normalizeValue } from "./normalization";
import { hasValidMetricsForVisualization } from "./metricsValidator";
import { createBaseMetricsStructure } from "./baseMetricsStructure";
import { extractAcquisitionMetrics } from "./extractors/acquisitionExtractor";
import { extractFinancialMetrics } from "./extractors/financialExtractor";
import { extractEngagementMetrics } from "./extractors/engagementExtractor";
import { extractTechnicalMetrics } from "./extractors/technicalExtractor";
import { extractGeographicalData } from "./extractors/geographicalExtractor";
import { calculateDerivedMetrics } from "./extractors/derivedMetricsCalculator";
import { extractDateRange } from "./extractors/dateRangeExtractor";

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
  
  try {
    // Initialize the metrics structure with default values
    const result = createBaseMetricsStructure();
    
    // Extract date range information
    extractDateRange(rawInput, result);
    
    // Extract metrics by category
    extractAcquisitionMetrics(rawInput, result);
    extractFinancialMetrics(rawInput, result);
    extractEngagementMetrics(rawInput, result);
    extractTechnicalMetrics(rawInput, result);
    extractGeographicalData(rawInput, result);
    
    // Calculate derived metrics based on extracted data
    calculateDerivedMetrics(result);

    return result;
  } catch (error) {
    console.error('Error during direct extraction:', error);
    // Return the base structure if extraction fails
    return createBaseMetricsStructure();
  }
};

// Re-export the validator function
export { hasValidMetricsForVisualization };
