
import { extractMetric, extractRetention, extractTerritory, extractDevice } from './app-store-extractors';

/**
 * Process pasted App Store analytics data 
 * @param text The raw text from App Store Connect
 * @returns A structured CSV-like format for further processing
 */
export function processAppStoreText(text: string): string {
  console.log('[FileProcessor] Processing App Store text, length:', text.length);
  
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
  
  // Extract retention data
  const retentionData = extractRetention(text);
  
  // Extract territory data
  const territoryData = extractTerritory(text);
  
  // Extract device data
  const deviceData = extractDevice(text);
  
  // Convert to a CSV-like format for consistency with our existing processing
  let csvContent = "Metric,Value,Change\n";
  metrics.forEach(metric => {
    if (metric) {
      csvContent += `${metric.name},${metric.value},${metric.change}\n`;
    }
  });
  
  // Add date range
  csvContent += `Date Range,${dateRange},,\n`;
  
  // Add retention data
  if (retentionData.length > 0) {
    csvContent += "\nRetention,Value,Benchmark\n";
    retentionData.forEach(data => {
      csvContent += `${data.day},${data.value},${data.benchmark}\n`;
    });
  }
  
  // Add territory data
  if (territoryData.length > 0) {
    csvContent += "\nTerritory,Downloads,Percentage\n";
    territoryData.forEach(data => {
      csvContent += `${data.country},${data.downloads},${data.percentage}\n`;
    });
  }
  
  // Add device data
  if (deviceData.length > 0) {
    csvContent += "\nDevice,Downloads,Percentage\n";
    deviceData.forEach(data => {
      csvContent += `${data.type},${data.downloads},${data.percentage}\n`;
    });
  }
  
  console.log('[FileProcessor] Processed App Store text to CSV-like format, length:', csvContent.length);
  return csvContent;
}

/**
 * Determine if text is App Store data format
 */
export function isAppStoreFormat(text: string): boolean {
  // Look for common App Store metrics patterns
  const appStorePatterns = [
    /Impressions\s*\?\s*[\d.,K]+\s*[+\-]\d+%/i,
    /Product Page Views\s*\?\s*[\d.,K]+\s*[+\-]\d+%/i,
    /Conversion Rate\s*\?\s*[\d.,]+%\s*[+\-]\d+%/i,
    /Total Downloads\s*\?\s*[\d.,K]+\s*[+\-]\d+%/i,
    /App Store Connect/i,
    /Analytics\s*Trends\s*Users and Access/i
  ];
  
  // If at least 2 patterns match, consider it App Store format
  return appStorePatterns.filter(pattern => pattern.test(text)).length >= 2;
}
