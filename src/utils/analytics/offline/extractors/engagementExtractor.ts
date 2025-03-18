
/**
 * Extractor for engagement-related metrics
 */
import { ProcessedAnalytics } from "../../types";

/**
 * Extract engagement metrics from raw input
 */
export const extractEngagementMetrics = (rawInput: any, result: Partial<ProcessedAnalytics>) => {
  // Ensure rawInput is a string before attempting to use match
  if (typeof rawInput !== 'string') {
    console.log('Input to extractEngagementMetrics is not a string:', typeof rawInput);
    return result;
  }
  
  // Normalize input - trim whitespace and standardize newlines
  const normalizedInput = rawInput.replace(/\r\n/g, '\n').trim();
  
  // Initialize engagement object if it doesn't exist
  result.engagement = result.engagement || {
    sessionsPerDevice: { value: 0, change: 0 },
    retention: {
      day1: { value: 0, benchmark: 0 },
      day7: { value: 0, benchmark: 0 }
    }
  };
  
  // Extract sessions per device - improved pattern with question mark and "Daily Average" prefix
  let sessionsMatch = normalizedInput.match(/(?:Daily Average\s*\n)?Sessions per (?:Active )?Device:?\s*\??\s*([0-9,.]+)\s*([+-][0-9.]+%)/i);
  
  // If not found, try alternate format without change percentage
  if (!sessionsMatch) {
    sessionsMatch = normalizedInput.match(/(?:Daily Average\s*\n)?Sessions per (?:Active )?Device:?\s*\??\s*([0-9,.]+)/i);
  }
  
  if (sessionsMatch) {
    result.engagement.sessionsPerDevice = {
      value: parseFloat(sessionsMatch[1]),
      change: sessionsMatch[2] ? parseFloat(sessionsMatch[2]) : 0
    };
    console.log('Extracted sessions per device:', result.engagement.sessionsPerDevice);
  }

  // Extract retention data - look for Average Retention section
  const retentionSection = normalizedInput.match(/Average Retention[\s\S]*?(?=Total Downloads by|$)/i);
  if (retentionSection) {
    // Day 1 retention
    const day1RetentionMatch = normalizedInput.match(/Day 1[\s\S]*?(\d+(?:\.\d+)?)%/i);
    if (day1RetentionMatch) {
      result.engagement.retention.day1.value = parseFloat(day1RetentionMatch[1]);
      console.log('Extracted day 1 retention:', result.engagement.retention.day1.value);
    }

    // Day 7 retention
    const day7RetentionMatch = normalizedInput.match(/Day 7[\s\S]*?(\d+(?:\.\d+)?)%/i);
    if (day7RetentionMatch) {
      result.engagement.retention.day7.value = parseFloat(day7RetentionMatch[1]);
      console.log('Extracted day 7 retention:', result.engagement.retention.day7.value);
    }
    
    // Day 14 and 28 retention if they exist
    const day14RetentionMatch = normalizedInput.match(/Day 14[\s\S]*?(\d+(?:\.\d+)?)%/i);
    if (day14RetentionMatch) {
      // Add day14 if it doesn't exist
      if (!result.engagement.retention.day14) {
        result.engagement.retention.day14 = { value: 0, benchmark: 0 };
      }
      result.engagement.retention.day14.value = parseFloat(day14RetentionMatch[1]);
      console.log('Extracted day 14 retention:', result.engagement.retention.day14.value);
    }
    
    const day28RetentionMatch = normalizedInput.match(/Day 28[\s\S]*?(\d+(?:\.\d+)?)%/i);
    if (day28RetentionMatch) {
      // Add day28 if it doesn't exist
      if (!result.engagement.retention.day28) {
        result.engagement.retention.day28 = { value: 0, benchmark: 0 };
      }
      result.engagement.retention.day28.value = parseFloat(day28RetentionMatch[1]);
      console.log('Extracted day 28 retention:', result.engagement.retention.day28.value);
    }
  }
  
  // Check for benchmark information in the Benchmarks section
  const benchmarkSection = normalizedInput.match(/Benchmarks[\s\S]*?Retention/i);
  if (benchmarkSection) {
    // Day 1 retention benchmark
    const day1BenchmarkMatch = normalizedInput.match(/Day 1 Retention[\s\S]*?Your day 1 retention rate of ([0-9.]+)%[\s\S]*?25th[\s\S]*?~([0-9.]+)%/i);
    if (day1BenchmarkMatch) {
      result.engagement.retention.day1.value = parseFloat(day1BenchmarkMatch[1]);
      result.engagement.retention.day1.benchmark = parseFloat(day1BenchmarkMatch[2]);
      console.log('Extracted day 1 retention from benchmark:', result.engagement.retention.day1);
    }
    
    // Day 7 retention benchmark
    const day7BenchmarkMatch = normalizedInput.match(/Day 7 Retention[\s\S]*?Your day 7 retention rate of ([0-9.]+)%[\s\S]*?25th[\s\S]*?~([0-9.]+)%/i);
    if (day7BenchmarkMatch) {
      result.engagement.retention.day7.value = parseFloat(day7BenchmarkMatch[1]);
      result.engagement.retention.day7.benchmark = parseFloat(day7BenchmarkMatch[2]);
      console.log('Extracted day 7 retention from benchmark:', result.engagement.retention.day7);
    }
    
    // Day 28 retention benchmark
    const day28BenchmarkMatch = normalizedInput.match(/Day 28 Retention[\s\S]*?Your day 28 retention rate of ([0-9.]+)%[\s\S]*?25th[\s\S]*?~([0-9.]+)%/i);
    if (day28BenchmarkMatch) {
      if (!result.engagement.retention.day28) {
        result.engagement.retention.day28 = { value: 0, benchmark: 0 };
      }
      result.engagement.retention.day28.value = parseFloat(day28BenchmarkMatch[1]);
      result.engagement.retention.day28.benchmark = parseFloat(day28BenchmarkMatch[2]);
      console.log('Extracted day 28 retention from benchmark:', result.engagement.retention.day28);
    }
  }

  return result;
};
