
/**
 * Helper function to extract metric data using regex patterns
 */
export function extractMetric(text: string, name: string, pattern: string): { name: string, value: string, change: string } | null {
  if (!text || typeof text !== 'string') {
    console.log(`[Extractor] Invalid input for ${name}: not a string or empty`);
    return null;
  }
  
  // Base patterns for different metric formats
  const patterns = [
    // Standard App Store Connect format with question mark
    new RegExp(name + '\\s*' + pattern, 'i'),
    // Without question mark
    new RegExp(name + '\\s*([\\d.,KMBkmb]+)\\s*([+\\-]\\d+%)?', 'i'),
    // With line break
    new RegExp(name + '\\s*\\n\\s*([\\d.,KMBkmb]+)\\s*([+\\-]\\d+%)?', 'i'),
    // With ":" separator
    new RegExp(name + '\\s*:\\s*([\\d.,KMBkmb]+)\\s*([+\\-]\\d+%)?', 'i'),
  ];
  
  for (const regex of patterns) {
    const match = text.match(regex);
    if (match && match[1]) {
      return {
        name,
        value: match[1].trim(),
        change: match[2] ? match[2].trim() : '0%'
      };
    }
  }
  
  console.log(`[Extractor] No match found for ${name}`);
  return null;
}

/**
 * Extract retention data from App Store text
 */
export function extractRetention(text: string): Array<{ day: string, value: string, benchmark: string }> {
  if (!text || typeof text !== 'string') {
    console.log('[Extractor] Invalid input for retention: not a string or empty');
    return [];
  }
  
  const retentionSection = text.match(/Average Retention[\s\S]*?See All([\s\S]*?)(?:App Store Connect|$)/i);
  if (!retentionSection || !retentionSection[1]) return [];
  
  const retentionData = [];
  const days = ["Day 1", "Day 7", "Day 14", "Day 21", "Day 28"];
  
  for (const day of days) {
    // Broader pattern to catch variations in retention rate formatting
    const retentionPatterns = [
      // Standard format
      new RegExp(`Your ${day.toLowerCase()} retention rate of ([\\d.]+)%.*?(~[\\d.]+%)`, 'i'),
      // Alternative format without "your"
      new RegExp(`${day} retention.*?([\\d.]+)%.*?(~[\\d.]+%)`, 'i'),
      // Format with line break
      new RegExp(`${day}\\s*\\n\\s*([\\d.]+)%`, 'i'),
      // Just the number after the day
      new RegExp(`${day}\\s*([\\d.]+)%`, 'i')
    ];
    
    for (const pattern of retentionPatterns) {
      const retMatch = retentionSection[1].match(pattern);
      if (retMatch) {
        retentionData.push({
          day,
          value: retMatch[1] + '%',
          benchmark: retMatch[2] ? retMatch[2] : 'N/A'
        });
        break;
      }
    }
  }
  
  return retentionData;
}

/**
 * Extract territory data from App Store text
 */
export function extractTerritory(text: string): Array<{ country: string, downloads: string, percentage: string }> {
  if (!text || typeof text !== 'string') {
    console.log('[Extractor] Invalid input for territory: not a string or empty');
    return [];
  }
  
  // Look for territory section with multiple pattern variations
  const territorySectionPatterns = [
    /Total Downloads by Territory[\s\S]*?See All([\s\S]*?)(?:Total Downloads by|$)/i,
    /Downloads by Territory[\s\S]*?See All([\s\S]*?)(?:Downloads by|$)/i,
    /Territory Breakdown[\s\S]*?See All([\s\S]*?)(?:Territory|$)/i
  ];
  
  let territoriesSection = null;
  for (const pattern of territorySectionPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      territoriesSection = match[1];
      break;
    }
  }
  
  if (!territoriesSection) return [];
  
  const territoryData = [];
  const territories = territoriesSection.split('\n').filter(line => line.trim());
  
  for (const territory of territories) {
    // Enhanced pattern to match territory with/without percentage
    const territoryPatterns = [
      /([A-Za-z\s]+)\s+([0-9,.KMBkmb]+)(?:\s+([0-9.]+%)?)?/,
      /([A-Za-z\s]+)\s+([0-9.]+%)\s+([0-9,.KMBkmb]+)/
    ];
    
    for (const pattern of territoryPatterns) {
      const match = territory.match(pattern);
      if (match) {
        if (pattern.toString().includes('([0-9.]+%)\\s+([0-9,.KMBkmb]+)')) {
          // Pattern with percentage first, then downloads
          territoryData.push({
            country: match[1].trim(),
            downloads: match[3].trim(),
            percentage: match[2].trim()
          });
        } else {
          // Standard pattern with downloads then percentage
          territoryData.push({
            country: match[1].trim(),
            downloads: match[2].trim(),
            percentage: match[3] || ''
          });
        }
        break;
      }
    }
  }
  
  return territoryData;
}

