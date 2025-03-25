
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AnalyticsSlice, createAnalyticsSlice } from './slices/analyticsSlice';
import { UISlice, createUISlice } from './slices/uiSlice';
import { ExtractionSlice, createExtractionSlice } from './slices/extractionSlice';
import { ThreadSlice, createThreadSlice } from './slices/threadSlice';
import { ProcessedAnalytics } from '@/utils/analytics/types';

// Combined store type
interface AppStore extends 
  AnalyticsSlice, 
  UISlice, 
  ExtractionSlice, 
  ThreadSlice {
  // Shared actions
  handleProcessSuccess: (data: any) => void;
  handleAnalysisSuccess: (analysisResult: string) => void;
  handleDirectExtractionSuccess: (metrics: Partial<ProcessedAnalytics>) => void;
}

// Create the store with all slices
export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (...a) => {
        // Get all the basic slices
        const analytics = createAnalyticsSlice(...a);
        const ui = createUISlice(...a);
        const extraction = createExtractionSlice(...a);
        const thread = createThreadSlice(...a);
        
        // Create complex actions that combine multiple slices
        const handleProcessSuccess = (data: any) => {
          const [set, get] = a;
          
          // Update multiple slices
          extraction.setExtractedData(data);
          ui.setProcessing(false);
          ui.setProcessingError(null);
          ui.setActiveTab('extraction');
        };
        
        const handleAnalysisSuccess = (analysisResult: string) => {
          const [set, get] = a;
          
          // Update multiple slices
          extraction.setAnalysisResult(analysisResult);
          ui.setAnalyzing(false);
          ui.setProcessingError(null);
          ui.setActiveTab('analysis');
        };
        
        const handleDirectExtractionSuccess = (metrics: Partial<ProcessedAnalytics>) => {
          const [set, get] = a;
          
          // Update multiple slices
          analytics.setDirectlyExtractedMetrics(metrics);
          ui.setProcessing(false);
          ui.setActiveTab('dashboard');
        };
        
        return {
          // Combine all slices
          ...analytics,
          ...ui,
          ...extraction,
          ...thread,
          
          // Add combined actions
          handleProcessSuccess,
          handleAnalysisSuccess,
          handleDirectExtractionSuccess,
        };
      },
      {
        name: "app-store",
        partialize: (state) => ({
          // Only persist certain values
          processedAnalytics: state.processedAnalytics,
          activeTab: state.activeTab
        })
      }
    ),
    { name: 'app-store' }
  )
);

// Create selector hooks for specific slices
export const useAnalytics = () => useAppStore(state => ({
  processedAnalytics: state.processedAnalytics,
  directlyExtractedMetrics: state.directlyExtractedMetrics,
  dateRange: state.dateRange,
  hasData: state.hasData,
  hasAnalysisData: state.hasAnalysisData,
  getEffectiveAnalytics: state.getEffectiveAnalytics,
  getFormattedDateRange: state.getFormattedDateRange,
  setProcessedAnalytics: state.setProcessedAnalytics,
  setDirectlyExtractedMetrics: state.setDirectlyExtractedMetrics,
  setDateRange: state.setDateRange,
  resetAnalytics: state.resetAnalytics
}));

export const useUI = () => useAppStore(state => ({
  activeTab: state.activeTab,
  isProcessing: state.isProcessing,
  isAnalyzing: state.isAnalyzing,
  processingError: state.processingError,
  setActiveTab: state.setActiveTab,
  setProcessing: state.setProcessing,
  setAnalyzing: state.setAnalyzing,
  setProcessingError: state.setProcessingError,
  goToInputTab: state.goToInputTab,
  goToDashboardTab: state.goToDashboardTab
}));

export const useExtraction = () => useAppStore(state => ({
  extractedData: state.extractedData,
  analysisResult: state.analysisResult,
  setExtractedData: state.setExtractedData,
  setAnalysisResult: state.setAnalysisResult,
  resetExtraction: state.resetExtraction
}));

export const useThreadStore = () => useAppStore(state => ({
  threadId: state.threadId,
  assistantId: state.assistantId,
  hasThreadInfo: state.hasThreadInfo,
  setThreadId: state.setThreadId,
  setAssistantId: state.setAssistantId
}));

// Combined handlers
export const useHandlers = () => useAppStore(state => ({
  handleProcessSuccess: state.handleProcessSuccess,
  handleAnalysisSuccess: state.handleAnalysisSuccess,
  handleDirectExtractionSuccess: state.handleDirectExtractionSuccess
}));
