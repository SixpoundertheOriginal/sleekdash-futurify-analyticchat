
/**
 * Offline processing utilities to reduce dependency on OpenAI API
 * Provides local metric extraction and message formatting capabilities
 */

import { extractMetricsLocally, processContentWithFallback } from "@/utils/message-content";
import { 
  MetricType, 
  MetricCategory,
  standardizeMetricNames,
  getMetricCategory 
} from "./offline/metricTypes";
import { formatMetric } from "./offline/formatters";
import { detectContentType, formatMessageOffline } from "./offline/contentDetector";
import { extractKeywordMetrics } from "./offline/keywordExtractor";
import { 
  extractDirectMetrics, 
  extractBaseMetrics,
  hasValidMetricsForVisualization
} from "./offline/directExtraction";

export type { MetricType, MetricCategory };
export { 
  standardizeMetricNames,
  getMetricCategory,
  formatMetric,
  detectContentType,
  formatMessageOffline,
  extractKeywordMetrics,
  extractDirectMetrics,
  extractBaseMetrics,
  hasValidMetricsForVisualization
};

/**
 * Process metrics data with OpenAI fallback
 * @param content The text content to extract metrics from
 * @param openAiProcessor Function to process with OpenAI API
 * @returns Processed metrics with fallback to local extraction
 */
export const processMetricsWithFallback = async (
  content: string,
  openAiProcessor?: (content: string) => Promise<Record<string, any>>
): Promise<Record<string, any>> => {
  // First try direct extraction for immediate results
  const directResults = extractDirectMetrics(content);
  
  // If we have good results from direct extraction, we can use them
  if (hasValidMetricsForVisualization(directResults)) {
    console.log('[OfflineProcessing] Using direct extraction results:', directResults);
    return directResults as Record<string, any>;
  }
  
  // If OpenAI processor is provided, use it with fallback
  if (openAiProcessor) {
    return await processContentWithFallback(content, openAiProcessor);
  }
  
  // Otherwise, just use local extraction
  return extractMetricsLocally(content);
};
