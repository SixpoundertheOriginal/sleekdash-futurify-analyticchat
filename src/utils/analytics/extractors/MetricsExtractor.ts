
import { z } from 'zod';
import { validateMetricValue, validateMetricsConsistency } from '../validation';

/**
 * Base schema for metric with value and optional change
 */
export const BaseMetricSchema = z.object({
  value: z.number(),
  change: z.number().optional(),
  confidence: z.number().optional(),
  warnings: z.array(z.string()).optional(),
  extracted: z.boolean().optional(),
  calculated: z.boolean().optional()
});

export type BaseMetric = z.infer<typeof BaseMetricSchema>;

/**
 * App Store Metrics Schema with Zod for validation
 */
export const AppStoreMetricsSchema = z.object({
  impressions: BaseMetricSchema.optional(),
  pageViews: BaseMetricSchema.optional(),
  conversionRate: BaseMetricSchema.optional(),
  downloads: BaseMetricSchema.optional(),
  proceeds: BaseMetricSchema.optional(),
  proceedsPerUser: BaseMetricSchema.optional(),
  sessionsPerDevice: BaseMetricSchema.optional(),
  crashes: BaseMetricSchema.optional(),
  dateRange: z.string().optional(),
  metadata: z.object({
    completeness: z.number(),
    extractionTime: z.number(),
    missingFields: z.array(z.string()),
    warnings: z.array(z.string()),
    overallConfidence: z.number()
  }).optional()
});

export type AppStoreMetrics = z.infer<typeof AppStoreMetricsSchema>;

/**
 * Utility to parse numeric values with K/M/B suffixes
 */
export function parseNumericValue(value: string): number {
  if (!value || typeof value !== 'string') return 0;
  
  // Remove commas, spaces and other formatting
  const cleanValue = value.replace(/[,\s]/g, '').trim();
  
  // Handle K/M/B suffixes (case insensitive)
  if (/\d+(\.\d+)?[kK]$/.test(cleanValue)) {
    return parseFloat(cleanValue.replace(/[kK]$/, '')) * 1000;
  } else if (/\d+(\.\d+)?[mM]$/.test(cleanValue)) {
    return parseFloat(cleanValue.replace(/[mM]$/, '')) * 1000000;
  } else if (/\d+(\.\d+)?[bB]$/.test(cleanValue)) {
    return parseFloat(cleanValue.replace(/[bB]$/, '')) * 1000000000;
  }
  
  // Handle standard numeric values
  return parseFloat(cleanValue);
}

/**
 * Utility to parse percentage values
 */
export function parsePercentageChange(value: string): number {
  if (!value || typeof value !== 'string') return 0;
  
  // Clean the value and remove % symbol
  const cleanValue = value.replace(/[,\s%]/g, '').trim();
  
  // Handle explicit +/- signs
  if (cleanValue.startsWith('+')) {
    return parseFloat(cleanValue.substring(1));
  }
  
  return parseFloat(cleanValue);
}

/**
 * Extractor for App Store Metrics with robust error handling
 */
