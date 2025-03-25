
import { StateCreator } from 'zustand';
import { ProcessedAnalytics } from '@/utils/analytics/types';
import { DateRange } from '@/components/chat/DateRangePicker';
import { createDefaultProcessedAnalytics } from '@/utils/analytics/processAnalysis';

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
  
  // Derived state
  hasData: () => {
    return !!get().processedAnalytics;
  },
  
  hasAnalysisData: () => {
    return !!get().processedAnalytics?.summary?.executiveSummary;
  },
  
  getEffectiveAnalytics: () => {
    return get().processedAnalytics;
  },
  
  getFormattedDateRange: () => {
    const { dateRange } = get();
    if (!dateRange || !dateRange.from || !dateRange.to) {
      return "Not specified";
    }
    return `${dateRange.from.toLocaleDateString()} to ${dateRange.to.toLocaleDateString()}`;
  },
  
  // Actions
  setProcessedAnalytics: (analytics) => set({ processedAnalytics: analytics }),
  setDirectlyExtractedMetrics: (metrics) => set({ directlyExtractedMetrics: metrics }),
  setDateRange: (dateRange) => set({ dateRange }),
  resetAnalytics: () => set({ 
    processedAnalytics: null,
    directlyExtractedMetrics: null
  })
});
