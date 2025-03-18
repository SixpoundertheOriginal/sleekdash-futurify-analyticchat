
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
  
  // Array of different date range patterns to try
  const dateRangePatterns = [
    // Look for date range in benchmarks section first - this often has a clear date format
    /Benchmarks\s*\n\s*([A-Za-z]+ \d{1,2}-[A-Za-z]+ \d{1,2},? \d{4})/i,
    
    // Standard date range formats with month names
    /([A-Za-z]+ \d{1,2}[-–]\w+ \d{1,2},? \d{4})/i,
    
    // Date Range label
    /Date Range:?\s*(.+?)(?:\n|$)/i,
    
    // App Store Connect format in header
    /Analytics\s+Trends[\s\S]*?([A-Za-z]+ \d{1,2} - [A-Za-z]+ \d{1,2}, \d{4})/i,
    
    // Format: Month Day-Month Day, Year
    /([A-Za-z]+ \d{1,2} ?[-–] ?[A-Za-z]+ \d{1,2},? \d{4})/i,
    
    // Format: Month Day to Month Day, Year
    /([A-Za-z]+ \d{1,2} to [A-Za-z]+ \d{1,2},? \d{4})/i,
    
    // Format with period keyword
    /period:?\s*([A-Za-z]+ \d{1,2}.*?\d{4})/i,
    
    // ISO date format ranges
    /(\d{4}-\d{2}-\d{2})\s*to\s*(\d{4}-\d{2}-\d{2})/i,
    
    // Simple MM/DD/YYYY format
    /(\d{1,2}\/\d{1,2}\/\d{4})\s*(?:to|-)\s*(\d{1,2}\/\d{1,2}\/\d{4})/i
  ];
  
  // Try each pattern and use the first one that works
  for (const pattern of dateRangePatterns) {
    const match = normalizedInput.match(pattern);
    if (match && match[1]) {
      if (pattern.toString().includes('(\\d{4}-\\d{2}-\\d{2})') && match[2]) {
        // Handle ISO date ranges specifically
        result.summary.dateRange = `${match[1]} to ${match[2]}`;
      } else if (pattern.toString().includes('(\\d{1,2}\\/\\d{1,2}\\/\\d{4})') && match[2]) {
        // Handle MM/DD/YYYY ranges specifically
        result.summary.dateRange = `${match[1]} to ${match[2]}`;
      } else {
        result.summary.dateRange = match[1].trim();
      }
      console.log('Extracted date range:', result.summary.dateRange);
      break;
    }
  }
  
  // If still no date found, look for any text that might contain dates
  if (!result.summary.dateRange) {
    const dateTextMatch = normalizedInput.match(/(?:during|for|from|in) ([A-Za-z]+(?:\s+\d{1,2})?(?:\s*[-–]\s*[A-Za-z]+(?:\s+\d{1,2})?)?,?\s+\d{4})/i);
    if (dateTextMatch && dateTextMatch[1]) {
      result.summary.dateRange = dateTextMatch[1].trim();
      console.log('Extracted possible date range from context:', result.summary.dateRange);
    }
  }
  
  // Extract app title if present
  const titlePatterns = [
    /([A-Za-z0-9\s&|]+)\s*\n\s*Overview/i,
    /App:?\s*([A-Za-z0-9\s&|]+)/i,
    /App Name:?\s*([A-Za-z0-9\s&|]+)/i,
    /Report for:?\s*([A-Za-z0-9\s&|]+)/i,
    /Analytics for:?\s*([A-Za-z0-9\s&|]+)/i
  ];
  
  for (const pattern of titlePatterns) {
    const match = normalizedInput.match(pattern);
    if (match && match[1]) {
      result.summary.title = match[1].trim();
      console.log('Extracted app title:', result.summary.title);
      break;
    }
  }
  
  return result;
};
