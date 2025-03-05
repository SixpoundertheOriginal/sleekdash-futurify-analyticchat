
/**
 * Service for handling data processing operations across the application
 */
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { detectContentType } from "@/utils/analytics/offline/contentDetector";
import { extractBaseMetrics } from "@/utils/analytics/offline/directExtraction";

export type DataFormat = 'json' | 'csv' | 'excel' | 'text' | 'appStore' | 'unknown';

export interface ProcessingOptions {
  formatHint?: DataFormat;
  extractMetrics?: boolean;
  normalizeValues?: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface ProcessingResult<T = any> {
  success: boolean;
  data?: T;
  metrics?: Partial<ProcessedAnalytics>;
  format?: DataFormat;
  error?: string;
}

/**
 * Detects the format of the provided data
 */
export function detectDataFormat(data: string): DataFormat {
  // Simple JSON detection
  if (data.trim().startsWith('{') || data.trim().startsWith('[')) {
    try {
      JSON.parse(data);
      return 'json';
    } catch (e) {
      // Not valid JSON
    }
  }

  // CSV detection (has commas and multiple lines)
  if (data.includes(',') && data.includes('\n')) {
    const lines = data.trim().split('\n');
    if (lines.length > 1) {
      const headerCols = lines[0].split(',').length;
      const firstDataCols = lines[1].split(',').length;
      // If header and data have similar column counts, likely CSV
      if (Math.abs(headerCols - firstDataCols) <= 1 && headerCols > 1) {
        return 'csv';
      }
    }
  }

  // App Store format detection
  const contentType = detectContentType(data);
  if (contentType === 'appStore') {
    return 'appStore';
  }

  // Default to text
  return 'text';
}

/**
 * Processes data based on detected or provided format
 */
export function processData<T = any>(
  rawData: string, 
  options: ProcessingOptions = {}
): ProcessingResult<T> {
  try {
    // Detect format if not specified
    const format = options.formatHint || detectDataFormat(rawData);
    
    // Process based on format
    let processedData: any = null;
    
    switch(format) {
      case 'json':
        processedData = JSON.parse(rawData);
        break;
      case 'csv':
        processedData = parseCSV(rawData);
        break;
      case 'appStore':
        processedData = processAppStoreData(rawData, options);
        break;
      default:
        processedData = { rawContent: rawData };
    }
    
    // Extract metrics if requested
    let metrics: Partial<ProcessedAnalytics> | undefined;
    if (options.extractMetrics) {
      metrics = extractBaseMetrics(rawData);
    }
    
    return {
      success: true,
      data: processedData as T,
      metrics,
      format
    };
  } catch (error) {
    console.error('Data processing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during data processing',
      format: 'unknown'
    };
  }
}

/**
 * Parses CSV data into an array of objects
 */
function parseCSV(csvContent: string): Record<string, any>[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length === 0) return [];
  
  // Extract headers
  const headers = lines[0].split(',').map(header => header.trim());
  
  // Process data rows
  return lines.slice(1).map(line => {
    const values = line.split(',').map(value => value.trim());
    const row: Record<string, any> = {};
    
    headers.forEach((header, index) => {
      // Try to convert numeric values
      const value = values[index] || '';
      const numValue = Number(value);
      row[header] = !isNaN(numValue) ? numValue : value;
    });
    
    return row;
  });
}

/**
 * Process App Store specific data
 */
function processAppStoreData(
  data: string, 
  options: ProcessingOptions
): Record<string, any> {
  // Extract metrics using the base extractor
  const metrics = extractBaseMetrics(data);
  
  // Create structured data object
  const result: Record<string, any> = {
    metrics,
    rawContent: data
  };
  
  // Add date range if provided
  if (options.dateRange) {
    result.dateRange = options.dateRange;
  }
  
  return result;
}

/**
 * Utility to normalize values (convert strings to numbers, etc.)
 */
export function normalizeDataValues(data: Record<string, any>): Record<string, any> {
  const normalized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Try to convert to number if it looks like one
      if (/^-?\d+(\.\d+)?$/.test(value)) {
        normalized[key] = Number(value);
      } else if (value.toLowerCase() === 'true') {
        normalized[key] = true;
      } else if (value.toLowerCase() === 'false') {
        normalized[key] = false;
      } else {
        normalized[key] = value;
      }
    } else if (Array.isArray(value)) {
      normalized[key] = value.map(item => 
        typeof item === 'object' ? normalizeDataValues(item) : item
      );
    } else if (value !== null && typeof value === 'object') {
      normalized[key] = normalizeDataValues(value);
    } else {
      normalized[key] = value;
    }
  }
  
  return normalized;
}
