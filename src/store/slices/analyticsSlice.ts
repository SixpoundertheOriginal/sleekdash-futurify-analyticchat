
import { StateCreator } from 'zustand';
import { ProcessedAnalytics } from '@/utils/analytics/types';
import { createDefaultProcessedAnalytics } from '@/hooks/app-store/appStoreAnalyticsUtils';
import { registerAppStoreMetrics } from '@/utils/metrics/adapters/appStoreAdapter';
import { DateRange } from '@/components/chat/DateRangePicker';

export interface AnalyticsSlice {
  // State
  processedAnalytics: ProcessedAnalytics | null;
  directlyExtractedMetrics: Partial<ProcessedAnalytics> | null;
  dateRange: DateRange | null;
  
  // Derived state
  hasData: () => boolean;
  hasAnalysisData: () => boolean;
  getEffectiveAnalytics: () => ProcessedAnalytics | null;
  getFormattedDateRange: () => string;
  
  // Actions
  setProcessedAnalytics: (analytics: ProcessedAnalytics | null) => void;
  setDirectlyExtractedMetrics: (metrics: Partial<ProcessedAnalytics> | null) => void;
  setDateRange: (dateRange: DateRange | null) => void;
  resetAnalytics: () => void;
}

export const createAnalyticsSlice: StateCreator<
  AnalyticsSlice,
  [],
  [],
  AnalyticsSlice
> = (set, get) => ({
  // Initial state
  processedAnalytics: null,
  directlyExtractedMetrics: null,
  dateRange: null,
  
  // Derived state (getters)
  hasData: () => !!get().processedAnalytics || !!get().directlyExtractedMetrics,
  hasAnalysisData: () => !!get().processedAnalytics,
  getEffectiveAnalytics: () => get().processedAnalytics || null,
  getFormattedDateRange: () => {
    const { dateRange } = get();
    if (!dateRange || !dateRange.from || !dateRange.to) {
      return "Not specified";
    }
    return `${dateRange.from.toLocaleDateString()} to ${dateRange.to.toLocaleDateString()}`;
  },
  
  // Actions
  setProcessedAnalytics: (analytics) => {
    set({ processedAnalytics: analytics });
    
    // Side effect: register metrics for tracking
    if (analytics) {
      registerAppStoreMetrics(analytics, {
        source: 'store-update',
        confidence: 0.9
      });
    }
  },
  
  setDirectlyExtractedMetrics: (metrics) => {
    set({ directlyExtractedMetrics: metrics });
    
    // If we have metrics and processedAnalytics is null, create a merged analytics object
    if (metrics && !get().processedAnalytics) {
      const mergedAnalytics = {
        ...createDefaultProcessedAnalytics(),
        ...metrics
      };
      
      get().setProcessedAnalytics(mergedAnalytics);
    }
  },
  
  setDateRange: (dateRange) => {
    set({ dateRange });
  },
  
  resetAnalytics: () => {
    set({
      processedAnalytics: null,
      directlyExtractedMetrics: null
    });
  }
});
