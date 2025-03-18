
import { BaseExtractor, ExtractorConfig, ExtractionResult } from './BaseExtractor';

/**
 * Configuration options for the extraction pipeline
 */
export interface PipelineConfig extends ExtractorConfig {
  /** Whether to stop at first successful extraction */
  stopOnFirstSuccess?: boolean;
  
  /** Whether to run validations */
  runValidation?: boolean;
  
  /** Whether to track performance metrics */
  trackPerformance?: boolean;
}

/**
 * A unified pipeline for processing and extracting data
 */
export class ExtractionPipeline<T> {
  private extractors: BaseExtractor<T>[] = [];
  private config: PipelineConfig;
  
  constructor(config: PipelineConfig = {}) {
    this.config = {
      debug: false,
      stopOnFirstSuccess: true,
      runValidation: true,
      trackPerformance: true,
      ...config
    };
  }

  /**
   * Register an extractor with the pipeline
   */
  registerExtractor(extractor: BaseExtractor<T>): this {
    this.extractors.push(extractor);
    // Sort extractors by priority (higher first)
    this.extractors.sort((a, b) => b.priority - a.priority);
    
    if (this.config.debug) {
      console.log(`[ExtractionPipeline] Registered extractor: ${extractor.name} (priority: ${extractor.priority})`);
    }
    
    return this;
  }
  
  /**
   * Register multiple extractors at once
   */
  registerExtractors(extractors: BaseExtractor<T>[]): this {
    extractors.forEach(extractor => this.registerExtractor(extractor));
    return this;
  }
  
  /**
   * Preprocess the input text
   */
  private preprocess(input: string): string {
    if (!input) return '';
    
    const startTime = this.config.trackPerformance ? performance.now() : 0;
    
    // Apply custom preprocessing if provided
    let preprocessed = this.config.preprocess ? this.config.preprocess(input) : input;
    
    // Default preprocessing (can be skipped if custom preprocessing is provided)
    if (!this.config.preprocess) {
      preprocessed = preprocessed
        .replace(/\r\n/g, '\n')  // Normalize line breaks
        .replace(/\n{3,}/g, '\n\n')  // Reduce excessive line breaks
        .replace(/\s{2,}/g, ' ')  // Reduce multiple spaces
        .trim();
    }
    
    if (this.config.trackPerformance) {
      const endTime = performance.now();
      if (this.config.debug) {
        console.log(`[ExtractionPipeline] Preprocessing completed in ${endTime - startTime}ms`);
      }
    }
    
    return preprocessed;
  }
  
  /**
   * Process the input and extract data
   */
  process(input: string): ExtractionResult<T> {
    if (!input || typeof input !== 'string') {
      return {
        data: null,
        success: false,
        error: 'Invalid input: not a string or empty'
      };
    }
    
    const startTime = this.config.trackPerformance ? performance.now() : 0;
    const preprocessStartTime = startTime;
    
    // Preprocess the input
    const preprocessed = this.preprocess(input);
    
    const preprocessEndTime = this.config.trackPerformance ? performance.now() : 0;
    const preprocessingTime = preprocessEndTime - preprocessStartTime;
    
    if (this.config.debug) {
      console.log(`[ExtractionPipeline] Processing input (${input.length} chars)`);
      console.log(`[ExtractionPipeline] Preprocessing completed: ${preprocessingTime}ms`);
    }
    
    // Try each extractor in order
    for (const extractor of this.extractors) {
      const extractorStartTime = this.config.trackPerformance ? performance.now() : 0;
      
      try {
        if (this.config.debug) {
          console.log(`[ExtractionPipeline] Trying extractor: ${extractor.name}`);
        }
        
        // Extract data
        const data = extractor.extract(preprocessed);
        
        // Skip if extraction failed
        if (data === null) {
          if (this.config.debug) {
            console.log(`[ExtractionPipeline] Extractor ${extractor.name} returned null`);
          }
          continue;
        }
        
        const extractorEndTime = this.config.trackPerformance ? performance.now() : 0;
        const extractionTime = extractorEndTime - extractorStartTime;
        
        // Validate the result if needed
        let isValid = true;
        let validationTime = 0;
        
        if (this.config.runValidation) {
          const validationStartTime = this.config.trackPerformance ? performance.now() : 0;
          
          // Use extractor-specific validation or pipeline validation
          if (extractor.validate) {
            isValid = extractor.validate(data);
          } else if (this.config.validate) {
            isValid = this.config.validate(data);
          }
          
          if (this.config.trackPerformance) {
            const validationEndTime = performance.now();
            validationTime = validationEndTime - validationStartTime;
          }
          
          if (this.config.debug) {
            console.log(`[ExtractionPipeline] Validation result for ${extractor.name}: ${isValid}`);
          }
          
          if (!isValid) continue;
        }
        
        // If we get here, extraction was successful
        const endTime = this.config.trackPerformance ? performance.now() : 0;
        const totalTime = endTime - startTime;
        
        if (this.config.debug) {
          console.log(`[ExtractionPipeline] Successful extraction with ${extractor.name} in ${totalTime}ms`);
        }
        
        return {
          data,
          success: true,
          metadata: {
            extractorId: extractor.id,
            executionTime: extractionTime,
            preprocessingTime,
            validationTime,
            confidence: 1.0 // Default confidence
          }
        };
      } catch (error) {
        if (this.config.debug) {
          console.error(`[ExtractionPipeline] Error in extractor ${extractor.name}:`, error);
        }
        // Continue to the next extractor
      }
    }
    
    // If we get here, all extractors failed
    return {
      data: null,
      success: false,
      error: 'All extractors failed to extract data'
    };
  }
  
  /**
   * Get a list of all registered extractors
   */
  getExtractors(): BaseExtractor<T>[] {
    return [...this.extractors];
  }
}
