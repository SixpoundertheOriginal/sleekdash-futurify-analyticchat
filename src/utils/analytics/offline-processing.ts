/**
 * Offline processing utilities to reduce dependency on OpenAI API
 * Provides local metric extraction and message formatting capabilities
 */

import { extractMetricsLocally, processContentWithFallback } from "@/utils/message-content-utils";
import { MetricType, standardizeMetricNames } from "./offline/metricTypes";
import { formatMetric } from "./offline/formatters";
import { detectContentType, formatMessageOffline } from "./offline/contentDetector";
import { extractKeywordMetrics } from "./offline/keywordExtractor";

export type { MetricType };
export { 
  standardizeMetricNames,
  formatMetric,
  detectContentType,
  formatMessageOffline,
  extractKeywordMetrics
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
  // If OpenAI processor is provided, use it with fallback
  if (openAiProcessor) {
    return await processContentWithFallback(content, openAiProcessor);
  }
  
  // Otherwise, just use local extraction
  return extractMetricsLocally(content);
};
