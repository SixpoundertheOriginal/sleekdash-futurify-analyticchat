
/**
 * Extractor for engagement-related metrics
 */
import { ProcessedAnalytics } from "../../types";

/**
 * Extract engagement metrics from raw input
 */
export const extractEngagementMetrics = (rawInput: string, result: Partial<ProcessedAnalytics>) => {
  // Extract sessions per device
  const sessionsMatch = rawInput.match(/Sessions per Active Device:?\s*\??\s*([0-9,.]+)\s*([+-][0-9]+%)/i);
  if (sessionsMatch) {
    result.engagement!.sessionsPerDevice = {
      value: parseFloat(sessionsMatch[1]),
      change: parseInt(sessionsMatch[2])
    };
    console.log('Extracted sessions per device:', result.engagement!.sessionsPerDevice);
  }

  // Extract day 1 retention
  const day1RetentionMatch = rawInput.match(/Day 1 retention.*?(\d+\.\d+)%/i);
  if (day1RetentionMatch) {
    result.engagement!.retention.day1.value = parseFloat(day1RetentionMatch[1]);
    // Try to get benchmark
    const day1BenchmarkMatch = rawInput.match(/Day 1.*?25th.*?~(\d+\.\d+)%/i);
    if (day1BenchmarkMatch) {
      result.engagement!.retention.day1.benchmark = parseFloat(day1BenchmarkMatch[1]);
    }
  }

  // Extract day 7 retention
  const day7RetentionMatch = rawInput.match(/Day 7 retention.*?(\d+\.\d+)%/i);
  if (day7RetentionMatch) {
    result.engagement!.retention.day7.value = parseFloat(day7RetentionMatch[1]);
    // Try to get benchmark
    const day7BenchmarkMatch = rawInput.match(/Day 7.*?25th.*?~(\d+\.\d+)%/i);
    if (day7BenchmarkMatch) {
      result.engagement!.retention.day7.benchmark = parseFloat(day7BenchmarkMatch[1]);
    }
  }

  return result;
};
