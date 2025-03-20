
import React, { createContext, useContext, ReactNode, useReducer, useEffect } from "react";
import { ProcessedAnalytics } from "@/utils/analytics/types";
import { DateRange } from "@/components/chat/DateRangePicker";
import { useThread } from "./thread/ThreadContext";
import { useMetrics } from "@/hooks/useMetrics";
import { createDefaultProcessedAnalytics, AnalyticsState, createInitialAnalyticsState } from "@/hooks/app-store/appStoreAnalyticsUtils";
import { registerAppStoreMetrics } from '@/utils/metrics/adapters/appStoreAdapter';

// Define action types
type ActionType = 
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_EXTRACTED_DATA'; payload: any }
  | { type: 'SET_ANALYSIS_RESULT'; payload: string | null }
  | { type: 'SET_PROCESSED_ANALYTICS'; payload: ProcessedAnalytics | null }
  | { type: 'SET_DIRECTLY_EXTRACTED_METRICS'; payload: Partial<ProcessedAnalytics> | null }
  | { type: 'SET_DATE_RANGE'; payload: DateRange | null }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_ANALYZING'; payload: boolean }
  | { type: 'SET_PROCESSING_ERROR'; payload: string | null }
  | { type: 'RESET_STATE' };

// Define state structure
interface AppStoreState {
  activeTab: string;
  extractedData: any;
  analysisResult: string | null;
  processedAnalytics: ProcessedAnalytics | null;
  directlyExtractedMetrics: Partial<ProcessedAnalytics> | null;
  dateRange: DateRange | null;
  isProcessing: boolean;
  isAnalyzing: boolean;
  processingError: string | null;
}

const initialState: AppStoreState = {
  activeTab: "input",
  extractedData: null,
  analysisResult: null,
  processedAnalytics: null,
  directlyExtractedMetrics: null,
  dateRange: null,
  isProcessing: false,
  isAnalyzing: false,
  processingError: null
};

// Create reducer
function appStoreReducer(state: AppStoreState, action: ActionType): AppStoreState {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_EXTRACTED_DATA':
      return { ...state, extractedData: action.payload };
    case 'SET_ANALYSIS_RESULT':
      return { ...state, analysisResult: action.payload };
    case 'SET_PROCESSED_ANALYTICS':
      return { ...state, processedAnalytics: action.payload };
    case 'SET_DIRECTLY_EXTRACTED_METRICS':
      return { ...state, directlyExtractedMetrics: action.payload };
    case 'SET_DATE_RANGE':
      return { ...state, dateRange: action.payload };
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };
    case 'SET_ANALYZING':
      return { ...state, isAnalyzing: action.payload };
    case 'SET_PROCESSING_ERROR':
      return { ...state, processingError: action.payload };
    case 'RESET_STATE':
      return { ...initialState };
    default:
      return state;
  }
}

// Create context
interface AppStoreContextType extends AppStoreState {
  dispatch: React.Dispatch<ActionType>;
  // Helper methods
  handleProcessSuccess: (data: any) => void;
  handleAnalysisSuccess: (analysisResult: string) => void;
  handleDirectExtractionSuccess: (metrics: Partial<ProcessedAnalytics>) => void;
  setActiveTab: (tab: string) => void;
  setProcessedAnalytics: (analytics: ProcessedAnalytics | null) => void;
  setProcessing: (processing: boolean) => void;
  setAnalyzing: (analyzing: boolean) => void;
  setDateRange: (dateRange: DateRange | null) => void;
  goToInputTab: () => void;
  threadId?: string;
  assistantId?: string;
  // Computed properties
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
  const [state, dispatch] = useReducer(appStoreReducer, 
    initialData ? { ...initialState, processedAnalytics: initialData } : initialState
  );
  
  const { threadId, assistantId } = useThread();
  const { registerMetrics } = useMetrics('appStore');
  
  // Register initial metrics if provided
  useEffect(() => {
    if (initialData) {
      // We use the adapter instead of direct registration
      registerAppStoreMetrics(initialData, {
        source: 'initial-data',
        confidence: 0.9
      });
    }
  }, [initialData]);
  
