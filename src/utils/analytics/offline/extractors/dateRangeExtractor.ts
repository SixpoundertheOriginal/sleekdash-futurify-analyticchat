
/**
 * Extractor for date range information
 */
import { ProcessedAnalytics } from "../../types";

/**
 * Extract date range from raw input
 */
export const extractDateRange = (rawInput: string, result: Partial<ProcessedAnalytics>) => {
  // Ensure rawInput is a string before attempting to use match
  if (typeof rawInput !== 'string') {
    console.log('Input to extractDateRange is not a string:', typeof rawInput);
    return result;
  }
  
  // Initialize summary object if it doesn't exist
  result.summary = result.summary || {
    title: "App Analytics",
    dateRange: "",
    executiveSummary: ""
  };
  
  // Try multiple date range patterns to increase extraction success rate
  const dateRangePatterns = [
    /([A-Za-z]+ \d{1,2}[-–]\w+ \d{1,2},? \d{4})/i,
    /Date Range:?\s*(.+?)(?:\n|$)/i,
    /([A-Za-z]+ \d{1,2} ?[-–] ?[A-Za-z]+ \d{1,2},? \d{4})/i,
    /([A-Za-z]+ \d{1,2} to [A-Za-z]+ \d{1,2},? \d{4})/i,
    /period:?\s*(.+?)(?:\n|$)/i,
    /Time frame:?\s*(.+?)(?:\n|$)/i
  ];
  
  for (const pattern of dateRangePatterns) {
    const match = rawInput.match(pattern);
    if (match && match[1]) {
      result.summary.dateRange = match[1].trim();
      console.log('Extracted date range:', result.summary.dateRange);
      break;
    }
  }

  return result;
};
