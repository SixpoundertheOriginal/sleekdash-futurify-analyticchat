
import { devicePatterns } from "./extractors.ts";

/**
 * Extract device distribution data from analytics text
 * @param text The text to extract device data from
 * @returns Array of device distribution data
 */
export function extractDeviceData(text: string): Array<{ device: string, percentage: number, downloads: number }> {
  const deviceData: Array<{ device: string, percentage: number, downloads: number }> = [];
  
  // Find device distribution section
  const deviceSection = text.match(devicePatterns.pattern);
  if (!deviceSection || !deviceSection[1]) {
    console.log("No device distribution section found");
    return deviceData;
  }
  
  // Parse each line in the device section
  const lines = deviceSection[1].split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    const match = line.match(devicePatterns.itemPattern);
    if (match) {
      const device = match[1].trim();
      const percentageStr = match[2].replace('%', '').trim();
      const downloadsStr = match[3].replace(/,/g, '').trim();
      
      deviceData.push({
        device: device,
        percentage: parseFloat(percentageStr),
        downloads: parseInt(downloadsStr)
      });
    }
  }
  
  return deviceData;
}
