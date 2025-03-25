
import { StateCreator } from 'zustand';

export interface UISlice {
  // State
  activeTab: string;
  isProcessing: boolean;
  isAnalyzing: boolean;
  processingError: string | null;
  
  // Actions
  setActiveTab: (tab: string) => void;
  setProcessing: (isProcessing: boolean) => void;
  setAnalyzing: (isAnalyzing: boolean) => void;
  setProcessingError: (error: string | null) => void;
  goToInputTab: () => void;
  goToDashboardTab: () => void;
}

export const createUISlice: StateCreator<
  UISlice,
  [],
  [],
  UISlice
> = (set) => ({
  // Initial state
  activeTab: "input",
  isProcessing: false,
  isAnalyzing: false,
  processingError: null,
  
  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  setProcessing: (isProcessing) => set({ isProcessing }),
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setProcessingError: (error) => set({ processingError: error }),
  
  goToInputTab: () => set({ activeTab: "input" }),
  goToDashboardTab: () => set({ activeTab: "dashboard" })
});
