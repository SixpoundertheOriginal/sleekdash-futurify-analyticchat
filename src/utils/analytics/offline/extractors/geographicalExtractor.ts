
/**
 * Extractor for geographical distribution data
 */
import { ProcessedAnalytics } from "../../types";

/**
 * Extract geographical distribution data from raw input
 */
export const extractGeographicalData = (rawInput: any, result: Partial<ProcessedAnalytics>) => {
  // Ensure rawInput is a string before attempting to use match
  if (typeof rawInput !== 'string') {
    console.log('Input to extractGeographicalData is not a string:', typeof rawInput);
    return result;
  }
  
  // Extract territory data
  const territorySection = rawInput.match(/Total Downloads by Territory[\s\S]*?See All([\s\S]*?)(?=Total Downloads by|$)/i);
  if (territorySection && territorySection[1]) {
    const territories = territorySection[1].split('\n').filter(line => line.trim());
    const markets = [];
    
    for (const territory of territories) {
      const match = territory.match(/([A-Za-z\s]+)\s+([0-9,]+)(?:\s+([0-9.]+%)?)?/);
      if (match) {
        markets.push({
          country: match[1].trim(),
          downloads: parseInt(match[2].replace(/,/g, '')),
          percentage: match[3] ? parseFloat(match[3]) : 0
        });
      }
    }
    
    if (markets.length > 0) {
      result.geographical!.markets = markets;
      console.log(`Extracted ${markets.length} territories`);
    }
  }

  // Extract device data
  const deviceSection = rawInput.match(/Total Downloads by Device[\s\S]*?See All([\s\S]*?)(?=Total Downloads|$)/i);
  if (deviceSection && deviceSection[1]) {
    const deviceLines = deviceSection[1].split('\n').filter(line => line.trim());
    const devices = [];
    
    for (const line of deviceLines) {
      const match = line.match(/([A-Za-z\s]+)\s+([0-9.]+%)\s+([0-9,]+)/);
      if (match) {
        devices.push({
          type: match[1].trim(),
          count: parseInt(match[3].replace(/,/g, '')),
          percentage: parseFloat(match[2])
        });
      }
    }
    
    if (devices.length > 0) {
      result.geographical!.devices = devices;
      console.log(`Extracted ${devices.length} devices`);
    }
  }

  return result;
};
