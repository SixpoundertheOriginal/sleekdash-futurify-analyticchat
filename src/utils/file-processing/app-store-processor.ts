
import { extractMetric, extractRetention, extractTerritory, extractDevice } from './app-store-extractors';
import { isAppStoreFormat, parseAppStoreSections, parseTabularData, preprocessAppStoreData } from '@/utils/analytics/offline/appStoreFormatDetector';

/**
 * Process pasted App Store analytics data 
 * @param text The raw text from App Store Connect
 * @returns A structured CSV-like format for further processing
 */
export function processAppStoreText(text: string): string {
  console.log('[FileProcessor] Processing App Store text, length:', text.length);
  
  // Use our specialized preprocessing for App Store format
  const preprocessedText = preprocessAppStoreData(text);
  
  // Parse sections to extract structured data
  const sections = parseAppStoreSections(text);
  
  // Extract date range which is usually at the top
  const dateRangeMatch = text.match(/([A-Za-z]+\s+\d+[-–]\w+\s+\d+)/i);
  const dateRange = dateRangeMatch ? dateRangeMatch[1] : "Unknown date range";
  console.log('[FileProcessor] Extracted date range:', dateRange);
  
  // Extract core metrics
  const metrics = [
    extractMetric(text, "Impressions", "\\?\\s*([\\d.,K]+)\\s*([+\\-]\\d+%)"),
    extractMetric(text, "Product Page Views", "\\?\\s*([\\d.,K]+)\\s*([+\\-]\\d+%)"),
    extractMetric(text, "Conversion Rate", "\\?\\s*([\\d.,]+%)\\s*([+\\-]\\d+%)"),
    extractMetric(text, "Total Downloads", "\\?\\s*([\\d.,K]+)\\s*([+\\-]\\d+%)"),
    extractMetric(text, "Proceeds", "\\?\\s*\\$?([\\d.,K]+)\\s*([+\\-]\\d+%)"),
    extractMetric(text, "Proceeds per Paying User", "\\?\\s*\\$?([\\d.,]+)\\s*([+\\-]\\d+%)"),
    extractMetric(text, "Sessions per Active Device", "\\?\\s*([\\d.,]+)\\s*([+\\-]\\d+%)"),
    extractMetric(text, "Crashes", "\\?\\s*([\\d.,]+)\\s*([+\\-]\\d+%)")
  ];
  
  // Use specialized tabular data parsing for territories, devices, and sources
  let territoryData, deviceData, sourcesData;
  
  if (sections.territories) {
    territoryData = parseTabularData(sections.territories, 'territories');
  } else {
    // Fallback to old method if section parsing fails
    territoryData = extractTerritory(text);
  }
  
  if (sections.devices) {
    deviceData = parseTabularData(sections.devices, 'devices');
  } else {
    // Fallback to old method if section parsing fails
    deviceData = extractDevice(text);
  }
  
  if (sections.sources) {
    sourcesData = parseTabularData(sections.sources, 'sources');
  } else {
    // Use retention data for backward compatibility
    const retentionData = extractRetention(text);
  }
  
  // Convert to a CSV-like format for consistency with our existing processing
  let csvContent = "Metric,Value,Change\n";
  metrics.forEach(metric => {
    if (metric) {
      csvContent += `${metric.name},${metric.value},${metric.change}\n`;
    }
  });
  
  // Add date range
  csvContent += `Date Range,${dateRange},,\n`;
  
  // Add territory data
  if (territoryData && territoryData.length > 0) {
    csvContent += "\nTerritory,Downloads,Percentage\n";
    territoryData.forEach(data => {
      csvContent += `${data.country},${data.downloads},${data.percentage || 0}\n`;
    });
  }
  
  // Add device data
  if (deviceData && deviceData.length > 0) {
    csvContent += "\nDevice,Downloads,Percentage\n";
    deviceData.forEach(data => {
      csvContent += `${data.type},${data.count || data.downloads},${data.percentage || 0}\n`;
    });
  }
  
  // Add source data if available
  if (sourcesData && sourcesData.length > 0) {
    csvContent += "\nSource,Downloads,Percentage\n";
    sourcesData.forEach(data => {
      csvContent += `${data.source},${data.downloads},${data.percentage || 0}\n`;
    });
  }
  
  console.log('[FileProcessor] Processed App Store text to CSV-like format, length:', csvContent.length);
  return csvContent;
}

/**
 * Determine if text is App Store data format
 */
export { isAppStoreFormat };
