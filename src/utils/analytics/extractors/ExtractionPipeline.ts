
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
      stopOnFirstSuccess: false,
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
    
    // Store all successful extraction results
    const successfulResults: ExtractionResult<T>[] = [];
    let lastError = '';
    
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
        
        // Add successful result to our collection
        successfulResults.push({
          data,
          success: true,
          metadata: {
            extractorId: extractor.id,
            executionTime: extractionTime,
            preprocessingTime,
            validationTime,
            confidence: extractor.confidence || 0.8
          }
        });
        
        if (this.config.debug) {
          console.log(`[ExtractionPipeline] Successful extraction with ${extractor.name} in ${extractionTime}ms`);
        }
        
        // If configured to stop at first success, exit the loop
        if (this.config.stopOnFirstSuccess && successfulResults.length > 0) {
          break;
        }
      } catch (error) {
        if (this.config.debug) {
          console.error(`[ExtractionPipeline] Error in extractor ${extractor.name}:`, error);
        }
        lastError = error instanceof Error ? error.message : String(error);
      }
    }
    
    // If we have successful results, merge them
    if (successfulResults.length > 0) {
      // Log how many successful extractions we found
      if (this.config.debug) {
        console.log(`[ExtractionPipeline] Found ${successfulResults.length} successful extractions to merge`);
      }
      
      // Merge all successful results
      const mergedResult = this.mergeResults(successfulResults);
      const endTime = this.config.trackPerformance ? performance.now() : 0;
      const totalTime = endTime - startTime;
      
      if (this.config.debug) {
        console.log(`[ExtractionPipeline] Merged ${successfulResults.length} successful extractions in ${totalTime}ms`);
        console.log(`[ExtractionPipeline] Final merged data:`, mergedResult.data);
      }
      
      return mergedResult;
    }
    
    // If we get here, all extractors failed
    return {
      data: null,
      success: false,
      error: lastError || 'All extractors failed to extract data'
    };
  }
  
  /**
   * Merge multiple extraction results into a single result
   * Prioritizes data from extractors with higher confidence
   */
  private mergeResults(results: ExtractionResult<T>[]): ExtractionResult<T> {
    if (results.length === 0) {
      return {
        data: null,
        success: false,
        error: 'No results to merge'
      };
    }
    
    if (results.length === 1) {
      return results[0];
    }
    
    // Sort results by confidence (highest first)
    results.sort((a, b) => {
      const confA = a.metadata?.confidence || 0;
      const confB = b.metadata?.confidence || 0;
      return confB - confA;
    });
    
    // Use the highest confidence result as the base
    const baseResult = results[0];
    const mergedData = { ...baseResult.data } as any;
    
    // Track which fields came from which extractor for debugging
    const fieldSources: Record<string, string> = {};
    const baseExtractorId = baseResult.metadata?.extractorId || 'unknown';
    
    // Add fields from base result
    if (baseResult.data) {
      Object.keys(baseResult.data as object).forEach(key => {
        fieldSources[key] = baseExtractorId;
      });
    }
    
    // Merge in data from other results, checking against existing data
    for (let i = 1; i < results.length; i++) {
      const result = results[i];
      const extractorId = result.metadata?.extractorId || `extractor-${i}`;
      const resultData = result.data as any;
      
      if (!resultData) continue;
      
      // For each field in this result
      Object.keys(resultData).forEach(key => {
        // If the field doesn't exist in merged data yet, add it
        if (mergedData[key] === undefined || mergedData[key] === null) {
          mergedData[key] = resultData[key];
          fieldSources[key] = extractorId;
        } 
        // If the field exists but is an object, recursively merge
        else if (typeof mergedData[key] === 'object' && mergedData[key] !== null && 
                 typeof resultData[key] === 'object' && resultData[key] !== null) {
          // Merge nested objects
          Object.keys(resultData[key]).forEach(nestedKey => {
            if (mergedData[key][nestedKey] === undefined || mergedData[key][nestedKey] === null) {
              mergedData[key][nestedKey] = resultData[key][nestedKey];
              fieldSources[`${key}.${nestedKey}`] = extractorId;
            }
          });
        }
        // Otherwise, leave existing value (from higher confidence extractor)
      });
    }
    
    // Calculate derived metrics if the data format supports it
    const derivedData = this.calculateDerivedMetrics(mergedData);
    
    // Create merged metadata
    const mergedMetadata = {
      ...baseResult.metadata,
      mergedFrom: results.map(r => r.metadata?.extractorId).filter(Boolean),
      fieldSources,
      totalExtractors: results.length,
      calculatedFields: Object.keys(derivedData).filter(k => !(k in mergedData))
    };
    
    return {
      data: derivedData as T,
      success: true,
      metadata: mergedMetadata
    };
  }
  
  /**
   * Calculate derived metrics based on extracted base metrics
   * This is a generic method that will be specialized by subclasses
   */
  protected calculateDerivedMetrics(data: any): any {
    // Default implementation just returns the data unchanged
    // Specialized pipelines will override this
    return data;
  }
  
  /**
   * Get a list of all registered extractors
   */
  getExtractors(): BaseExtractor<T>[] {
    return [...this.extractors];
  }
}
