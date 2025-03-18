
import { ExtractionPipeline, PipelineConfig } from './ExtractionPipeline';
import { AppStoreExtractor } from './AppStoreExtractor';
import { ProcessedAnalytics } from '../types';
import { BaseExtractor, ExtractionResult } from './BaseExtractor';

/**
 * Service to manage and coordinate data extraction
 */
export class ExtractorService {
  private static instance: ExtractorService;
  private appStorePipeline: ExtractionPipeline<ProcessedAnalytics>;
  
  /**
   * Create a new extractor service with default extractors
   */
  private constructor() {
    // Initialize pipeline with appropriate config
    const pipelineConfig: PipelineConfig = {
      debug: process.env.NODE_ENV !== 'production',
      stopOnFirstSuccess: true,
      runValidation: true
    };
    
    // Create the pipeline
    this.appStorePipeline = new ExtractionPipeline<ProcessedAnalytics>(pipelineConfig);
    
    // Register default extractors
    this.appStorePipeline.registerExtractor(new AppStoreExtractor());
    
    console.log('[ExtractorService] Initialized with default extractors');
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): ExtractorService {
    if (!ExtractorService.instance) {
      ExtractorService.instance = new ExtractorService();
    }
    return ExtractorService.instance;
  }
  
  /**
   * Process App Store data and extract metrics
   */
  public processAppStoreData(input: string): ExtractionResult<ProcessedAnalytics> {
    console.log('[ExtractorService] Processing App Store data');
    return this.appStorePipeline.process(input);
  }
  
  /**
   * Register a custom App Store extractor
   */
  public registerAppStoreExtractor(extractor: BaseExtractor<ProcessedAnalytics>): void {
    this.appStorePipeline.registerExtractor(extractor);
    console.log(`[ExtractorService] Registered new App Store extractor: ${extractor.name}`);
  }
  
  /**
   * Get all registered App Store extractors
   */
  public getAppStoreExtractors(): BaseExtractor<ProcessedAnalytics>[] {
    return this.appStorePipeline.getExtractors();
  }
}

// Export a singleton instance
export const extractorService = ExtractorService.getInstance();
