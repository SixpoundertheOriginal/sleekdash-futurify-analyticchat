
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
  
  const dateRangeMatch = rawInput.match(/([A-Za-z]+ \d{1,2}[-–]\w+ \d{1,2},? \d{4})/i) || 
                         rawInput.match(/Date Range:?\s*(.+?)(?:\n|$)/i);
                         
  if (dateRangeMatch && dateRangeMatch[1]) {
    result.summary!.dateRange = dateRangeMatch[1].trim();
    console.log('Extracted date range:', result.summary!.dateRange);
  }
  
  return result;
};
