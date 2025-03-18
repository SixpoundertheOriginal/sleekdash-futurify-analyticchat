
import { ProcessedAnalytics } from "@/utils/analytics/types";

export interface ValidationResult {
  isValid: boolean;
  severity: 'low' | 'medium' | 'high';
  warnings: string[];
  missingRequiredFields: string[];
  suspiciousValues: Array<{ field: string, value: any, reason: string }>;
  confidence: number;
}

export function useAnalyticsValidation() {
  /**
   * Validates analytics data for completeness and data quality
   */
  const validateAnalytics = (data: ProcessedAnalytics): ValidationResult => {
    if (!data) {
      return {
        isValid: false,
        severity: 'high',
        warnings: ['No analytics data provided'],
        missingRequiredFields: ['All data'],
        suspiciousValues: [],
        confidence: 0
      };
    }

    const warnings: string[] = [];
    const missingRequiredFields: string[] = [];
    const suspiciousValues: Array<{ field: string, value: any, reason: string }> = [];
    
    // Check for required acquisition metrics
    if (!data.acquisition || !data.acquisition.downloads) {
      missingRequiredFields.push('acquisition.downloads');
      warnings.push('Downloads data is required for acquisition analysis');
    }
    
    if (!data.acquisition || !data.acquisition.impressions) {
      missingRequiredFields.push('acquisition.impressions');
    }
    
    // Check for required financial metrics
    if (!data.financial || !data.financial.proceeds) {
      missingRequiredFields.push('financial.proceeds');
      warnings.push('Proceeds data is required for financial analysis');
    }
    
    // Check for required engagement metrics
    if (!data.engagement || !data.engagement.sessionsPerDevice) {
      missingRequiredFields.push('engagement.sessionsPerDevice');
    }
    
    // Validate data consistency
    if (data.acquisition && data.acquisition.downloads && data.financial && data.financial.proceeds) {
      const proceeds = data.financial.proceeds.value;
      const downloads = data.acquisition.downloads.value;
      
      // Validate proceeds per download is reasonable (not too high or too low)
      if (proceeds > 0 && downloads > 0) {
        const proceedsPerDownload = proceeds / downloads;
        
        if (proceedsPerDownload > 100) {
          suspiciousValues.push({
            field: 'proceedsPerDownload',
            value: proceedsPerDownload,
            reason: 'Unusually high revenue per download (>$100)'
          });
          warnings.push('Unusually high revenue per download detected');
        }
        
        if (proceedsPerDownload < 0.01 && proceeds > 1000) {
          suspiciousValues.push({
            field: 'proceedsPerDownload',
            value: proceedsPerDownload,
            reason: 'Unusually low revenue per download (<$0.01) with high overall revenue'
          });
          warnings.push('Unusually low revenue per download with high overall revenue');
        }
      }
    }
    
    // Validate conversion rate is reasonable
    if (data.acquisition && data.acquisition.conversionRate) {
      const conversionRate = data.acquisition.conversionRate.value;
      
      if (conversionRate > 50) {
        suspiciousValues.push({
          field: 'acquisition.conversionRate',
          value: conversionRate,
          reason: 'Conversion rate over 50% is unusually high'
        });
        warnings.push('Conversion rate over 50% is unusually high');
      }
    }
    
    // Validate retention data makes sense (day1 > day7 > day14)
    if (data.engagement && data.engagement.retention) {
      const retention = data.engagement.retention;
      
      if (retention.day1 && retention.day7 && retention.day1.value < retention.day7.value) {
        suspiciousValues.push({
          field: 'engagement.retention',
          value: { day1: retention.day1.value, day7: retention.day7.value },
          reason: 'Day 7 retention higher than Day 1 retention'
        });
        warnings.push('Inconsistent retention data: Day 7 retention higher than Day 1');
      }
      
      if (retention.day7 && retention.day14 && retention.day7.value < retention.day14.value) {
        suspiciousValues.push({
          field: 'engagement.retention',
          value: { day7: retention.day7.value, day14: retention.day14.value },
          reason: 'Day 14 retention higher than Day 7 retention'
        });
        warnings.push('Inconsistent retention data: Day 14 retention higher than Day 7');
      }
    }
    
    // Geographical data validation
    if (data.geographical && data.geographical.markets) {
      const totalPercentage = data.geographical.markets.reduce(
        (sum, market) => sum + market.percentage, 0
      );
      
      if (totalPercentage < 95 || totalPercentage > 105) {
        suspiciousValues.push({
          field: 'geographical.markets',
          value: totalPercentage,
          reason: `Market percentages sum to ${totalPercentage.toFixed(1)}%, expected ~100%`
        });
        warnings.push(`Market percentages sum to ${totalPercentage.toFixed(1)}%, expected ~100%`);
      }
    }
    
    // Assess severity based on number and types of issues
    let severity: 'low' | 'medium' | 'high' = 'low';
    
    if (missingRequiredFields.length > 3 || suspiciousValues.length > 3) {
      severity = 'high';
    } else if (missingRequiredFields.length > 1 || suspiciousValues.length > 1) {
      severity = 'medium';
    }
    
    // Calculate confidence score (0-100)
    let confidence = 100;
    confidence -= missingRequiredFields.length * 10; // Deduct 10 points for each missing field
    confidence -= suspiciousValues.length * 15;     // Deduct 15 points for each suspicious value
    confidence = Math.max(0, Math.min(100, confidence)); // Clamp between 0-100
    
    return {
      isValid: missingRequiredFields.length === 0 && suspiciousValues.length === 0,
      severity,
      warnings,
      missingRequiredFields,
      suspiciousValues,
      confidence
    };
  };

  return {
    validateAnalytics
  };
}
