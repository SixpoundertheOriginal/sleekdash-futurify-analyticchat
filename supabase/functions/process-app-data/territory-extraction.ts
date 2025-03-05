
import { territoryPatterns } from "./extractors.ts";

/**
 * Extract territory distribution data from analytics text
 * @param text The text to extract territory data from
 * @returns Array of territory distribution data
 */
export function extractTerritoryData(text: string): Array<{ country: string, downloads: number }> {
  const territoryData: Array<{ country: string, downloads: number }> = [];
  
  // Find territory distribution section
  const territorySection = text.match(territoryPatterns.pattern);
  if (!territorySection || !territorySection[1]) {
    console.log("No territory distribution section found");
    return territoryData;
  }
  
  // Parse each line in the territory section
  const lines = territorySection[1].split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    const match = line.match(territoryPatterns.itemPattern);
    if (match) {
      const country = match[1].trim();
      const downloadsStr = match[2].replace(/,/g, '').trim();
      
      territoryData.push({
        country: country,
        downloads: parseInt(downloadsStr)
      });
    }
  }
  
  return territoryData;
}
