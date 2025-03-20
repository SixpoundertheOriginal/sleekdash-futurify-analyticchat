
import { MetricsProcessor } from '../MetricsProcessor';
import { MetricsRegistry } from '../MetricsRegistry';
import { metricExtractors } from '@/utils/analytics/extractors';
import { ProcessedAnalytics } from '@/utils/analytics/types';
import { MetricProcessorResult } from '../MetricsProcessor';

/**
 * Adapter to convert App Store metrics to the standardized format
 * and register them with the MetricsRegistry
 */
export function registerAppStoreMetrics(
  analytics: Partial<ProcessedAnalytics>,
  options: { source?: string; confidence?: number } = {}
): void {
  if (!analytics) return;
  
  const registry = MetricsRegistry.getInstance();
  const processor = new MetricsProcessor('appStore', metricExtractors);
  const standardizedMetrics: Record<string, MetricProcessorResult> = {};
  
  // Process acquisition metrics
  if (analytics.acquisition) {
    // Convert each metric to standardized format
    if (analytics.acquisition.downloads?.value !== undefined) {
      standardizedMetrics['downloads'] = {
        value: analytics.acquisition.downloads.value,
        rawValue: analytics.acquisition.downloads.value,
        formatted: processor.formatValue('downloads', analytics.acquisition.downloads.value),
        change: analytics.acquisition.downloads.change,
        metadata: {
          domain: 'appStore',
          category: 'acquisition',
          metricKey: 'downloads',
          ...options
        }
      };
    }
    
    if (analytics.acquisition.impressions?.value !== undefined) {
      standardizedMetrics['impressions'] = {
        value: analytics.acquisition.impressions.value,
        rawValue: analytics.acquisition.impressions.value,
        formatted: processor.formatValue('impressions', analytics.acquisition.impressions.value),
        change: analytics.acquisition.impressions.change,
        metadata: {
          domain: 'appStore',
          category: 'acquisition',
          metricKey: 'impressions',
          ...options
        }
      };
    }
    
    if (analytics.acquisition.pageViews?.value !== undefined) {
      standardizedMetrics['pageViews'] = {
        value: analytics.acquisition.pageViews.value,
        rawValue: analytics.acquisition.pageViews.value,
        formatted: processor.formatValue('pageViews', analytics.acquisition.pageViews.value),
        change: analytics.acquisition.pageViews.change,
        metadata: {
          domain: 'appStore',
          category: 'acquisition',
          metricKey: 'pageViews',
          ...options
        }
      };
    }
    
    if (analytics.acquisition.conversionRate?.value !== undefined) {
      standardizedMetrics['conversionRate'] = {
        value: analytics.acquisition.conversionRate.value,
        rawValue: analytics.acquisition.conversionRate.value,
        formatted: processor.formatValue('conversionRate', analytics.acquisition.conversionRate.value),
        change: analytics.acquisition.conversionRate.change,
        metadata: {
          domain: 'appStore',
          category: 'acquisition',
          metricKey: 'conversionRate',
          ...options
        }
      };
    }
  }
  
  // Process financial metrics
  if (analytics.financial) {
    if (analytics.financial.proceeds?.value !== undefined) {
      standardizedMetrics['proceeds'] = {
        value: analytics.financial.proceeds.value,
        rawValue: analytics.financial.proceeds.value,
        formatted: processor.formatValue('proceeds', analytics.financial.proceeds.value),
        change: analytics.financial.proceeds.change,
        metadata: {
          domain: 'appStore',
          category: 'financial',
          metricKey: 'proceeds',
          ...options
        }
      };
    }
  }
  
  // Process technical metrics
  if (analytics.technical) {
    if (analytics.technical.crashes?.value !== undefined) {
      standardizedMetrics['crashes'] = {
        value: analytics.technical.crashes.value,
        rawValue: analytics.technical.crashes.value,
        formatted: processor.formatValue('crashes', analytics.technical.crashes.value),
        change: analytics.technical.crashes.change,
        metadata: {
          domain: 'appStore',
          category: 'technical',
          metricKey: 'crashes',
          ...options
        }
      };
    }
  }
  
  // Register all standardized metrics with the registry
  registry.registerMetrics('appStore', standardizedMetrics);
  
  console.log(`[AppStoreAdapter] Registered ${Object.keys(standardizedMetrics).length} metrics with registry`);
}
