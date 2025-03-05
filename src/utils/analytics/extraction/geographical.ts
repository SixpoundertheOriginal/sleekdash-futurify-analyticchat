
import { ProcessedAnalytics } from "../types";

/**
 * Extract geographical data from analysis text
 */
export const extractGeographicalData = (text: string): ProcessedAnalytics["geographical"] => {
  const result: ProcessedAnalytics["geographical"] = {
    markets: [],
    devices: []
  };

  try {
    // Extract markets data
    const marketsSection = text.match(/Top Markets by Downloads:(.*?)(?=\n\n)/s);
    
    if (marketsSection && marketsSection[1]) {
      const marketLines = marketsSection[1].match(/[^:\n]+([\d.]+)%\s*\((\d+)\)/g) || [];
      
      result.markets = marketLines.map(line => {
        try {
          const match = line.match(/([^:]+):\s*([\d.]+)%\s*\((\d+)\)/);
          if (!match) {
            return {
              country: 'Unknown',
              percentage: 0,
              downloads: 0
            };
          }
          
          return {
            country: match[1]?.trim() || 'Unknown',
            percentage: match[2] ? parseFloat(match[2]) : 0,
            downloads: match[3] ? parseInt(match[3], 10) : 0
          };
        } catch (err) {
          return {
            country: 'Unknown',
            percentage: 0,
            downloads: 0
          };
        }
      });
    }

    // Extract device distribution
    const devicesSection = text.match(/Device Distribution:(.*?)(?=\n\n)/s);
    
    if (devicesSection && devicesSection[1]) {
      const deviceLines = devicesSection[1].match(/[^:\n]+([\d.]+)%\s*\((\d+)\)/g) || [];
      
      result.devices = deviceLines.map(line => {
        try {
          const match = line.match(/([^:]+):\s*([\d.]+)%\s*\((\d+)\)/);
          if (!match) {
            return {
              type: 'Unknown',
              percentage: 0,
              count: 0
            };
          }
          
          return {
            type: match[1]?.trim() || 'Unknown',
            percentage: match[2] ? parseFloat(match[2]) : 0,
            count: match[3] ? parseInt(match[3], 10) : 0
          };
        } catch (err) {
          return {
            type: 'Unknown',
            percentage: 0,
            count: 0
          };
        }
      });
    }
  } catch (err) {
    console.error('Error processing geographical data:', err);
  }

  return result;
};