export class AppStoreMetricsExtractor {
  /**
   * Extraction patterns for each metric type
   */
  private patterns = {
    impressions: [
      /impressions\s*:?\s*(?:\?)?\s*([0-9.,kmb]+)(?:\s*\(([+-]?[0-9.]+)%\))?/i,
      /([0-9.,kmb]+)\s*impressions/i,
      /impressions\s*\n\s*(?:\?)?\s*\n\s*([0-9.,kmb]+)(?:\s*\n\s*([+-]?[0-9.]+)%)?/i
    ],
    pageViews: [
      /(?:product\s+)?page\s+views\s*:?\s*(?:\?)?\s*([0-9.,kmb]+)(?:\s*\(([+-]?[0-9.]+)%\))?/i,
      /([0-9.,kmb]+)\s*(?:product\s+)?page\s+views/i,
      /(?:product\s+)?page\s+views\s*\n\s*(?:\?)?\s*\n\s*([0-9.,kmb]+)(?:\s*\n\s*([+-]?[0-9.]+)%)?/i
    ],
    conversionRate: [
      /conversion\s+rate\s*:?\s*(?:\?)?\s*([0-9.,]+)%(?:\s*\(([+-]?[0-9.]+)%\))?/i,
      /([0-9.,]+)%\s*conversion\s+rate/i,
      /conversion\s+rate\s*\n\s*(?:\?)?\s*\n\s*([0-9.,]+)%(?:\s*\n\s*([+-]?[0-9.]+)%)?/i
    ],
    downloads: [
      /(?:total\s+)?downloads\s*:?\s*(?:\?)?\s*([0-9.,kmb]+)(?:\s*\(([+-]?[0-9.]+)%\))?/i,
      /([0-9.,kmb]+)\s*(?:total\s+)?downloads/i,
      /(?:total\s+)?downloads\s*\n\s*(?:\?)?\s*\n\s*([0-9.,kmb]+)(?:\s*\n\s*([+-]?[0-9.]+)%)?/i
    ],
    proceeds: [
      /proceeds\s*:?\s*(?:\?)?\s*\$?\s*([0-9.,kmb]+)(?:\s*\(([+-]?[0-9.]+)%\))?/i,
      /\$?\s*([0-9.,kmb]+)\s*proceeds/i,
      /proceeds\s*\n\s*(?:\?)?\s*\n\s*\$?\s*([0-9.,kmb]+)(?:\s*\n\s*([+-]?[0-9.]+)%)?/i
    ],
    proceedsPerUser: [
      /proceeds\s+per\s+(?:paying\s+)?user\s*:?\s*(?:\?)?\s*\$?\s*([0-9.,]+)(?:\s*\(([+-]?[0-9.]+)%\))?/i,
      /\$?\s*([0-9.,]+)\s*proceeds\s+per\s+(?:paying\s+)?user/i,
      /proceeds\s+per\s+(?:paying\s+)?user\s*\n\s*(?:\?)?\s*\n\s*\$?\s*([0-9.,]+)(?:\s*\n\s*([+-]?[0-9.]+)%)?/i
    ],
    sessionsPerDevice: [
      /sessions\s+per\s+(?:active\s+)?device\s*:?\s*(?:\?)?\s*([0-9.,]+)(?:\s*\(([+-]?[0-9.]+)%\))?/i,
      /([0-9.,]+)\s*sessions\s+per\s+(?:active\s+)?device/i,
      /sessions\s+per\s+(?:active\s+)?device\s*\n\s*(?:\?)?\s*\n\s*([0-9.,]+)(?:\s*\n\s*([+-]?[0-9.]+)%)?/i
    ],
    crashes: [
      /crashes\s*:?\s*(?:\?)?\s*([0-9.,kmb]+)(?:\s*\(([+-]?[0-9.]+)%\))?/i,
      /([0-9.,kmb]+)\s*crashes/i,
      /crashes\s*\n\s*(?:\?)?\s*\n\s*([0-9.,kmb]+)(?:\s*\n\s*([+-]?[0-9.]+)%)?/i
    ],
    dateRange: [
      /date\s+range\s*:?\s*([^,;\n]+)/i,
      /period\s*:?\s*([^,;\n]+)/i,
      /([a-z]+\s+\d+\s*[-–]\s*[a-z]+\s+\d+(?:,\s*\d{4})?)/i
    ]
  };
  
