
import { benchmarkPatterns } from "./extractors.ts";
import { cleanText } from "./data-cleaning.ts";

/**
 * Extract benchmark data from analytics text
 * @param text The text to extract benchmarks from
 * @returns Object containing benchmark data
 */
export function extractBenchmarks(text: string): Record<string, any> {
  const cleanedText = cleanText(text);
  const benchmarks: Record<string, any> = {};
  
  // Process benchmark section
  const benchmarkSection = cleanedText.match(/Benchmarks[\s\S]*?Performance[\s\S]*?(?=App Store Connect|$)/i);
  if (!benchmarkSection) {
    console.log("No benchmark section found");
    return benchmarks;
  }
  
  const sectionText = benchmarkSection[0];
  
  // Extract conversion rate benchmark
  const convRateMatch = sectionText.match(benchmarkPatterns.conversionRate.pattern);
  if (convRateMatch) {
    benchmarks.conversionRate = {
      value: parseFloat(convRateMatch[1]),
      percentile: {
        range: `${convRateMatch[2]}-${convRateMatch[3]}`
      }
    };
    
    // Extract percentile values
    for (const [key, pattern] of Object.entries(benchmarkPatterns.conversionRate.percentiles)) {
      const match = sectionText.match(pattern);
      if (match && match[1]) {
        if (!benchmarks.conversionRate.percentile) {
          benchmarks.conversionRate.percentile = {};
        }
        benchmarks.conversionRate.percentile[key] = parseFloat(match[1]);
      }
    }
  }
  
  // Extract proceeds per user benchmark
  const proceedsMatch = sectionText.match(benchmarkPatterns.proceedsPerUser.pattern);
  if (proceedsMatch) {
    benchmarks.proceedsPerUser = {
      value: parseFloat(proceedsMatch[1]),
      position: proceedsMatch[2] // "above", "below", or "between"
    };
    
    // Extract percentile values
    for (const [key, pattern] of Object.entries(benchmarkPatterns.proceedsPerUser.percentiles)) {
      const match = sectionText.match(pattern);
      if (match && match[1]) {
        if (!benchmarks.proceedsPerUser.percentile) {
          benchmarks.proceedsPerUser.percentile = {};
        }
        benchmarks.proceedsPerUser.percentile[key] = parseFloat(match[1]);
      }
    }
  }
  
  // Extract crash rate benchmark
  const crashRateMatch = sectionText.match(benchmarkPatterns.crashRate.pattern);
  if (crashRateMatch) {
    benchmarks.crashRate = {
      value: parseFloat(crashRateMatch[1]),
      position: crashRateMatch[2] // "above", "below", or "between"
    };
    
    // Extract percentile values
    for (const [key, pattern] of Object.entries(benchmarkPatterns.crashRate.percentiles)) {
      const match = sectionText.match(pattern);
      if (match && match[1]) {
        if (!benchmarks.crashRate.percentile) {
          benchmarks.crashRate.percentile = {};
        }
        benchmarks.crashRate.percentile[key] = parseFloat(match[1]);
      }
    }
  }
  
  // Add retention benchmarks from retention patterns
  // This is handled in the extraction of retention data to avoid duplication
  
  return benchmarks;
}
