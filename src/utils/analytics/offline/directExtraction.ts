
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
export const extractBaseMetrics = (rawInput: any): Partial<ProcessedAnalytics> => {
  return extractDirectMetrics(rawInput);
};

/**
 * Extract key metrics directly from raw App Store data input
 * This provides immediate visualization data even before OpenAI processing
 */
export const extractDirectMetrics = (rawInput: any): Partial<ProcessedAnalytics> => {
  console.log('Performing direct extraction from raw input of type:', typeof rawInput);
  
  try {
    // Handle different input types
    let textInput: string;
    
    if (typeof rawInput === 'string') {
      textInput = rawInput;
    } else if (rawInput && typeof rawInput === 'object') {
      // If it's an object, look for common properties with text content
      if (rawInput.rawContent) {
        textInput = rawInput.rawContent;
      } else if (rawInput.text || rawInput.content) {
        textInput = rawInput.text || rawInput.content;
      } else {
        // Try to stringify the object as a fallback
        try {
          textInput = JSON.stringify(rawInput);
        } catch (e) {
          console.warn('Failed to stringify input object:', e);
          textInput = '';
        }
      }
    } else {
      // Convert to string as a last resort
      textInput = String(rawInput || '');
    }
    
    // Log the first 200 characters to help with debugging
    console.log('Extracting from text (first 200 chars):', textInput.substring(0, 200));
    
    // Initialize the metrics structure with default values
    const result = createBaseMetricsStructure();
    
    // Only proceed with extraction if we have meaningful text
    if (textInput.trim().length === 0) {
      console.warn('Empty text input for extraction, returning empty structure');
      return result;
    }
    
    // Extract date range information
    extractDateRange(textInput, result);
    
    // Extract metrics by category
    extractAcquisitionMetrics(textInput, result);
    extractFinancialMetrics(textInput, result);
    extractEngagementMetrics(textInput, result);
    extractTechnicalMetrics(textInput, result);
    extractGeographicalData(textInput, result);
    
    // Calculate derived metrics based on extracted data
    calculateDerivedMetrics(result);
    
    // Log extraction results
    console.log('Extraction completed, metrics found:', JSON.stringify({
      acquisition: result.acquisition ? Object.keys(result.acquisition).length : 0,
      financial: result.financial ? Object.keys(result.financial).length : 0,
      engagement: result.engagement ? Object.keys(result.engagement).length : 0,
      technical: result.technical ? Object.keys(result.technical).length : 0
    }));

    return result;
  } catch (error) {
    console.error('Error during direct extraction:', error);
    // Return the base structure if extraction fails
    return createBaseMetricsStructure();
  }
};

// Re-export the validator function
export { hasValidMetricsForVisualization };