  /**
   * Extract metrics from App Store text
   */
  public extract(inputText: string, options: {
    allowPartialExtraction?: boolean;
    calculateDerivedMetrics?: boolean;
    multipleOccurrenceStrategy?: 'first' | 'last' | 'average';
  } = {}): {
    metrics: AppStoreMetrics;
    success: boolean;
    warnings: string[];
    metadata: {
      completeness: number;
      extractionTime: number;
      missingFields: string[];
      warnings: string[];
      overallConfidence: number;
    }
  } {
    const startTime = performance.now();
    const warnings: string[] = [];
    const metrics: AppStoreMetrics = {};
    const extractedValues: Record<string, number> = {};
    const missingFields: string[] = [];
    
    // Default options
    const {
      allowPartialExtraction = true,
      calculateDerivedMetrics = true,
      multipleOccurrenceStrategy = 'first'
    } = options;
    
    // Safety check for input
    if (!inputText || typeof inputText !== 'string') {
      warnings.push('Invalid input: empty or not a string');
      return {
        metrics: {},
        success: false,
        warnings,
        metadata: {
          completeness: 0,
          extractionTime: performance.now() - startTime,
          missingFields: Object.keys(this.patterns),
          warnings,
          overallConfidence: 0
        }
      };
    }
    
    // Normalize input for extraction
    const normalizedInput = this.normalizeInput(inputText);
    
    // Extract core metrics
    this.extractMetric('impressions', normalizedInput, metrics, extractedValues, missingFields, multipleOccurrenceStrategy);
    this.extractMetric('pageViews', normalizedInput, metrics, extractedValues, missingFields, multipleOccurrenceStrategy);
    this.extractMetric('conversionRate', normalizedInput, metrics, extractedValues, missingFields, multipleOccurrenceStrategy);
    this.extractMetric('downloads', normalizedInput, metrics, extractedValues, missingFields, multipleOccurrenceStrategy);
    this.extractMetric('proceeds', normalizedInput, metrics, extractedValues, missingFields, multipleOccurrenceStrategy);
    this.extractMetric('proceedsPerUser', normalizedInput, metrics, extractedValues, missingFields, multipleOccurrenceStrategy);
    this.extractMetric('sessionsPerDevice', normalizedInput, metrics, extractedValues, missingFields, multipleOccurrenceStrategy);
    this.extractMetric('crashes', normalizedInput, metrics, extractedValues, missingFields, multipleOccurrenceStrategy);
    
    // Extract date range
    this.extractDateRange(normalizedInput, metrics);
    
    // Calculate derived metrics if requested
    if (calculateDerivedMetrics) {
      this.calculateDerivedMetrics(metrics, extractedValues, warnings);
    }
    
    // Calculate completeness
    const totalFields = Object.keys(this.patterns).length - 1; // Exclude dateRange
    const extractedFields = totalFields - missingFields.length;
    const completeness = Math.round((extractedFields / totalFields) * 100);
    
    // Calculate overall confidence based on extracted metrics
    let totalConfidence = 0;
    let confidenceCount = 0;
    
    for (const key of Object.keys(metrics)) {
      const metric = metrics[key as keyof AppStoreMetrics];
      if (metric && typeof metric === 'object' && 'confidence' in metric) {
        totalConfidence += metric.confidence || 0;
        confidenceCount++;
      }
    }
    
    const overallConfidence = confidenceCount > 0 
      ? Math.round(totalConfidence / confidenceCount) 
      : 0;
    
    // Check if extraction is considered successful
    const success = allowPartialExtraction 
      ? completeness > 0 
      : completeness >= 70;
    
    // Cross-validate metrics consistency
    if (Object.keys(extractedValues).length > 1) {
      const consistencyResult = validateMetricsConsistency(extractedValues);
      
      if (consistencyResult.warnings.length > 0) {
        warnings.push(...consistencyResult.warnings);
      }
    }
    
    // Create metadata
    const metadata = {
      completeness,
      extractionTime: Math.round(performance.now() - startTime),
      missingFields,
      warnings,
      overallConfidence
    };
    
    // Set metadata on the metrics object
    metrics.metadata = metadata;
    
    return {
      metrics,
      success,
      warnings,
      metadata
    };
  }
  
  /**
   * Normalize input text for consistent extraction
   */
  private normalizeInput(input: string): string {
    return input
      .replace(/\r\n/g, '\n')  // Normalize newlines
      .replace(/\n{3,}/g, '\n\n')  // Reduce excessive newlines
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .replace(/(\d),(\d)/g, '$1$2')  // Remove commas from numbers
      .trim();
  }
  
