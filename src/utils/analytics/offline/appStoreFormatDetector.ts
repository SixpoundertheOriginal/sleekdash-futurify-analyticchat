
/**
 * App Store Format Detection and Processing Utilities
 * Specialized detection and handling for App Store Connect data format
 */

interface SectionData {
  name: string;
  content: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Detects if the content is likely from App Store Connect
 */
export function isAppStoreFormat(content: string): boolean {
  if (!content || typeof content !== 'string') {
    return false;
  }

  // Key signatures that indicate App Store Connect format
  const appStoreSignatures = [
    // Headers and sections
    /App Store Connect/i,
    /Analytics\s+Trends/i,
    /Metrics\s+Trends\s+Users/i,
    
    // Common metrics patterns with question mark format
    /Impressions\s*\?\s*/i,
    /Product Page Views\s*\?\s*/i,
    /Conversion Rate\s*\?\s*/i,
    /Total Downloads\s*\?\s*/i,
    
    // Section headers
    /Total Downloads by Territory/i,
    /Total Downloads by Device/i,
    /Total Downloads by Source/i,
    
    // Footer/header patterns
    /See All/i,
    /\d+ of \d+ territories/i
  ];
  
  // Count how many signatures match
  const matchCount = appStoreSignatures.filter(pattern => pattern.test(content)).length;
  
  // If more than 2 signatures match, it's likely App Store data
  return matchCount >= 2;
}

/**
 * Parse App Store Connect content into structured sections
 */
export function parseAppStoreSections(content: string): Record<string, string> {
  if (!content || !isAppStoreFormat(content)) {
    return { raw: content };
  }
  
  // Normalize line breaks and whitespace
  const normalizedContent = content
    .replace(/\r\n/g, '\n')
    .replace(/\s*\?\s*/g, ' ? ')
    .trim();
  
  // Identify sections by headers
  const sectionPatterns = [
    { name: 'summary', pattern: /(.+?)(?=Impressions|Product Page Views|Metrics)/is },
    { name: 'acquisition', pattern: /(Impressions.*?Product Page Views.*?Conversion Rate.*?(?:Total )?Downloads)/is },
    { name: 'financial', pattern: /(Proceeds.*?(?:Proceeds per|Revenue per).*?)(?=Sessions per|Crashes|Total Downloads by|$)/is },
    { name: 'engagement', pattern: /(Sessions per Active Device.*?)(?=Crashes|Total Downloads by|Proceeds|$)/is },
    { name: 'technical', pattern: /(Crashes.*?)(?=Total Downloads by|$)/is },
    { name: 'territories', pattern: /Total Downloads by Territory\s*\n\s*See All\s*\n([\s\S]*?)(?=Total Downloads by|$)/i },
    { name: 'devices', pattern: /Total Downloads by Device\s*\n\s*See All\s*\n([\s\S]*?)(?=Total Downloads by|$)/i },
    { name: 'sources', pattern: /Total Downloads by Source\s*\n\s*See All\s*\n([\s\S]*?)(?=Total Downloads by|$)/i }
  ];
  
  // Extract each section
  const sections: Record<string, string> = { raw: normalizedContent };
  
  sectionPatterns.forEach(({ name, pattern }) => {
    const match = normalizedContent.match(pattern);
    if (match && match[1]) {
      sections[name] = match[1].trim();
    }
  });
  
  return sections;
}

/**
 * Parse tabular data in "See All" sections into structured arrays
 */
export function parseTabularData(sectionContent: string, type: 'territories' | 'devices' | 'sources'): any[] {
  if (!sectionContent) return [];
  
  // Split content into lines and filter out empty lines
  const lines = sectionContent.split('\n').filter(line => line.trim());
  const results = [];
  
  // Skip "See All" header if present
  const startIndex = lines[0].includes('See All') ? 1 : 0;
  
  if (type === 'territories') {
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      // Match country name followed by number and optional percentage
      const match = line.match(/([A-Za-z\s&'.,-]+)\s*(\d[\d,.]+)(?:\s*([\d.]+%|$))?/);
      if (match) {
        results.push({
          country: match[1].trim(),
          downloads: parseInt(match[2].replace(/,/g, '')),
          percentage: match[3] ? parseFloat(match[3].replace('%', '')) : null
        });
      }
    }
  } else if (type === 'devices') {
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      // Match device type followed by percentage and number
      const match = line.match(/([A-Za-z\s]+)\s*([\d.]+%)\s*(\d[\d,.]+)/);
      if (match) {
        results.push({
          type: match[1].trim(),
          percentage: parseFloat(match[2].replace('%', '')),
          count: parseInt(match[3].replace(/,/g, ''))
        });
      } else {
        // Alternative format: device type followed by number
        const altMatch = line.match(/([A-Za-z\s]+)\s*(\d[\d,.]+)/);
        if (altMatch) {
          results.push({
            type: altMatch[1].trim(),
            count: parseInt(altMatch[2].replace(/,/g, '')),
            percentage: null
          });
        }
      }
    }
  } else if (type === 'sources') {
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      // Match source followed by percentage and number
      const match = line.match(/([A-Za-z\s&'.,-]+)\s*([\d.]+%)\s*(\d[\d,.]+)/);
      if (match) {
        results.push({
          source: match[1].trim(),
          percentage: parseFloat(match[2].replace('%', '')),
          downloads: parseInt(match[3].replace(/,/g, ''))
        });
      } else {
        // Alternative format: source followed by number
        const altMatch = line.match(/([A-Za-z\s&'.,-]+)\s*(\d[\d,.]+)/);
        if (altMatch) {
          results.push({
            source: altMatch[1].trim(),
            downloads: parseInt(altMatch[2].replace(/,/g, '')),
            percentage: null
          });
        }
      }
    }
  }
  
  return results;
}

/**
 * Pre-process App Store data for better extraction
 */
export function preprocessAppStoreData(content: string): string {
  if (!isAppStoreFormat(content)) {
    return content;
  }
  
  // Parse into sections
  const sections = parseAppStoreSections(content);
  
  // Enhanced structured format for processor
  let processedContent = "";
  
  // Add header with date range if available
  if (sections.summary) {
    const dateMatch = sections.summary.match(/([A-Za-z]+ \d+[-–][A-Za-z]+ \d+, \d{4})/);
    if (dateMatch) {
      processedContent += `Date Range: ${dateMatch[1]}\n\n`;
    }
  }
  
  // Add acquisition metrics section
  if (sections.acquisition) {
    processedContent += "## Acquisition Metrics\n";
    processedContent += sections.acquisition.replace(/\s*\?\s*/g, ': ') + "\n\n";
  }
  
  // Add financial metrics section
  if (sections.financial) {
    processedContent += "## Financial Metrics\n";
    processedContent += sections.financial.replace(/\s*\?\s*/g, ': ') + "\n\n";
  }
  
  // Add engagement metrics section
  if (sections.engagement) {
    processedContent += "## Engagement Metrics\n";
    processedContent += sections.engagement.replace(/\s*\?\s*/g, ': ') + "\n\n";
  }
  
  // Add technical metrics section
  if (sections.technical) {
    processedContent += "## Technical Metrics\n";
    processedContent += sections.technical.replace(/\s*\?\s*/g, ': ') + "\n\n";
  }
  
  // Process distribution data
  if (sections.territories || sections.devices || sections.sources) {
    processedContent += "## Distribution\n";
    
    if (sections.territories) {
      processedContent += "### Territories\n";
      const territories = parseTabularData(sections.territories, 'territories');
      territories.forEach(t => {
        processedContent += `${t.country}: ${t.downloads} (${t.percentage || 0}%)\n`;
      });
      processedContent += "\n";
    }
    
    if (sections.devices) {
      processedContent += "### Devices\n";
      const devices = parseTabularData(sections.devices, 'devices');
      devices.forEach(d => {
        processedContent += `${d.type}: ${d.count} (${d.percentage || 0}%)\n`;
      });
      processedContent += "\n";
    }
    
    if (sections.sources) {
      processedContent += "### Sources\n";
      const sources = parseTabularData(sections.sources, 'sources');
      sources.forEach(s => {
        processedContent += `${s.source}: ${s.downloads} (${s.percentage || 0}%)\n`;
      });
      processedContent += "\n";
    }
  }
  
  return processedContent;
}
