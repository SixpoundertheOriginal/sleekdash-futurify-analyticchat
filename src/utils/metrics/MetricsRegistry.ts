
import { MetricProcessorResult } from "./MetricsProcessor";

/**
 * Cross-domain metrics registry for sharing data between different domains
 * (keywords, app analytics, etc.)
 */
export class MetricsRegistry {
  private static instance: MetricsRegistry;
  private metrics: Record<string, Record<string, MetricProcessorResult>> = {};
  private observers: Record<string, Array<(metrics: Record<string, MetricProcessorResult>) => void>> = {};
  
  /**
   * Get the singleton instance of the registry
   */
  public static getInstance(): MetricsRegistry {
    if (!MetricsRegistry.instance) {
      MetricsRegistry.instance = new MetricsRegistry();
    }
    return MetricsRegistry.instance;
  }
  
  private constructor() {
    // Initialize domains
    this.metrics = {
      appStore: {},
      keywords: {},
      global: {}
    };
    
    this.observers = {
      appStore: [],
      keywords: [],
      global: []
    };
    
    console.log('[MetricsRegistry] Initialized cross-domain metrics registry');
  }
  
  /**
   * Register metrics for a specific domain
   * @param domain The domain to register metrics for
   * @param metrics The metrics to register
   * @param options Registration options
   */
  registerMetrics(
    domain: string, 
    metrics: Record<string, MetricProcessorResult>,
    options: { overwrite?: boolean, notifyObservers?: boolean } = { overwrite: true, notifyObservers: true }
  ): void {
    // Ensure domain exists
    if (!this.metrics[domain]) {
      this.metrics[domain] = {};
    }
    
    // Register metrics
    for (const [key, value] of Object.entries(metrics)) {
      if (options.overwrite || !this.metrics[domain][key]) {
        this.metrics[domain][key] = value;
      }
    }
    
    console.log(`[MetricsRegistry] Registered ${Object.keys(metrics).length} metrics for domain '${domain}'`);
    
    // Notify observers
    if (options.notifyObservers) {
      this.notifyObservers(domain);
    }
  }
  
  /**
   * Get metrics for a specific domain
   * @param domain The domain to get metrics for
   * @returns The metrics for the domain
   */
  getMetrics(domain: string): Record<string, MetricProcessorResult> {
    return this.metrics[domain] || {};
  }
  
  /**
   * Get all metrics across domains
   * @returns All registered metrics by domain
   */
  getAllMetrics(): Record<string, Record<string, MetricProcessorResult>> {
    return this.metrics;
  }
  
  /**
   * Find metrics by name pattern across all domains
   * @param pattern The pattern to match against metric names
   * @returns Matching metrics with domain information
   */
  findMetricsByPattern(pattern: string | RegExp): Array<{ domain: string; key: string; metric: MetricProcessorResult }> {
    const results: Array<{ domain: string; key: string; metric: MetricProcessorResult }> = [];
    const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern, 'i');
    
    for (const [domain, domainMetrics] of Object.entries(this.metrics)) {
      for (const [key, metric] of Object.entries(domainMetrics)) {
        if (regex.test(key)) {
          results.push({ domain, key, metric });
        }
      }
    }
    
    return results;
  }
  
  /**
   * Subscribe to changes in metrics for a specific domain
   * @param domain The domain to subscribe to
   * @param callback Function to call when metrics change
   * @returns Function to unsubscribe
   */
  subscribe(domain: string, callback: (metrics: Record<string, MetricProcessorResult>) => void): () => void {
    if (!this.observers[domain]) {
      this.observers[domain] = [];
    }
    
    this.observers[domain].push(callback);
    
    // Return unsubscribe function
    return () => {
      this.observers[domain] = this.observers[domain].filter(cb => cb !== callback);
    };
  }
  
  /**
   * Notify observers of changes to metrics in a domain
   * @param domain The domain that changed
   */
  private notifyObservers(domain: string): void {
    if (this.observers[domain]) {
      this.observers[domain].forEach(callback => {
        try {
          callback(this.metrics[domain]);
        } catch (error) {
          console.error(`[MetricsRegistry] Error in observer for domain '${domain}':`, error);
        }
      });
    }
    
    // Also notify global observers
    if (domain !== 'global' && this.observers['global']) {
      this.observers['global'].forEach(callback => {
        try {
          callback(this.metrics[domain]);
        } catch (error) {
          console.error(`[MetricsRegistry] Error in global observer for domain '${domain}':`, error);
        }
      });
    }
  }
  
  /**
   * Clear metrics for a specific domain
   * @param domain The domain to clear metrics for
   */
  clearMetrics(domain: string): void {
    if (this.metrics[domain]) {
      this.metrics[domain] = {};
      this.notifyObservers(domain);
    }
  }
  
  /**
   * Clear all metrics across all domains
   */
  clearAllMetrics(): void {
    for (const domain of Object.keys(this.metrics)) {
      this.metrics[domain] = {};
      this.notifyObservers(domain);
    }
  }
}

/**
 * Hook to access the metrics registry in React components
 */
export function useMetricsRegistry() {
  return MetricsRegistry.getInstance();
}
