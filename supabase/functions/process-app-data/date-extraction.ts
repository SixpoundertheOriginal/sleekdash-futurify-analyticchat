// Date range extraction functionality
import { datePatterns } from './extractors.ts';

/**
 * Extract date range from analysis text
 * @param text The text to extract the date range from
 * @returns The extracted date range or null if not found
 */
export function extractDateRange(text: string): string | null {
  console.log("Extracting date range...");
  
  // First look for explicit date range format
  const explicitDateRange = text.match(/Date range: ([^\n]+)/i);
  if (explicitDateRange) {
    const dateRange = explicitDateRange[1].trim();
    console.log("Found explicit date range:", dateRange);
    return dateRange;
  }
  
  // Otherwise try the patterns from extractors
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      const dateRange = match[0].includes("Date Range:") ? match[1].trim() : match[0].trim();
      console.log("Found date range:", dateRange);
      return dateRange;
    }
  }
  
  console.log("No date range found");
  return null;
}

/**
 * Extract date range as Date objects from formatted string
 * @param dateRangeStr The date range string (format: YYYY-MM-DD to YYYY-MM-DD)
 * @returns Object with from and to dates, or null if invalid
 */
export function parseDateRange(dateRangeStr: string): { from: Date, to: Date } | null {
  try {
    // Handle different date formats
    const formats = [
      // Format: YYYY-MM-DD to YYYY-MM-DD
      /(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/,
      // Format: MM/DD/YYYY to MM/DD/YYYY
      /(\d{1,2}\/\d{1,2}\/\d{4})\s+to\s+(\d{1,2}\/\d{1,2}\/\d{4})/,
      // Format: Month DD, YYYY to Month DD, YYYY
      /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\s+to\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}/i
    ];
    
    let fromDate, toDate;
    
    for (const format of formats) {
      const match = dateRangeStr.match(format);
      if (match) {
        fromDate = new Date(match[1]);
        toDate = new Date(match[2]);
        break;
      }
    }
    
    if (!fromDate || !toDate || isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      console.error("Invalid date format in:", dateRangeStr);
      return null;
    }
    
    return { from: fromDate, to: toDate };
  } catch (error) {
    console.error("Error parsing date range:", error);
    return null;
  }
}

/**
 * Format date range as a string for storage and display
 * @param from From date
 * @param to To date
 * @returns Formatted date range string
 */
export function formatDateRange(from: Date, to: Date): string {
  try {
    const fromStr = from.toISOString().split('T')[0]; // YYYY-MM-DD
    const toStr = to.toISOString().split('T')[0]; // YYYY-MM-DD
    return `${fromStr} to ${toStr}`;
  } catch (error) {
    console.error("Error formatting date range:", error);
    return "";
  }
}
