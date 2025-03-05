
// Date range extraction functionality
import { datePatterns } from './extractors';

/**
 * Extract date range from analysis text
 * @param text The text to extract the date range from
 * @returns The extracted date range or null if not found
 */
export function extractDateRange(text: string): string | null {
  console.log("Extracting date range...");
  
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
