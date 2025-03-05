
/**
 * Helper function to extract metric data using regex patterns
 */
export function extractMetric(text: string, name: string, pattern: string): { name: string, value: string, change: string } | null {
  const regex = new RegExp(name + '\\s*' + pattern, 'i');
  const match = text.match(regex);
  
  if (match && match[1]) {
    return {
      name,
      value: match[1].trim(),
      change: match[2] ? match[2].trim() : '0%'
    };
  }
  return null;
}

/**
 * Extract retention data from App Store text
 */
export function extractRetention(text: string): Array<{ day: string, value: string, benchmark: string }> {
  const retentionSection = text.match(/Average Retention[\s\S]*?See All([\s\S]*?)(?:App Store Connect|$)/i);
  if (!retentionSection || !retentionSection[1]) return [];
  
  const retentionData = [];
  const days = ["Day 1", "Day 7", "Day 14", "Day 21", "Day 28"];
  
  for (const day of days) {
    // Look for patterns like "Your day 1 retention rate of 19.77% is between"
    const retMatch = retentionSection[1].match(new RegExp(`Your ${day.toLowerCase()} retention rate of ([\\d.]+)%.*?(~[\\d.]+%)`, 'i'));
    if (retMatch) {
      retentionData.push({
        day,
        value: retMatch[1] + '%',
        benchmark: retMatch[2]
      });
    }
  }
  
  return retentionData;
}

/**
 * Extract territory data from App Store text
 */
export function extractTerritory(text: string): Array<{ country: string, downloads: string, percentage: string }> {
  const territoriesSection = text.match(/Total Downloads by Territory[\s\S]*?See All([\s\S]*?)(?:Total Downloads by|$)/i);
  if (!territoriesSection || !territoriesSection[1]) return [];
  
  const territoryData = [];
  const territories = territoriesSection[1].split('\n').filter(line => line.trim());
  
  for (const territory of territories) {
    // Match patterns like "United States 1,883" or with percentages
    const match = territory.match(/([A-Za-z\s]+)\s+([0-9,]+)(?:\s+([0-9.]+%)?)?/);
    if (match) {
      territoryData.push({
        country: match[1].trim(),
        downloads: match[2].trim(),
        percentage: match[3] || ''
      });
    }
  }
  
  return territoryData;
}

/**
 * Extract device data from App Store text
 */
export function extractDevice(text: string): Array<{ type: string, downloads: string, percentage: string }> {
  const devicesSection = text.match(/Total Downloads by Device[\s\S]*?See All([\s\S]*?)(?:Total Downloads|$)/i);
  if (!devicesSection || !devicesSection[1]) return [];
  
  const deviceData = [];
  const devices = devicesSection[1].split('\n').filter(line => line.trim());
  
  for (const device of devices) {
    // Match patterns like "iPhone 48.8% 1,650"
    const match = device.match(/([A-Za-z\s]+)\s+([0-9.]+%)\s+([0-9,]+)/);
    if (match) {
      deviceData.push({
        type: match[1].trim(),
        percentage: match[2].trim(),
        downloads: match[3].trim()
      });
    }
  }
  
  return deviceData;
}
