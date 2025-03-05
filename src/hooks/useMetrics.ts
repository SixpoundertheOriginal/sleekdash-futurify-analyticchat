
import { useState, useEffect, useMemo } from 'react';
import { MetricsRegistry } from '@/utils/metrics/MetricsRegistry';
import { MetricsProcessor, MetricProcessorResult } from '@/utils/metrics/MetricsProcessor';
import { metricExtractors } from '@/utils/analytics/extractors';

/**
 * Hook for accessing and managing metrics across domains
 * @param domain The domain to access metrics for (default: 'global')
 * @returns Methods for interacting with metrics
 */
export function useMetrics(domain: string = 'global') {
  const registry = useMemo(() => MetricsRegistry.getInstance(), []);
  const [metrics, setMetrics] = useState<Record<string, MetricProcessorResult>>(registry.getMetrics(domain));
  
  // Create domain-specific processor if needed
  const processor = useMemo(() => {
    if (domain === 'appStore') {
      return new MetricsProcessor('appStore', metricExtractors);
    }
    return new MetricsProcessor(domain);
  }, [domain]);
  
  // Subscribe to changes in metrics for this domain
  useEffect(() => {
    const unsubscribe = registry.subscribe(domain, (updatedMetrics) => {
      setMetrics(updatedMetrics);
    });
    
    return unsubscribe;
  }, [registry, domain]);
  
  // Methods for interacting with metrics
  const registerMetrics = (newMetrics: Record<string, MetricProcessorResult>, options = {}) => {
    registry.registerMetrics(domain, newMetrics, options);
  };
  
  const extractAndRegister = (content: string, options = { addMetadata: true }) => {
    const extractedMetrics = processor.extractMetrics(content, options);
    registerMetrics(extractedMetrics);
    return extractedMetrics;
  };
  
  const getMetricValue = (key: string): number | null => {
    return metrics[key]?.value ?? null;
  };
  
  const getFormattedMetric = (key: string): string => {
    return metrics[key]?.formatted ?? 'N/A';
  };
  
  const getRelatedMetrics = (pattern: string | RegExp): Array<{ domain: string; key: string; metric: MetricProcessorResult }> => {
    return registry.findMetricsByPattern(pattern);
  };
  
  return {
    metrics,
    registerMetrics,
    extractAndRegister,
    getMetricValue,
    getFormattedMetric,
    getRelatedMetrics,
    processor,
    registry
  };
}
