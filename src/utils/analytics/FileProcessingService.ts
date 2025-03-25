import { extractorService } from './extractors/ExtractorService';
import { ProcessedAnalytics } from './types';
import { isAppStoreFormat } from './offline/appStoreFormatDetector';
import { createDefaultProcessedAnalytics } from '@/hooks/app-store/appStoreAnalyticsUtils';

/**
 * Service for processing various file formats
 */
export class FileProcessingService {
  /**
   * Process raw text that might be App Store data
   */
  public static processAppStoreText(text: string): string {
    if (!text || typeof text !== 'string') {
      console.log('[FileProcessingService] Invalid input: not a string or empty');
      return '';
    }
    
    console.log('[FileProcessingService] Processing App Store text, length:', text.length);
    
    // Check if this is valid App Store format
    if (!isAppStoreFormat(text)) {
      console.log('[FileProcessingService] Input does not appear to be App Store format');
      return '';
    }
    
    // Process the data through our extraction pipeline
    const result = extractorService.processAppStoreData(text);
    
    if (!result.success) {
      console.log('[FileProcessingService] Extraction failed:', result.error);
      return '';
    }
    
    // Ensure we have a complete ProcessedAnalytics object by merging with defaults
    const completeData = result.data 
      ? { ...createDefaultProcessedAnalytics(), ...result.data }
      : null;
    
    // Convert the extracted data to CSV format
    return this.convertToCsv(completeData);
  }
  
  /**
   * Convert processed analytics to CSV format
   */
  private static convertToCsv(data: ProcessedAnalytics | null): string {
    if (!data) return '';
    
    // Create CSV content
    let csvContent = "Metric,Value,Change\n";
    
    // Add acquisition metrics
    if (data.acquisition.impressions.value) {
      csvContent += `Impressions,${data.acquisition.impressions.value},${data.acquisition.impressions.change}%\n`;
    }
    
    if (data.acquisition.pageViews.value) {
      csvContent += `Product Page Views,${data.acquisition.pageViews.value},${data.acquisition.pageViews.change}%\n`;
    }
    
    if (data.acquisition.conversionRate.value) {
      csvContent += `Conversion Rate,${data.acquisition.conversionRate.value}%,${data.acquisition.conversionRate.change}%\n`;
    }
    
    if (data.acquisition.downloads.value) {
      csvContent += `Total Downloads,${data.acquisition.downloads.value},${data.acquisition.downloads.change}%\n`;
    }
    
    // Add financial metrics
    if (data.financial.proceeds.value) {
      csvContent += `Proceeds,${data.financial.proceeds.value},${data.financial.proceeds.change}%\n`;
    }
    
    if (data.financial.proceedsPerUser.value) {
      csvContent += `Proceeds per Paying User,${data.financial.proceedsPerUser.value},${data.financial.proceedsPerUser.change}%\n`;
    }
    
    // Add engagement metrics
    if (data.engagement.sessionsPerDevice.value) {
      csvContent += `Sessions per Active Device,${data.engagement.sessionsPerDevice.value},${data.engagement.sessionsPerDevice.change}%\n`;
    }
    
    // Add technical metrics
    if (data.technical.crashes.value) {
      csvContent += `Crashes,${data.technical.crashes.value},${data.technical.crashes.change}%\n`;
    }
    
    // Add date range
    if (data.summary.dateRange) {
      csvContent += `Date Range,${data.summary.dateRange},,\n`;
    }
    
    // Add territory data
    if (data.geographical.markets && data.geographical.markets.length > 0) {
      csvContent += "\nTerritory,Downloads,Percentage\n";
      data.geographical.markets.forEach(market => {
        csvContent += `${market.country},${market.downloads},${market.percentage}\n`;
      });
    }
    
    // Add device data
    if (data.geographical.devices && data.geographical.devices.length > 0) {
      csvContent += "\nDevice,Downloads,Percentage\n";
      data.geographical.devices.forEach(device => {
        csvContent += `${device.type},${device.count || 0},${device.percentage}\n`;
      });
    }
    
    // Add source data
    if (data.geographical.sources && data.geographical.sources.length > 0) {
      csvContent += "\nSource,Downloads,Percentage\n";
      data.geographical.sources.forEach(source => {
        csvContent += `${source.source},${source.downloads},${source.percentage}\n`;
      });
    }
    
    console.log('[FileProcessingService] Generated CSV content, length:', csvContent.length);
    return csvContent;
  }
}
