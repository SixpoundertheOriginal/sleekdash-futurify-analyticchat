
import { MetricExtractor, normalizeValue } from "../analytics/metricTypes";
import { MetricType, MetricCategory, getMetricCategory } from "../analytics/offline/metricTypes";
import { formatMetricValue, formatPercentage, formatCurrency } from "./standardizedMetrics";

/**
 * Unified metrics processor for extracting, formatting, and managing metrics
 * across different domains (app analytics, keywords, etc.)
 */
export class MetricsProcessor {
  private extractors: Record<string, MetricExtractor> = {};
  private formatters: Record<string, (value: number) => string> = {};
  private domain: string;

  /**
   * Create a new MetricsProcessor for a specific domain
   * @param domain The domain name (e.g., 'appStore', 'keywords')
   * @param extractors Optional initial extractors to register
   */
  constructor(domain: string, extractors?: Record<string, MetricExtractor>) {
    this.domain = domain;
    
    if (extractors) {
      this.registerExtractors(extractors);
    }
    
    // Register default formatters
    this.registerFormatter('default', (value: number) => formatMetricValue(value));
    this.registerFormatter('percentage', (value: number) => formatPercentage(value));
    this.registerFormatter('currency', (value: number) => formatCurrency(value));
  }

  /**
   * Register metric extractors for this domain
   * @param extractors Object containing metric extractors
   */
  registerExtractors(extractors: Record<string, MetricExtractor>): void {
    this.extractors = { ...this.extractors, ...extractors };
    console.log(`[MetricsProcessor:${this.domain}] Registered ${Object.keys(extractors).length} extractors`);
  }

  /**
   * Register a custom formatter for metrics
   * @param name The name of the formatter
   * @param formatter The formatter function
   */
  registerFormatter(name: string, formatter: (value: number) => string): void {
    this.formatters[name] = formatter;
  }

  /**
   * Extract metrics from text content
   * @param content The text content to extract metrics from
   * @param options Optional extraction options
   * @returns Extracted metrics with metadata
   */
  extractMetrics(content: string, options: { addMetadata?: boolean } = {}): Record<string, MetricProcessorResult> {
    if (!content) return {};
    
    console.log(`[MetricsProcessor:${this.domain}] Extracting metrics from content (${content.length} chars)`);
    
    const metrics: Record<string, MetricProcessorResult> = {};
    const rawValues: Record<string, number | null> = {};
    
    // Extract primary values using registered extractors
    for (const [metricKey, extractor] of Object.entries(this.extractors)) {
      const value = extractor.extractValue(content);
      rawValues[metricKey] = value;
      
      if (value !== null) {
        metrics[metricKey] = {
          value,
          rawValue: value,
          formatted: this.formatValue(metricKey, value)
        };
        
        if (options.addMetadata) {
          metrics[metricKey].metadata = {
            domain: this.domain,
            timestamp: Date.now(),
            metricKey
          };
        }
      }
    }
    
    // Try to fill in missing metrics using relationships
    let calculatedAtLeastOne = true;
    const iterations = 0;
    const maxIterations = 3; // Prevent infinite loops
    
    while (calculatedAtLeastOne && iterations < maxIterations) {
      calculatedAtLeastOne = false;
      
      for (const [metricKey, extractor] of Object.entries(this.extractors)) {
        if (rawValues[metricKey] === null && extractor.calculateFromOthers) {
          const calculatedValue = extractor.calculateFromOthers(rawValues);
          
          if (calculatedValue !== null) {
            rawValues[metricKey] = calculatedValue;
            
            metrics[metricKey] = {
              value: calculatedValue,
              rawValue: calculatedValue,
              formatted: this.formatValue(metricKey, calculatedValue),
              derived: true
            };
            
            if (options.addMetadata) {
              metrics[metricKey].metadata = {
                domain: this.domain,
                timestamp: Date.now(),
                metricKey,
                derived: true
              };
            }
            
            calculatedAtLeastOne = true;
            console.log(`[MetricsProcessor:${this.domain}] Calculated missing ${metricKey}: ${calculatedValue}`);
          }
        }
      }
    }
    
    return metrics;
  }

  /**
   * Format a metric value using the appropriate formatter
   * @param metricKey The metric key
   * @param value The value to format
   * @returns Formatted string representation
   */
  formatValue(metricKey: string, value: number): string {
    const extractor = this.extractors[metricKey];
    
    if (extractor && extractor.formatter) {
      return extractor.formatter(value);
    }
    
    // Try to determine the appropriate formatter based on the metric name
    if (metricKey.includes('rate') || metricKey.includes('percentage')) {
      return this.formatters.percentage(value);
    } else if (metricKey.includes('revenue') || metricKey.includes('proceeds')) {
      return this.formatters.currency(value);
    }
    
    return this.formatters.default(value);
  }
  
  /**
   * Get the domain name for this processor
   */
  getDomain(): string {
    return this.domain;
  }
}

/**
 * Result of metric processing with additional metadata
 */
export interface MetricProcessorResult {
  value: number;
  rawValue: number;
  formatted: string;
  change?: number;
  derived?: boolean;
  metadata?: {
    domain: string;
    timestamp: number;
    metricKey: string;
    category?: MetricCategory;
    derived?: boolean;
    source?: string;
    confidence?: number;
  };
}

/**
 * Options for registering metrics with the registry
 */
export interface MetricRegistrationOptions {
  /** The source of the metric (e.g., 'direct-extraction', 'ai-analysis') */
  source?: string;
  /** Confidence level in the accuracy of the metric (0-1) */
  confidence?: number;
  /** Add structured metadata to the metric */
  addMetadata?: boolean;
  /** Whether to overwrite existing metrics with the same key */
  overwrite?: boolean;
}
