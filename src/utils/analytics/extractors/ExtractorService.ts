
import { ExtractionPipeline, PipelineConfig } from './ExtractionPipeline';
import { AppStoreExtractor } from './AppStoreExtractor';
import { KeywordExtractor } from './KeywordExtractor';
import { RetentionExtractor } from './RetentionExtractor';
import { GeographicalExtractor } from './GeographicalExtractor';
import { ProcessedAnalytics } from '../types';
import { BaseExtractor, ExtractionResult } from './BaseExtractor';
import { calculateDerivedMetrics } from '../offline/extractors/derivedMetricsCalculator';

/**
 * Specialized pipeline for App Store data with derived metrics calculation
 */
class AppStoreExtractionPipeline extends ExtractionPipeline<ProcessedAnalytics> {
  /**
   * Override to calculate App Store specific derived metrics
   */
  protected calculateDerivedMetrics(data: Partial<ProcessedAnalytics>): Partial<ProcessedAnalytics> {
    // Use the specialized calculator for App Store metrics
    return calculateDerivedMetrics(data);
  }
}

/**
 * Service to manage and coordinate data extraction
 */
export class ExtractorService {
  private static instance: ExtractorService;
  private appStorePipeline: AppStoreExtractionPipeline;
  
  /**
   * Create a new extractor service with default extractors
   */
  private constructor() {
    // Initialize pipeline with appropriate config
    const pipelineConfig: PipelineConfig = {
      debug: process.env.NODE_ENV !== 'production',
      stopOnFirstSuccess: false, // Explicitly set to false to ensure all extractors run
      runValidation: true
    };
    
    // Create the specialized pipeline
    this.appStorePipeline = new AppStoreExtractionPipeline(pipelineConfig);
    
    // Register default extractors
    this.appStorePipeline.registerExtractor(new AppStoreExtractor());
    this.appStorePipeline.registerExtractor(new KeywordExtractor());
    this.appStorePipeline.registerExtractor(new RetentionExtractor());
    this.appStorePipeline.registerExtractor(new GeographicalExtractor());
    
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
