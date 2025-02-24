
export interface DeviceData {
  name: string;
  value: number;
}

const defaultDeviceDistribution = [
  { name: "iPad", value: 48.4 },
  { name: "iPhone", value: 50.0 },
  { name: "Other", value: 1.6 },
];

const defaultGeographicalData = [
  { country: "United States", downloads: 3293 },
  { country: "India", downloads: 612 },
  { country: "United Kingdom", downloads: 547 },
  { country: "United Arab Emirates", downloads: 365 },
  { country: "Canada", downloads: 330 },
];

export const parseDeviceDistribution = (analysisText: string): DeviceData[] => {
  try {
    // Identify the device distribution section
    const deviceSection = analysisText.match(/Downloads by Device Type:|Device Distribution:|Device Type:|Device Usage:/i);
    
    if (deviceSection) {
      // Find all device entries with percentages using a more flexible pattern
      const devicePattern = /(iPhone|iPad|iPod|Desktop|Android|Mac|PC|tablet|phone|web).*?(\d+\.?\d*)%/gi;
      const devices = new Map();
      let totalIdentified = 0;
      
      // Find all matches in the text
      let match;
      while ((match = devicePattern.exec(analysisText)) !== null) {
        const device = match[1].trim();
        const percentage = parseFloat(match[2]);
        
        // Group similar devices
        let deviceCategory = device;
        if (device.toLowerCase().includes('iphone')) {
          deviceCategory = 'iPhone';
        } else if (device.toLowerCase().includes('ipad') || device.toLowerCase().includes('tablet')) {
          deviceCategory = 'iPad';
        } else {
          deviceCategory = 'Other';
        }
        
        // Add or update the device category
        if (devices.has(deviceCategory)) {
          devices.set(deviceCategory, devices.get(deviceCategory) + percentage);
        } else {
          devices.set(deviceCategory, percentage);
        }
        
        totalIdentified += percentage;
      }
      
      // If we found devices, convert to the required format
      if (devices.size > 0) {
        // If the total is significantly less than 100%, add an "Other" category
        if (totalIdentified < 95 && totalIdentified > 0) {
          devices.set('Other', 100 - totalIdentified);
        }
        
        // Convert map to array format
        return Array.from(devices.entries()).map(([name, value]) => ({ name, value }));
      }
    }
    
    // Return default data if no valid distribution was found
    return defaultDeviceDistribution;
  } catch (error) {
    console.error('Error parsing device distribution:', error);
    return defaultDeviceDistribution;
  }
};

export const parseGeographicalData = (analysisText: string) => {
  try {
    const geoSectionPatterns = [
      /Downloads by Country[:\s]+([\s\S]*?)(?=\n\n|\n-|\n\d\.|\n#|\Z)/i,
      /Geographical (?:Distribution|Analysis|Breakdown)[:\s]+([\s\S]*?)(?=\n\n|\n-|\n\d\.|\n#|\Z)/i,
      /Top Countries[:\s]+([\s\S]*?)(?=\n\n|\n-|\n\d\.|\n#|\Z)/i,
      /Countries[:\s]+([\s\S]*?)(?=\n\n|\n-|\n\d\.|\n#|\Z)/i
    ];
    
    // Try each pattern to find the geographical section
    let geoSectionText = '';
    
    for (const pattern of geoSectionPatterns) {
      const geoSection = analysisText.match(pattern);
      if (geoSection && geoSection[1]) {
        geoSectionText = geoSection[1];
        break;
      }
    }
    
    if (geoSectionText) {
      // Multiple patterns to match country data
      const countryPatterns = [
        /([A-Za-z][\w\s&.',-]+):\s*([\d,.k]+)/g,
        /([\d,.k]+)\s+(?:downloads? in|users? in|from)\s+([A-Za-z][\w\s&.',-]+)/g,
        /-\s*([A-Za-z][\w\s&.',-]+)[:]\s*([\d,.k]+)/g,
        /([A-Za-z][\w\s&.',-]+)\s*\(*([\d,.k]+)\)*\s*(?:downloads|users)?/g
      ];
      
      const countries = new Map();
      
      for (const pattern of countryPatterns) {
        pattern.lastIndex = 0;
        let match;
        
        while ((match = pattern.exec(geoSectionText)) !== null) {
          let country, downloads;
          
          if (/^\d/.test(match[1])) {
            downloads = match[1].trim();
            country = match[2].trim();
          } else {
            country = match[1].trim();
            downloads = match[2].trim();
          }
          
          country = country.replace(/^the /i, '').trim();
          
          if (!country || 
              country.toLowerCase().includes('total') || 
              country.toLowerCase().includes('download') || 
              country.length < 2) {
            continue;
          }
          
          let downloadCount;
          if (typeof downloads === 'string') {
            downloads = downloads.replace(/,/g, '');
            if (downloads.toLowerCase().endsWith('k')) {
              downloadCount = parseFloat(downloads.slice(0, -1)) * 1000;
            } else if (downloads.toLowerCase().endsWith('m')) {
              downloadCount = parseFloat(downloads.slice(0, -1)) * 1000000;
            } else {
              downloadCount = parseFloat(downloads);
            }
          } else {
            downloadCount = downloads;
          }
          
          if (!isNaN(downloadCount) && downloadCount > 0) {
            countries.set(country, downloadCount);
          }
        }
        
        if (countries.size >= 3) break;
      }
      
      if (countries.size > 0) {
        return Array.from(countries.entries())
          .map(([country, downloads]) => ({ country, downloads }))
          .sort((a, b) => b.downloads - a.downloads)
          .slice(0, 5);
      }
    }
    
    return defaultGeographicalData;
  } catch (error) {
    console.error('Error parsing geographical data:', error);
    return defaultGeographicalData;
  }
};
