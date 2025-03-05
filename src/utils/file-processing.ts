
import * as ExcelJS from 'exceljs';
import { useToast } from "@/components/ui/use-toast";

export async function validateFileType(file: File, toast: ReturnType<typeof useToast>['toast']) {
  if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
    toast({
      variant: "destructive",
      title: "Invalid file type",
      description: "Please upload an Excel or CSV file (.xlsx, .xls, .csv)"
    });
    return false;
  }
  return true;
}

export async function processExcelFile(file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    
    // Load Excel file from buffer
    await workbook.xlsx.load(buffer);
    
    // Get the first worksheet
    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new Error("No worksheets found in the Excel file");
    }
    
    console.log('[FileProcessor] Excel sheet name:', worksheet.name);
    
    // Convert to CSV
    let csvContent = '';
    
    // Process header row
    const headerRow = worksheet.getRow(1);
    const headerValues = [];
    headerRow.eachCell({ includeEmpty: false }, cell => {
      headerValues.push(formatCellValueForCsv(cell.value));
    });
    csvContent += headerValues.join(',') + '\n';
    
    // Process data rows
    const rowCount = worksheet.rowCount;
    for (let i = 2; i <= rowCount; i++) {
      const row = worksheet.getRow(i);
      const rowValues = [];
      
      // Check if row has any values
      let hasValues = false;
      row.eachCell({ includeEmpty: false }, () => {
        hasValues = true;
      });
      
      if (hasValues) {
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          // Make sure we don't exceed the header length
          if (colNumber <= headerValues.length) {
            rowValues.push(formatCellValueForCsv(cell.value));
          }
        });
        csvContent += rowValues.join(',') + '\n';
      }
    }
    
    console.log('[FileProcessor] Excel processed to CSV, length:', csvContent.length);
    return csvContent;
  } catch (error) {
    console.error('[FileProcessor] Error processing Excel file:', error);
    throw new Error(`Error reading Excel file: ${error.message}`);
  }
}

// Helper function to properly format cell values for CSV
function formatCellValueForCsv(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  // Handle dates
  if (value instanceof Date) {
    return value.toISOString().split('T')[0]; // YYYY-MM-DD format
  }
  
  // Handle rich text
  if (typeof value === 'object' && value.richText) {
    return value.richText.map(part => part.text).join('');
  }
  
  // Handle formulas - get the result
  if (typeof value === 'object' && value.result !== undefined) {
    return formatCellValueForCsv(value.result);
  }
  
  // Convert to string and escape quotes for CSV
  const stringValue = String(value);
  
  // If the value contains commas, quotes, or newlines, wrap it in quotes and escape any quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

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

function extractMetric(text: string, name: string, pattern: string): { name: string, value: string, change: string } | null {
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

function extractRetention(text: string): Array<{ day: string, value: string, benchmark: string }> {
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

function extractTerritory(text: string): Array<{ country: string, downloads: string, percentage: string }> {
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

function extractDevice(text: string): Array<{ type: string, downloads: string, percentage: string }> {
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

export async function validateFileContent(fileContent: string): Promise<void> {
  if (!fileContent || fileContent.trim().length === 0) {
    throw new Error("File appears to be empty");
  }

  // Check if file content seems valid (has at least header row and one data row)
  const lines = fileContent.split('\n').filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error("File must contain a header row and at least one data row");
  }

  console.log('[FileProcessor] Processed file lines:', lines.length);
  console.log('[FileProcessor] First few rows:', lines.slice(0, 3));
}

// Determine if text is App Store data format
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
