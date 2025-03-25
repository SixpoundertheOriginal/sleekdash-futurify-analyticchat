
import { StateCreator } from 'zustand';

export interface ThreadSlice {
  // State
  threadId?: string;
  assistantId?: string;
  
  // Derived state
  hasThreadInfo: () => boolean;
  
  // Actions
  setThreadId: (threadId?: string) => void;
  setAssistantId: (assistantId?: string) => void;
}

export const createThreadSlice: StateCreator<
  ThreadSlice,
  [],
  [],
  ThreadSlice
> = (set, get) => ({
  // Initial state
  threadId: undefined,
  assistantId: undefined,
  
  // Derived state
  hasThreadInfo: () => Boolean(get().threadId && get().assistantId),
  
  // Actions
  setThreadId: (threadId) => set({ threadId }),
  setAssistantId: (assistantId) => set({ assistantId })
});
