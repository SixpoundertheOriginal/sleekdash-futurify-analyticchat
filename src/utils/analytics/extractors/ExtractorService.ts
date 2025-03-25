
import { ProcessedAnalytics } from "../types";
import { AppStoreMetricsExtractor } from "./MetricsExtractor";
import { hasValidMetrics } from "../validation";

/**
 * Result of app store data processing
 */
interface AppStoreProcessingResult {
  success: boolean;
  data: Partial<ProcessedAnalytics> | null;
  warnings: string[];
  metadata?: {
    completeness: number;
    extractionTime: number;
    extractorUsed: string;
    overallConfidence: number;
  };
  error?: string;
}

/**
 * Service to coordinate extraction from multiple sources
 */
export class ExtractorService {
  private metricExtractor: AppStoreMetricsExtractor;
  
  constructor() {
    this.metricExtractor = new AppStoreMetricsExtractor();
  }
  
  /**
   * Process App Store data into a structured format
   */
  processAppStoreData(inputText: string, options = {}): AppStoreProcessingResult {
    try {
      if (!inputText) {
        return {
          success: false,
          data: null,
          warnings: ['Empty input provided'],
          error: 'No data to process'
        };
      }
      
      console.log(`[ExtractorService] Processing App Store data, length: ${inputText.length}`);
      
      // Extract metrics using the App Store extractor
      const extractionResult = this.metricExtractor.extract(inputText, {
        allowPartialExtraction: true,
        calculateDerivedMetrics: true,
        multipleOccurrenceStrategy: 'first'
      });
      
      // When we have extracted metrics, convert to our standard format
      if (extractionResult.success && extractionResult.metrics) {
        const processedData = this.convertToProcessedAnalytics(extractionResult.metrics);
        
        // Validate if we have enough metrics for visualization
        if (hasValidMetrics(processedData)) {
          return {
            success: true,
            data: processedData,
            warnings: extractionResult.warnings,
            metadata: {
              completeness: extractionResult.metadata.completeness,
              extractionTime: extractionResult.metadata.extractionTime,
              extractorUsed: 'AppStoreMetricsExtractor',
              overallConfidence: extractionResult.metadata.overallConfidence
            }
          };
        } else {
          return {
            success: false,
            data: processedData, // Still return the data, even if incomplete
            warnings: [...extractionResult.warnings, 'Insufficient metrics for visualization'],
            metadata: {
              completeness: extractionResult.metadata.completeness,
              extractionTime: extractionResult.metadata.extractionTime,
              extractorUsed: 'AppStoreMetricsExtractor', 
              overallConfidence: extractionResult.metadata.overallConfidence
            },
            error: 'Extracted data does not contain minimum required metrics'
          };
        }
      }
      
      return {
        success: false,
        data: null,
        warnings: extractionResult.warnings,
        error: 'Failed to extract sufficient metrics'
      };
    } catch (error) {
      console.error('[ExtractorService] Error processing data:', error);
      return {
        success: false,
        data: null,
        warnings: ['Unexpected error during extraction'],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Convert extracted metrics to our standard analytics format
   */
  private convertToProcessedAnalytics(metrics: any): ProcessedAnalytics {
    // Create the base structure
    const result: ProcessedAnalytics = {
      summary: {
        title: "App Store Analytics",
        dateRange: metrics.dateRange || "Unknown date range",
        executiveSummary: "Metrics extracted directly from App Store data."
      },
      acquisition: {
        impressions: { 
          value: metrics.impressions?.value || 0,
          change: metrics.impressions?.change || 0 
        },
        pageViews: { 
          value: metrics.pageViews?.value || 0,
          change: metrics.pageViews?.change || 0 
        },
        conversionRate: { 
          value: metrics.conversionRate?.value || 0,
          change: metrics.conversionRate?.change || 0 
        },
        downloads: { 
          value: metrics.downloads?.value || 0,
          change: metrics.downloads?.change || 0 
        },
        funnelMetrics: {
          impressionsToViews: 0,
          viewsToDownloads: 0
        }
      },
      financial: {
        proceeds: { 
          value: metrics.proceeds?.value || 0,
          change: metrics.proceeds?.change || 0 
        },
        proceedsPerUser: { 
          value: metrics.proceedsPerUser?.value || 0,
          change: metrics.proceedsPerUser?.change || 0 
        },
        derivedMetrics: {
          arpd: 0,
          revenuePerImpression: 0,
          monetizationEfficiency: 0,
          payingUserPercentage: 0
        }
      },
      engagement: {
        sessionsPerDevice: { 
          value: metrics.sessionsPerDevice?.value || 0,
          change: metrics.sessionsPerDevice?.change || 0 
        },
        retention: {
          day1: { value: 0, benchmark: 0 },
          day7: { value: 0, benchmark: 0 }
        }
      },
      technical: {
        crashes: { 
          value: metrics.crashes?.value || 0,
          change: metrics.crashes?.change || 0 
        },
        crashRate: { value: 0, percentile: "" },
        crashFreeUsers: { value: 0, change: 0 }
      },
      geographical: {
        markets: [],
        devices: [],
        sources: []
      }
    };
    
    // Calculate derived metrics if we have the necessary data
    
    // Funnel metrics
    if (result.acquisition.impressions.value > 0 && result.acquisition.pageViews.value > 0) {
      result.acquisition.funnelMetrics.impressionsToViews = 
        (result.acquisition.pageViews.value / result.acquisition.impressions.value) * 100;
    }
    
    if (result.acquisition.pageViews.value > 0 && result.acquisition.downloads.value > 0) {
      result.acquisition.funnelMetrics.viewsToDownloads = 
        (result.acquisition.downloads.value / result.acquisition.pageViews.value) * 100;
    }
    
    // Financial derived metrics
    if (result.financial.proceeds.value > 0 && result.acquisition.downloads.value > 0) {
      result.financial.derivedMetrics.arpd = 
        result.financial.proceeds.value / result.acquisition.downloads.value;
    }
    
    if (result.financial.proceeds.value > 0 && result.acquisition.impressions.value > 0) {
      result.financial.derivedMetrics.revenuePerImpression = 
        result.financial.proceeds.value / result.acquisition.impressions.value;
    }
    
    // Technical derived metrics
    if (result.technical.crashes.value > 0 && result.acquisition.downloads.value > 0) {
      // Estimate crash rate per download (a rough proxy for active users)
      result.technical.crashRate.value = 
        (result.technical.crashes.value / result.acquisition.downloads.value) * 100;
      
      // Set percentile based on crash rate
      if (result.technical.crashRate.value < 0.1) {
        result.technical.crashRate.percentile = "Top 10%";
      } else if (result.technical.crashRate.value < 0.5) {
        result.technical.crashRate.percentile = "Top 25%";
      } else if (result.technical.crashRate.value < 1) {
        result.technical.crashRate.percentile = "Average";
      } else {
        result.technical.crashRate.percentile = "Below Average";
      }
      
      // Estimate crash-free users percentage (simplified)
      result.technical.crashFreeUsers.value = 100 - Math.min(result.technical.crashRate.value * 10, 100);
    } else {
      // If no crashes reported, assume high crash-free rate
      result.technical.crashFreeUsers.value = 99.5;
    }
    
    return result;
  }
}

// Create a singleton instance
export const extractorService = new ExtractorService();
