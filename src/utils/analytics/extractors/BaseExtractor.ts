
/**
 * Base interface for all data extractors
 */
export interface BaseExtractor<T> {
  /** Unique identifier for this extractor */
  id: string;
  
  /** Human-readable name of this extractor */
  name: string;
  
  /** Extracts data from the input */
  extract: (input: string) => T | null;
  
  /** Priority for this extractor (higher runs first) */
  priority: number;
  
  /** Confidence level of this extractor (0-1) */
  confidence?: number;
  
  /** Optional validation function */
  validate?: (result: T) => boolean;
}

/**
 * Base configuration for extractors
 */
export interface ExtractorConfig {
  /** Whether to log detailed extraction info */
  debug?: boolean;
  
  /** Custom preprocessing function */
  preprocess?: (input: string) => string;
  
  /** Custom validation function */
  validate?: (result: any) => boolean;
}

/**
 * Result of the extraction process
 */
export interface ExtractionResult<T> {
  /** The extracted data */
  data: T | null;
  
  /** Whether the extraction was successful */
  success: boolean;
  
  /** Error message if extraction failed */
  error?: string;
  
  /** Metadata about the extraction process */
  metadata?: {
    /** ID of the extractor that produced this result */
    extractorId: string;
    
    /** Time taken for extraction in ms */
    executionTime: number;
    
    /** Preprocessing time in ms */
    preprocessingTime?: number;
    
    /** Validation time in ms */
    validationTime?: number;
    
    /** Confidence score (0-1) */
    confidence?: number;
  };
}
