
/**
 * Configuration options for extractors
 */
export interface ExtractorConfig {
  debug?: boolean;
  preprocess?: (input: string) => string;
  validate?: (data: any) => boolean;
  stopOnFirstSuccess?: boolean;
  runValidation?: boolean;
  trackPerformance?: boolean;
}

/**
 * Base extractor interface for consistent implementation
 */
export interface BaseExtractor<T> {
  /**
   * Unique identifier for the extractor
   */
  id: string;
  
  /**
   * Human-readable name for the extractor
   */
  name: string;
  
  /**
   * Priority level (higher number = higher priority)
   */
  priority: number;
  
  /**
   * Base confidence level (0-1)
   */
  confidence: number;
  
  /**
   * Extract data from text input
   * @param input The raw text to extract from
   * @returns Extracted data or null if extraction failed
   */
  extract(input: string): T | null;
  
  /**
   * Optional validate method for the extractor
   * @param data The data to validate
   * @returns True if valid, false otherwise
   */
  validate?: (data: T) => boolean;
}

/**
 * Standard extraction result format
 */
export interface ExtractionResult<T> {
  success: boolean;
  data: T | null;
  error?: string;
  metadata?: {
    confidence: number;
    extractedFields: string[];
    missingFields: string[];
    warnings: string[];
    extractorId?: string;
    executionTime?: number;
    preprocessingTime?: number;
    validationTime?: number;
    mergedFrom?: string[];
    fieldSources?: Record<string, string>;
    totalExtractors?: number;
    calculatedFields?: string[];
  };
}
