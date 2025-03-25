
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
  };
}
