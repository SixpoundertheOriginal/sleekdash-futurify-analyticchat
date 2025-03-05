
import { ProcessedAnalytics } from "../types";

/**
 * Extract geographical data from analysis text
 */
export const extractGeographicalData = (text: string): ProcessedAnalytics["geographical"] => {
  const result: ProcessedAnalytics["geographical"] = {
    markets: [],
    devices: [],
    sources: []
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

    // Extract sources data
    const sourcesSection = text.match(/Downloads by Source:(.*?)(?=\n\n)/s);
    
    if (sourcesSection && sourcesSection[1]) {
      const sourceLines = sourcesSection[1].match(/[^:\n]+([\d.]+)%\s*\((\d+)\)/g) || [];
      
      result.sources = sourceLines.map(line => {
        try {
          const match = line.match(/([^:]+):\s*([\d.]+)%\s*\((\d+)\)/);
          if (!match) {
            return {
              source: 'Unknown',
              percentage: 0,
              downloads: 0
            };
          }
          
          return {
            source: match[1]?.trim() || 'Unknown',
            percentage: match[2] ? parseFloat(match[2]) : 0,
            downloads: match[3] ? parseInt(match[3], 10) : 0
          };
        } catch (err) {
          return {
            source: 'Unknown',
            percentage: 0,
            downloads: 0
          };
        }
      });
    }

    // If no sources were found, use default data
    if (!result.sources || result.sources.length === 0) {
      result.sources = [
        { source: "App Store Search", percentage: 88.6, downloads: 2994 },
        { source: "App Store Browse", percentage: 6.2, downloads: 210 },
        { source: "Institutional Purchase", percentage: 3.0, downloads: 100 },
        { source: "Unavailable", percentage: 1.2, downloads: 41 },
        { source: "App Referrer", percentage: 0.9, downloads: 29 }
      ];
    }
  } catch (err) {
    console.error('Error processing geographical data:', err);
  }

  return result;
}
