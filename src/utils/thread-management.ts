
// This file manages thread-related functionality
export type AssistantType = 'general' | 'keywords' | 'appStore' | 'marketing' | 'appEvents' | 'croTesting';

// Constants for default thread IDs
export const DEFAULT_THREAD_IDS: Record<AssistantType, string> = {
  general: 'thread_XexaKEggRcir8kQLQbbLqqy9',
  keywords: 'thread_XexaKEggRcir8kQLQbbLqqy9',
  appStore: 'thread_d5BLFmp47v8EbWacFTjs6sgh',
  marketing: 'thread_XexaKEggRcir8kQLQbbLqqy9',
  appEvents: 'thread_XexaKEggRcir8kQLQbbLqqy9',
  croTesting: 'thread_XexaKEggRcir8kQLQbbLqqy9',
};

// Helper function to get assistant ID for a feature
export const getAssistantIdForFeature = (feature: AssistantType): string => {
  const assistantIds: Record<AssistantType, string> = {
    general: 'asst_EYm70EgIE2okxc8onNc1DVTj',
    keywords: 'asst_EYm70EgIE2okxc8onNc1DVTj',
    appStore: 'asst_TfGVD0dcL2vsnPCihybxorC7',
    marketing: 'asst_EYm70EgIE2okxc8onNc1DVTj',
    appEvents: 'asst_EYm70EgIE2okxc8onNc1DVTj',
    croTesting: 'asst_EYm70EgIE2okxc8onNc1DVTj',
  };
  
  return assistantIds[feature] || assistantIds.general;
};

// Alias for getAssistantIdForFeature for better compatibility
export const getAssistantId = getAssistantIdForFeature;

// Helper to get default thread ID for a feature
export const getDefaultThreadIdForFeature = (feature: AssistantType): string => {
  return DEFAULT_THREAD_IDS[feature] || DEFAULT_THREAD_IDS.general;
};

// Provide a function to get thread data
export const getThreadData = (feature: AssistantType) => {
  return {
    threadId: getDefaultThreadIdForFeature(feature),
    assistantId: getAssistantIdForFeature(feature)
  };
};

// Storage key for saved thread IDs
const THREAD_STORAGE_KEY = 'app_thread_ids';

// Helper function to save thread ID for a feature
export const saveThreadId = (feature: AssistantType, threadId: string): void => {
  try {
    // Get existing stored thread IDs
    const storedData = localStorage.getItem(THREAD_STORAGE_KEY);
    const threadIds = storedData ? JSON.parse(storedData) : {};
    
    // Update with new thread ID
    threadIds[feature] = threadId;
    
    // Save back to localStorage
    localStorage.setItem(THREAD_STORAGE_KEY, JSON.stringify(threadIds));
    
    console.log(`[thread-management] Saved thread ID for ${feature}: ${threadId}`);
  } catch (error) {
    console.error('[thread-management] Error saving thread ID to localStorage:', error);
  }
};
