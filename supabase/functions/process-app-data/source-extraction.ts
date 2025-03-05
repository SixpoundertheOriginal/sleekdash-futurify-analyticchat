
import { sourcePatterns } from "./extractors.ts";

/**
 * Extract source distribution data from analytics text
 * @param text The text to extract source data from
 * @returns Array of source distribution data
 */
export function extractSourceData(text: string): Array<{ source: string, percentage: number, downloads: number }> {
  const sourceData: Array<{ source: string, percentage: number, downloads: number }> = [];
  
  // Find source distribution section
  const sourceSection = text.match(sourcePatterns.pattern);
  if (!sourceSection || !sourceSection[1]) {
    console.log("No source distribution section found");
    return sourceData;
  }
  
  // Parse each line in the source section
  const lines = sourceSection[1].split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    const match = line.match(sourcePatterns.itemPattern);
    if (match) {
      const source = match[1].trim();
      const percentageStr = match[2].replace('%', '').trim();
      const downloadsStr = match[3].replace(/,/g, '').trim();
      
      sourceData.push({
        source: source,
        percentage: parseFloat(percentageStr),
        downloads: parseInt(downloadsStr)
      });
    }
  }
  
  return sourceData;
}
