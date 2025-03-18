
/**
 * Extractor for date range information
 */
import { ProcessedAnalytics } from "../../types";

/**
 * Extract date range information from raw input
 */
export const extractDateRange = (rawInput: any, result: Partial<ProcessedAnalytics>) => {
  // Ensure rawInput is a string before attempting to use match
  if (typeof rawInput !== 'string') {
    console.log('Input to extractDateRange is not a string:', typeof rawInput);
    return result;
  }
  
  // Normalize input - trim whitespace and standardize newlines
  const normalizedInput = rawInput.replace(/\r\n/g, '\n').trim();
  
  // Initialize summary object if it doesn't exist
  result.summary = result.summary || {
    title: "",
    dateRange: "",
    executiveSummary: ""
  };
  
  // Look for date range in benchmarks section first - this often has a clear date format
  const benchmarkDateMatch = normalizedInput.match(/Benchmarks\s*\n\s*([A-Za-z]+ \d{1,2}-[A-Za-z]+ \d{1,2},? \d{4})/i);
  if (benchmarkDateMatch && benchmarkDateMatch[1]) {
    result.summary.dateRange = benchmarkDateMatch[1].trim();
    console.log('Extracted date range from benchmarks:', result.summary.dateRange);
    return result;
  }
  
  // Try to match standard date range formats with month names
  const dateRangeMatch = normalizedInput.match(/([A-Za-z]+ \d{1,2}[-–]\w+ \d{1,2},? \d{4})/i) || 
                          normalizedInput.match(/Date Range:?\s*(.+?)(?:\n|$)/i);
                         
  if (dateRangeMatch && dateRangeMatch[1]) {
    result.summary.dateRange = dateRangeMatch[1].trim();
    console.log('Extracted date range:', result.summary.dateRange);
  }
  
  // If no date found yet, look for header date in App Store Connect format
  if (!result.summary.dateRange) {
    const headerDateMatch = normalizedInput.match(/Analytics\s+Trends[\s\S]*?([A-Za-z]+ \d{1,2} - [A-Za-z]+ \d{1,2}, \d{4})/i);
    if (headerDateMatch && headerDateMatch[1]) {
      result.summary.dateRange = headerDateMatch[1].trim();
      console.log('Extracted date range from header:', result.summary.dateRange);
    }
  }
  
  // Extract app title if present
  const titleMatch = normalizedInput.match(/([A-Za-z0-9\s&|]+)\s*\n\s*Overview/i);
  if (titleMatch && titleMatch[1]) {
    result.summary.title = titleMatch[1].trim();
    console.log('Extracted app title:', result.summary.title);
  }
  
  return result;
};