  /**
   * Extract a specific metric from input text
   */
  private extractMetric(
    metricKey: string,
    input: string,
    result: AppStoreMetrics,
    extractedValues: Record<string, number>,
    missingFields: string[],
    multipleOccurrenceStrategy: 'first' | 'last' | 'average'
  ): void {
    const patterns = this.patterns[metricKey as keyof typeof this.patterns];
    if (!patterns) return;
    
    const matches: Array<{ value: number, change: number, index: number }> = [];
    
    // Try all patterns
    for (const pattern of patterns) {
      const matchIterator = input.matchAll(new RegExp(pattern, 'gi'));
      
      for (const match of matchIterator) {
        if (match && match[1]) {
          let value: number;
          
          // Special handling for conversion rate (already percentage)
          if (metricKey === 'conversionRate') {
            value = parseFloat(match[1].replace(/,/g, ''));
          } else {
            value = parseNumericValue(match[1]);
          }
          
          // Extract change value
          let change = 0;
          if (match[2]) {
            change = parsePercentageChange(match[2]);
          }
          
          // Only add valid values
          if (!isNaN(value) && value > 0) {
            matches.push({ 
              value, 
              change, 
              index: match.index || 0
            });
          }
        }
      }
    }
    
    // Handle multiple occurrences based on strategy
    if (matches.length > 0) {
      let finalValue: number;
      let finalChange: number;
      
      if (matches.length === 1 || multipleOccurrenceStrategy === 'first') {
        // Use the first match
        finalValue = matches[0].value;
        finalChange = matches[0].change;
      } else if (multipleOccurrenceStrategy === 'last') {
        // Use the last match
        finalValue = matches[matches.length - 1].value;
        finalChange = matches[matches.length - 1].change;
      } else if (multipleOccurrenceStrategy === 'average') {
        // Average all matches
        finalValue = matches.reduce((sum, m) => sum + m.value, 0) / matches.length;
        finalChange = matches.reduce((sum, m) => sum + m.change, 0) / matches.length;
      } else {
        // Default to first
        finalValue = matches[0].value;
        finalChange = matches[0].change;
      }
      
      // Validate the extracted value
      const validation = validateMetricValue(metricKey, finalValue);
      
      // Create the metric object
      const metric: BaseMetric = {
        value: finalValue,
        change: finalChange,
        confidence: validation.confidence,
        warnings: validation.warnings,
        extracted: true,
        calculated: false
      };
      
      // Add to extracted values for cross-validation
      extractedValues[metricKey] = finalValue;
      
      // Set the metric on the result object
      (result as any)[metricKey] = metric;
    } else {
      missingFields.push(metricKey);
    }
  }
  
  /**
   * Extract date range from input text
   */
  private extractDateRange(input: string, result: AppStoreMetrics): void {
    const patterns = this.patterns.dateRange;
    
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        result.dateRange = match[1].trim();
        return;
      }
    }
  }
  
  /**
   * Calculate derived metrics where possible
   */
  private calculateDerivedMetrics(
    metrics: AppStoreMetrics,
    extractedValues: Record<string, number>,
    warnings: string[]
  ): void {
    // Calculate conversion rate if missing but we have impressions and downloads
    if (!metrics.conversionRate && extractedValues.impressions && extractedValues.downloads) {
      const calculatedRate = (extractedValues.downloads / extractedValues.impressions) * 100;
      
      // Validate the calculated value
      const validation = validateMetricValue('conversionRate', calculatedRate);
      
      // Only use calculated value if it's reasonable
      if (validation.confidence > 50) {
        metrics.conversionRate = {
          value: calculatedRate,
          change: 0, // We don't know the change
          confidence: validation.confidence * 0.8, // Lower confidence for calculated value
          warnings: [...validation.warnings, 'Calculated from impressions and downloads'],
          extracted: false,
          calculated: true
        };
        
        // Update extracted values for cross-validation
        extractedValues.conversionRate = calculatedRate;
      } else {
        warnings.push('Calculated conversion rate was invalid: ' + calculatedRate.toFixed(2) + '%');
      }
    }
    
    // Add more derived metrics as needed
  }
  
  /**
   * Validate the extracted metrics
   */
  public validate(metrics: AppStoreMetrics): boolean {
    try {
      // Use Zod to validate against schema
      AppStoreMetricsSchema.parse(metrics);
      return true;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  }
}
