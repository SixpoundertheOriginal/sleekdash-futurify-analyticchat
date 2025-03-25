
import { StateCreator } from 'zustand';

export interface ExtractionSlice {
  // State
  extractedData: any;
  analysisResult: string | null;
  
  // Actions
  setExtractedData: (data: any) => void;
  setAnalysisResult: (result: string | null) => void;
  resetExtraction: () => void;
}

export const createExtractionSlice: StateCreator<
  ExtractionSlice,
  [],
  [],
  ExtractionSlice
> = (set) => ({
  // Initial state
  extractedData: null,
  analysisResult: null,
  
  // Actions
  setExtractedData: (data) => set({ extractedData: data }),
  setAnalysisResult: (result) => set({ analysisResult: result }),
  resetExtraction: () => set({
    extractedData: null,
    analysisResult: null
  })
});
