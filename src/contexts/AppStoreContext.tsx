
import React, { createContext, useContext, ReactNode } from "react";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { DateRange } from "@/components/chat/DateRangePicker";
import { useAppStoreState } from "@/hooks/app-store/useAppStoreState";
import { useAppStoreHandlers } from "@/hooks/app-store/useAppStoreHandlers";
import { useAppStoreAnalysisActions } from "@/hooks/app-store/useAppStoreAnalysisActions";
import { useAppStoreAnalysisData } from "@/hooks/app-store/useAppStoreAnalysisData";
import { useMetrics } from "@/hooks/useMetrics";
import { useThread } from "./thread/ThreadContext";

interface AppStoreContextType {
  // Tab state
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Data state
  extractedData: string | null;
  analysisResult: string | null;
  processedAnalytics: ProcessedAnalytics | null;
  directlyExtractedMetrics: Partial<ProcessedAnalytics> | null;
  
  // Date range state
  dateRange: DateRange | null;
  setDateRange: (dateRange: DateRange | null) => void;
  
  // Processing state
  isProcessing: boolean;
  setProcessing: (processing: boolean) => void;
  isAnalyzing: boolean;
  setAnalyzing: (analyzing: boolean) => void;
  processingError: string | null;
  
  // Handlers
  handleProcessSuccess: (data: any) => void;
  handleAnalysisSuccess: (analysisResult: string) => void;
  handleDirectExtractionSuccess: (metrics: Partial<ProcessedAnalytics>) => void;
  
  // Thread info
  threadId?: string;
  assistantId?: string;
  
  // Navigation helpers
  goToInputTab: () => void;
  
  // Data utilities
  getEffectiveAnalytics: () => ProcessedAnalytics | null;
  hasData: () => boolean;
  hasAnalysisData: () => boolean;
  getFormattedDateRange: () => string;
  isLoading: boolean;
}

const AppStoreContext = createContext<AppStoreContextType | undefined>(undefined);

interface AppStoreProviderProps {
  children: ReactNode;
  initialData?: ProcessedAnalytics;
}

export function AppStoreProvider({ children, initialData }: AppStoreProviderProps) {
  // Get state from app store state hook
  const appStoreState = useAppStoreState(initialData);
  
  // Get thread context
  const { threadId, assistantId } = useThread();
  const { registerMetrics } = useMetrics('appStore');
  
  // Extract state values for easier access
  const {
    activeTab, setActiveTab,
    extractedData, setExtractedData,
    analysisResult, setAnalysisResult,
    processedAnalytics, setProcessedAnalytics,
    directlyExtractedMetrics, setDirectlyExtractedMetrics,
    dateRange, setDateRange,
    isProcessing, setProcessing,
    isAnalyzing, setAnalyzing,
    processingError, setProcessingError
  } = appStoreState;

  // Get handlers for different operations
  const handlers = useAppStoreHandlers({
    setProcessing,
    setAnalyzing,
    setExtractedData,
    setAnalysisResult,
    setProcessedAnalytics,
    setDirectlyExtractedMetrics,
    setProcessingError,
    setActiveTab,
    registerMetrics
  });

  // Get analysis actions
  const actions = useAppStoreAnalysisActions({
    extractedData,
    analysisResult,
    setAnalyzing,
    handleAnalysisSuccess: handlers.handleAnalysisSuccess,
    handleAnalysisError: handlers.handleAnalysisError
  });

  // Get computed data properties
  const analysisData = useAppStoreAnalysisData({
    processedAnalytics,
    initialData: initialData || null,
    dateRange,
    isProcessing,
    isAnalyzing,
    extractedData,
    analysisResult
  });
  
  // Navigation helpers
  const goToInputTab = () => setActiveTab('input');

  // Create the context value object
  const contextValue: AppStoreContextType = {
    // Basic state
    activeTab,
    setActiveTab,
    extractedData,
    analysisResult,
    processedAnalytics,
    directlyExtractedMetrics,
    dateRange,
    setDateRange,
    isProcessing,
    setProcessing,
    isAnalyzing,
    setAnalyzing,
    processingError,
    
    // Handlers
    ...handlers,
    
    // Thread info
    threadId,
    assistantId,
    
    // Navigation helpers
    goToInputTab,
    
    // Data utilities
    ...analysisData
  };

  return (
    <AppStoreContext.Provider value={contextValue}>
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppStoreProvider');
  }
  return context;
}
