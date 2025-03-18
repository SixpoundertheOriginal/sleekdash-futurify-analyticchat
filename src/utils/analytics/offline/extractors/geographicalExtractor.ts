
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
  
  // Normalize input - trim whitespace and standardize newlines
  const normalizedInput = rawInput.replace(/\r\n/g, '\n').trim();
  
  // Initialize geographical object if it doesn't exist
  result.geographical = result.geographical || {
    markets: [],
    devices: [],
    sources: []
  };
  
  // Extract territory data - look for the section and its content
  const territorySectionMatch = normalizedInput.match(/Total Downloads by Territory\s*\n\s*See All\s*\n([\s\S]*?)(?=Total Downloads by|$)/i);
  if (territorySectionMatch && territorySectionMatch[1]) {
    const territoryContent = territorySectionMatch[1].trim();
    const territoryLines = territoryContent.split('\n').filter(line => line.trim());
    
    const markets = [];
    for (const line of territoryLines) {
      // Try to match territory lines in App Store Connect format
      // Format could be "United States" followed by a number (downloads)
      const match = line.match(/([A-Za-z\s&]+)\s*\n?\s*([0-9,]+)/);
      if (match) {
        markets.push({
          country: match[1].trim(),
          downloads: parseInt(match[2].replace(/,/g, '')),
          percentage: 0 // Percentage might not be directly available
        });
      }
    }
    
    if (markets.length > 0) {
      // Calculate percentages based on downloads if not directly available
      const totalDownloads = markets.reduce((sum, market) => sum + market.downloads, 0);
      if (totalDownloads > 0) {
        markets.forEach(market => {
          market.percentage = (market.downloads / totalDownloads) * 100;
        });
      }
      
      result.geographical.markets = markets;
      console.log(`Extracted ${markets.length} territories`);
    }
  }

  // Extract device data - look for the section and its content
  const deviceSectionMatch = normalizedInput.match(/Total Downloads by Device\s*\n\s*See All\s*\n([\s\S]*?)(?=Total Downloads by|$)/i);
  if (deviceSectionMatch && deviceSectionMatch[1]) {
    const deviceContent = deviceSectionMatch[1].trim();
    const deviceLines = deviceContent.split('\n').filter(line => line.trim());
    
    const devices = [];
    for (const line of deviceLines) {
      // Try to match device lines in App Store Connect format
      // Format could be "iPhone" followed by percentage and number of downloads
      const match = line.match(/([A-Za-z\s]+)\s*\n?\s*([0-9.]+%)\s*\n?\s*([0-9,]+)/);
      if (match) {
        devices.push({
          type: match[1].trim(),
          percentage: parseFloat(match[2].replace('%', '')),
          count: parseInt(match[3].replace(/,/g, ''))
        });
      } else {
        // Try alternate format without percentage
        const altMatch = line.match(/([A-Za-z\s]+)\s*\n?\s*([0-9,]+)/);
        if (altMatch) {
          devices.push({
            type: altMatch[1].trim(),
            percentage: 0, // Will calculate later
            count: parseInt(altMatch[2].replace(/,/g, ''))
          });
        }
      }
    }
    
    if (devices.length > 0) {
      // Calculate percentages based on count if not directly available
      const totalCount = devices.reduce((sum, device) => sum + device.count, 0);
      if (totalCount > 0) {
        devices.forEach(device => {
          if (device.percentage === 0) {
            device.percentage = (device.count / totalCount) * 100;
          }
        });
      }
      
      result.geographical.devices = devices;
      console.log(`Extracted ${devices.length} devices`);
    }
  }
  
  // Extract sources data - look for the section and its content
  const sourcesSectionMatch = normalizedInput.match(/Total Downloads by Source\s*\n\s*See All\s*\n([\s\S]*?)(?=Total Downloads by|$)/i);
  if (sourcesSectionMatch && sourcesSectionMatch[1]) {
    const sourcesContent = sourcesSectionMatch[1].trim();
    const sourceLines = sourcesContent.split('\n').filter(line => line.trim());
    
    const sources = [];
    for (const line of sourceLines) {
      // Try to match source lines in App Store Connect format
      // Format could be "App Store Search" followed by percentage and number of downloads
      const match = line.match(/([A-Za-z\s&]+)\s*\n?\s*([0-9.]+%)\s*\n?\s*([0-9,]+)/);
      if (match) {
        sources.push({
          source: match[1].trim(),
          percentage: parseFloat(match[2].replace('%', '')),
          downloads: parseInt(match[3].replace(/,/g, ''))
        });
      } else {
        // Try alternate format without percentage
        const altMatch = line.match(/([A-Za-z\s&]+)\s*\n?\s*([0-9,]+)/);
        if (altMatch) {
          sources.push({
            source: altMatch[1].trim(),
            percentage: 0, // Will calculate later
            downloads: parseInt(altMatch[2].replace(/,/g, ''))
          });
        }
      }
    }
    
    if (sources.length > 0) {
      // Calculate percentages based on downloads if not directly available
      const totalDownloads = sources.reduce((sum, source) => sum + source.downloads, 0);
      if (totalDownloads > 0) {
        sources.forEach(source => {
          if (source.percentage === 0) {
            source.percentage = (source.downloads / totalDownloads) * 100;
          }
        });
      }
      
      result.geographical.sources = sources;
      console.log(`Extracted ${sources.length} sources`);
    }
  }

  return result;
};