/**
 * Extract device data from App Store text
 */
export function extractDevice(text: string): Array<{ type: string, count: string, percentage: string }> {
  if (!text || typeof text !== 'string') {
    console.log('[Extractor] Invalid input for device: not a string or empty');
    return [];
  }
  
  // Look for device section with multiple pattern variations
  const deviceSectionPatterns = [
    /Total Downloads by Device[\s\S]*?See All([\s\S]*?)(?:Total Downloads|$)/i,
    /Downloads by Device[\s\S]*?See All([\s\S]*?)(?:Downloads by|$)/i,
    /Device Breakdown[\s\S]*?See All([\s\S]*?)(?:Device|$)/i
  ];
  
  let devicesSection = null;
  for (const pattern of deviceSectionPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      devicesSection = match[1];
      break;
    }
  }
  
  if (!devicesSection) return [];
  
  const deviceData = [];
  const devices = devicesSection.split('\n').filter(line => line.trim());
  
  for (const device of devices) {
    // Enhanced patterns to match different formats
    const devicePatterns = [
      // Pattern with percentage then count
      /([A-Za-z\s]+)\s+([0-9.]+%)\s+([0-9,.KMBkmb]+)/,
      // Pattern with count then percentage
      /([A-Za-z\s]+)\s+([0-9,.KMBkmb]+)\s+([0-9.]+%)/,
      // Pattern with just device and count
      /([A-Za-z\s]+)\s+([0-9,.KMBkmb]+)/
    ];
    
    for (const pattern of devicePatterns) {
      const match = device.match(pattern);
      if (match) {
        if (pattern.toString().includes('([0-9.]+%)\\s+([0-9,.KMBkmb]+)')) {
          // Percentage then count
          deviceData.push({
            type: match[1].trim(),
            percentage: match[2].trim(),
            count: match[3].trim()
          });
        } else if (pattern.toString().includes('([0-9,.KMBkmb]+)\\s+([0-9.]+%)')) {
          // Count then percentage
          deviceData.push({
            type: match[1].trim(),
            count: match[2].trim(),
            percentage: match[3].trim()
          });
        } else {
          // Just type and count
          deviceData.push({
            type: match[1].trim(),
            count: match[2].trim(),
            percentage: ''
          });
        }
        break;
      }
    }
  }
  
  return deviceData;
}

/**
 * Extract source data from App Store text (new extractor)
 */
export function extractSource(text: string): Array<{ source: string, downloads: string, percentage: string }> {
  if (!text || typeof text !== 'string') {
    console.log('[Extractor] Invalid input for source: not a string or empty');
    return [];
  }
  
  // Look for source section with multiple pattern variations
  const sourceSectionPatterns = [
    /Total Downloads by Source[\s\S]*?See All([\s\S]*?)(?:Total Downloads|$)/i,
    /Downloads by Source[\s\S]*?See All([\s\S]*?)(?:Downloads by|$)/i,
    /Source Breakdown[\s\S]*?See All([\s\S]*?)(?:Source|$)/i
  ];
  
  let sourcesSection = null;
  for (const pattern of sourceSectionPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      sourcesSection = match[1];
      break;
    }
  }
  
  if (!sourcesSection) return [];
  
  const sourceData = [];
  const sources = sourcesSection.split('\n').filter(line => line.trim());
  
  for (const source of sources) {
    // Enhanced patterns to match different formats
    const sourcePatterns = [
      // Pattern with percentage then downloads
      /([A-Za-z\s]+)\s+([0-9.]+%)\s+([0-9,.KMBkmb]+)/,
      // Pattern with downloads then percentage
      /([A-Za-z\s]+)\s+([0-9,.KMBkmb]+)\s+([0-9.]+%)/,
      // Pattern with just source and downloads
      /([A-Za-z\s]+)\s+([0-9,.KMBkmb]+)/
    ];
    
    for (const pattern of sourcePatterns) {
      const match = source.match(pattern);
      if (match) {
        if (pattern.toString().includes('([0-9.]+%)\\s+([0-9,.KMBkmb]+)')) {
          // Percentage then downloads
          sourceData.push({
            source: match[1].trim(),
            percentage: match[2].trim(),
            downloads: match[3].trim()
          });
        } else if (pattern.toString().includes('([0-9,.KMBkmb]+)\\s+([0-9.]+%)')) {
          // Downloads then percentage
          sourceData.push({
            source: match[1].trim(),
            downloads: match[2].trim(),
            percentage: match[3].trim()
          });
        } else {
          // Just source and downloads
          sourceData.push({
            source: match[1].trim(),
            downloads: match[2].trim(),
            percentage: ''
          });
        }
        break;
      }
    }
  }
  
  return sourceData;
}
