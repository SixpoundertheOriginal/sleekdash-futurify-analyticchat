
import { AppStoreExtractor } from './AppStoreExtractor';
import { ProcessedAnalytics } from '../types';

/**
 * Extraction result interface
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

/**
 * Service that orchestrates different extractors
 */
class ExtractorService {
  private extractors = [
    new AppStoreExtractor()
  ];
  
  /**
   * Process App Store data using available extractors
   * @param text Raw text input
   * @returns Extraction result with processed data or error
   */
  public processAppStoreData(text: string): ExtractionResult<Partial<ProcessedAnalytics>> {
    if (!text || typeof text !== 'string') {
      return {
        success: false,
        data: null,
        error: 'Invalid input: not a string or empty',
        metadata: {
          confidence: 0,
          extractedFields: [],
          missingFields: ['all'],
          warnings: ['Invalid input provided']
        }
      };
    }
    
    console.log('[ExtractorService] Processing App Store data, length:', text.length);
    
    try {
      // Find the most appropriate extractor by confidence
      let bestResult: ExtractionResult<Partial<ProcessedAnalytics>> | null = null;
      let highestConfidence = -1;
      
      for (const extractor of this.extractors) {
        try {
          console.log(`[ExtractorService] Trying extractor: ${extractor.name}`);
          
          const extractionData = extractor.extract(text);
          if (!extractionData) {
            console.log(`[ExtractorService] No data extracted by ${extractor.name}`);
            continue;
          }
          
          // Calculate confidence and completeness
          const confidence = this.calculateConfidence(extractionData);
          console.log(`[ExtractorService] Extraction confidence: ${confidence}%`);
          
          if (confidence > highestConfidence) {
            const extractedFields = this.getExtractedFieldsList(extractionData);
            const missingFields = this.getMissingFieldsList(extractionData);
            
            // Create extraction result
            bestResult = {
              success: true,
              data: extractionData,
              metadata: {
                confidence,
                extractedFields,
                missingFields,
                warnings: missingFields.length > 0 ? 
                  [`Missing ${missingFields.length} fields: ${missingFields.slice(0, 3).join(', ')}${missingFields.length > 3 ? '...' : ''}`] : 
                  []
              }
            };
            
            highestConfidence = confidence;
          }
        } catch (error) {
          console.error(`[ExtractorService] Error with extractor ${extractor.name}:`, error);
        }
      }
      
      if (bestResult) {
        return bestResult;
      }
      
      // No successful extraction
      return {
        success: false,
        data: null,
        error: 'No extractors were able to process the input',
        metadata: {
          confidence: 0,
          extractedFields: [],
          missingFields: ['all'],
          warnings: ['Could not extract any data from the input']
        }
      };
    } catch (error) {
      console.error('[ExtractorService] Error processing App Store data:', error);
      
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error during extraction',
        metadata: {
          confidence: 0,
          extractedFields: [],
          missingFields: ['all'],
          warnings: ['Exception during extraction process']
        }
      };
    }
  }
  
  /**
   * Calculate extraction confidence based on data completeness
   */
  private calculateConfidence(data: Partial<ProcessedAnalytics>): number {
    const requiredFields = [
      'acquisition.downloads.value',
      'acquisition.impressions.value',
      'acquisition.conversionRate.value',
      'financial.proceeds.value'
    ];
    
    const weightedFields = {
      // Acquisition metrics (40% weight)
      'acquisition.downloads.value': 15,
      'acquisition.impressions.value': 10,
      'acquisition.pageViews.value': 5,
      'acquisition.conversionRate.value': 10,
      
      // Financial metrics (30% weight)
      'financial.proceeds.value': 20,
      'financial.proceedsPerUser.value': 10,
      
      // Engagement metrics (15% weight)
      'engagement.sessionsPerDevice.value': 5,
      'engagement.retention.day1.value': 5,
      'engagement.retention.day7.value': 5,
      
      // Technical metrics (15% weight)
      'technical.crashes.value': 10,
      'technical.crashRate.value': 5
    };
    
    let totalWeight = 0;
    let filledWeight = 0;
    
    // Check presence of each field
    for (const [field, weight] of Object.entries(weightedFields)) {
      totalWeight += weight;
      
      const pathParts = field.split('.');
      let currentObj: any = data;
      
      // Navigate the object path
      let pathExists = true;
      for (const part of pathParts) {
        if (!currentObj || !currentObj[part]) {
          pathExists = false;
          break;
        }
        currentObj = currentObj[part];
      }
      
      // If path exists and value is not zero, add to filled weight
      if (pathExists && currentObj !== 0) {
        filledWeight += weight;
      }
    }
    
    // Calculate confidence percentage
    const confidence = totalWeight > 0 ? Math.round((filledWeight / totalWeight) * 100) : 0;
    
    // Penalize if any required fields are missing
    for (const requiredField of requiredFields) {
      const pathParts = requiredField.split('.');
      let currentObj: any = data;
      
      // Navigate the object path
      let pathExists = true;
      for (const part of pathParts) {
        if (!currentObj || !currentObj[part]) {
          pathExists = false;
          break;
        }
        currentObj = currentObj[part];
      }
      
      // Apply penalty for missing required field
      if (!pathExists || currentObj === 0) {
        return Math.max(confidence - 20, 0); // 20% penalty per missing required field
      }
    }
    
    return confidence;
  }
  
  /**
   * Get list of successfully extracted fields
   */
  private getExtractedFieldsList(data: Partial<ProcessedAnalytics>): string[] {
    const extractedFields: string[] = [];
    
    // Check acquisition metrics
    if (data.acquisition) {
      if (data.acquisition.impressions?.value) extractedFields.push('impressions');
      if (data.acquisition.pageViews?.value) extractedFields.push('pageViews');
      if (data.acquisition.conversionRate?.value) extractedFields.push('conversionRate');
      if (data.acquisition.downloads?.value) extractedFields.push('downloads');
    }
    
    // Check financial metrics
    if (data.financial) {
      if (data.financial.proceeds?.value) extractedFields.push('proceeds');
      if (data.financial.proceedsPerUser?.value) extractedFields.push('proceedsPerUser');
    }
    
    // Check engagement metrics
    if (data.engagement) {
      if (data.engagement.sessionsPerDevice?.value) extractedFields.push('sessionsPerDevice');
      if (data.engagement.retention?.day1?.value) extractedFields.push('retention.day1');
      if (data.engagement.retention?.day7?.value) extractedFields.push('retention.day7');
      if (data.engagement.retention?.day14?.value) extractedFields.push('retention.day14');
      if (data.engagement.retention?.day28?.value) extractedFields.push('retention.day28');
    }
    
    // Check technical metrics
    if (data.technical) {
      if (data.technical.crashes?.value) extractedFields.push('crashes');
      if (data.technical.crashRate?.value) extractedFields.push('crashRate');
    }
    
    // Check geographical metrics
    if (data.geographical) {
      if (data.geographical.markets?.length) extractedFields.push('markets');
      if (data.geographical.devices?.length) extractedFields.push('devices');
      if (data.geographical.sources?.length) extractedFields.push('sources');
    }
    
    return extractedFields;
  }
  
  /**
   * Get list of missing fields
   */
  private getMissingFieldsList(data: Partial<ProcessedAnalytics>): string[] {
    const missingFields: string[] = [];
    const allPossibleFields = [
      'impressions', 'pageViews', 'conversionRate', 'downloads',
      'proceeds', 'proceedsPerUser',
      'sessionsPerDevice', 'retention.day1', 'retention.day7',
      'crashes', 'crashRate',
      'markets', 'devices', 'sources'
    ];
    
    const extractedFields = this.getExtractedFieldsList(data);
    
    for (const field of allPossibleFields) {
      if (!extractedFields.includes(field)) {
        missingFields.push(field);
      }
    }
    
    return missingFields;
  }
}

// Export singleton instance
export const extractorService = new ExtractorService();