  // Helper action dispatchers
  const setActiveTab = (tab: string) => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  const setProcessedAnalytics = (analytics: ProcessedAnalytics | null) => 
    dispatch({ type: 'SET_PROCESSED_ANALYTICS', payload: analytics });
  const setProcessing = (processing: boolean) => 
    dispatch({ type: 'SET_PROCESSING', payload: processing });
  const setAnalyzing = (analyzing: boolean) => 
    dispatch({ type: 'SET_ANALYZING', payload: analyzing });
  const setDateRange = (dateRange: DateRange | null) => 
    dispatch({ type: 'SET_DATE_RANGE', payload: dateRange });
  
  // Navigation helpers
  const goToInputTab = () => setActiveTab('input');
  
  // Complex handlers
  const handleProcessSuccess = (data: any) => {
    dispatch({ type: 'SET_EXTRACTED_DATA', payload: data });
    dispatch({ type: 'SET_PROCESSING', payload: false });
    dispatch({ type: 'SET_PROCESSING_ERROR', payload: null });
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'extraction' });
  };
  
  const handleAnalysisSuccess = (analysisResult: string) => {
    dispatch({ type: 'SET_ANALYSIS_RESULT', payload: analysisResult });
    dispatch({ type: 'SET_ANALYZING', payload: false });
    dispatch({ type: 'SET_PROCESSING_ERROR', payload: null });
    
    // Try to extract metrics from the analysis result
    try {
      // Extract metrics logic would go here
      // For now, let's assume we have a processed result
      const processedResult = state.processedAnalytics || createDefaultProcessedAnalytics();
      
      dispatch({ type: 'SET_PROCESSED_ANALYTICS', payload: processedResult });
      
      // Register metrics via the adapter instead of directly
      registerAppStoreMetrics(processedResult, {
        source: 'analysis',
        confidence: 0.8
      });
      
      dispatch({ type: 'SET_ACTIVE_TAB', payload: 'dashboard' });
    } catch (error) {
      console.error("Error processing analysis result:", error);
      dispatch({ type: 'SET_PROCESSING_ERROR', payload: "Failed to process analysis result" });
    }
  };
  
  const handleDirectExtractionSuccess = (metrics: Partial<ProcessedAnalytics>) => {
    dispatch({ type: 'SET_DIRECTLY_EXTRACTED_METRICS', payload: metrics });
    dispatch({ type: 'SET_PROCESSING', payload: false });
    
    // Merge with existing analytics or create new one
    const mergedAnalytics = {
      ...createDefaultProcessedAnalytics(),
      ...state.processedAnalytics,
      ...metrics
    };
    
    dispatch({ type: 'SET_PROCESSED_ANALYTICS', payload: mergedAnalytics });
    
    // Register metrics via the adapter instead of directly
    registerAppStoreMetrics(mergedAnalytics, {
      source: 'direct-extraction',
      confidence: 0.95
    });
    
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'dashboard' });
  };
  
  // Computed properties
  const getEffectiveAnalytics = () => {
    return state.processedAnalytics || null;
  };
  
  const hasData = () => {
    return !!state.processedAnalytics || !!state.extractedData;
  };
  
  const hasAnalysisData = () => {
    return !!state.analysisResult;
  };
  
  const getFormattedDateRange = () => {
    if (!state.dateRange || !state.dateRange.from || !state.dateRange.to) {
      return "Not specified";
    }
    return `${state.dateRange.from.toLocaleDateString()} to ${state.dateRange.to.toLocaleDateString()}`;
  };
  
  // Combine loading states
  const isLoading = state.isProcessing || state.isAnalyzing;
  
  const contextValue: AppStoreContextType = {
    ...state,
    dispatch,
    handleProcessSuccess,
    handleAnalysisSuccess,
    handleDirectExtractionSuccess,
    setActiveTab,
    setProcessedAnalytics,
    setProcessing,
    setAnalyzing,
    setDateRange,
    goToInputTab,
    threadId,
    assistantId,
    getEffectiveAnalytics,
    hasData,
    hasAnalysisData,
    getFormattedDateRange,
    isLoading
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
