
/**
 * Centralized management of thread and assistant IDs for different app features
 */

// Define assistant types
export type AssistantType = 'keywords' | 'appStore' | 'marketing' | 'general';

// Thread ID record structure
interface ThreadRecord {
  id: string;
  assistantId: string;
  lastUsed: Date;
  feature: AssistantType;
}

// Define the default thread and assistant IDs
export const ASSISTANT_IDS = {
  keywords: 'asst_EYm70EgIE2okxc8onNc1DVTj',   // Keywords analysis assistant
  appStore: 'asst_TfGVD0dcL2vsnPCihybxorC7',   // App Store analytics assistant
  marketing: 'asst_EYm70EgIE2okxc8onNc1DVTj',  // Same as keywords for now
  general: 'asst_EYm70EgIE2okxc8onNc1DVTj'     // Default assistant
};

// Define the default thread IDs (one per feature)
export const DEFAULT_THREAD_IDS = {
  keywords: 'thread_XexaKEggRcir8kQLQbbLqqy9',
  appStore: 'thread_d5BLFmp47v8EbWacFTjs6sgh', // Updated to use the specified thread ID
  marketing: 'thread_XexaKEggRcir8kQLQbbLqqy9',
  general: 'thread_XexaKEggRcir8kQLQbbLqqy9'
};

// Thread storage key prefix in localStorage
const THREAD_STORAGE_PREFIX = 'appThread_';

/**
 * Get the storage key for a specific feature's thread
 */
export const getThreadStorageKey = (feature: AssistantType): string => {
  return `${THREAD_STORAGE_PREFIX}${feature}`;
};

/**
 * Retrieve a thread ID for a specific feature from localStorage
 * Falls back to the default thread ID if none is stored
 */
export const getThreadId = (feature: AssistantType): string => {
  const storageKey = getThreadStorageKey(feature);
  const storedThreadId = localStorage.getItem(storageKey);
  
  return storedThreadId || DEFAULT_THREAD_IDS[feature];
};

/**
 * Save a thread ID for a specific feature to localStorage
 */
export const saveThreadId = (feature: AssistantType, threadId: string): void => {
  const storageKey = getThreadStorageKey(feature);
  localStorage.setItem(storageKey, threadId);
  console.log(`[thread-management] Saved thread ID for ${feature}: ${threadId}`);
};

/**
 * Get the assistant ID for a specific feature
 */
export const getAssistantId = (feature: AssistantType): string => {
  return ASSISTANT_IDS[feature];
};

/**
 * Create a thread record linking a thread ID to an assistant and feature
 */
export const createThreadRecord = (threadId: string, feature: AssistantType): ThreadRecord => {
  return {
    id: threadId,
    assistantId: getAssistantId(feature),
    lastUsed: new Date(),
    feature
  };
};

/**
 * Get thread data for a specific feature
 */
export const getThreadData = (feature: AssistantType): { threadId: string, assistantId: string } => {
  return {
    threadId: getThreadId(feature),
    assistantId: getAssistantId(feature)
  };
};
