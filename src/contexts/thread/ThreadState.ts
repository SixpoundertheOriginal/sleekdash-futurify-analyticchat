
import { useState, useEffect } from 'react';
import { AssistantType, getThreadData, getAssistantId, DEFAULT_THREAD_IDS } from '@/utils/thread-management';
import { testThread } from '@/utils/thread-context-utils';

// Re-export for backward compatibility
export const DEFAULT_THREAD_ID = DEFAULT_THREAD_IDS.general;
export const DEFAULT_ASSISTANT_ID = getAssistantId('general');
export const APP_STORE_ASSISTANT_ID = getAssistantId('appStore');

export interface ThreadState {
  threadId: string;
  assistantId: string;
  activeFeature: AssistantType;
  isValidThread: boolean;
}

export const useThreadState = () => {
  // Start with the general feature as active
  const [activeFeature, setActiveFeature] = useState<AssistantType>('general');
  
  // Get initial thread and assistant IDs from the active feature
  const initialThreadData = getThreadData(activeFeature);
  
  const [threadId, setThreadId] = useState<string>(initialThreadData.threadId);
  const [assistantId, setAssistantId] = useState<string>(initialThreadData.assistantId);
  const [isValidThread, setIsValidThread] = useState<boolean>(true);
  
  // App Store assistant ID is fixed
  const appStoreAssistantId = getAssistantId('appStore');

  // Update thread and assistant when feature changes
  useEffect(() => {
    const { threadId: featureThreadId, assistantId: featureAssistantId } = getThreadData(activeFeature);
    setThreadId(featureThreadId);
    setAssistantId(featureAssistantId);
    console.log(`[ThreadState] Switched to ${activeFeature} feature with thread ID: ${featureThreadId}`);
  }, [activeFeature]);

  // Verify thread ID validity on component mount or when it changes
  useEffect(() => {
    const verifyThreadId = async () => {
      try {
        if (!threadId) {
          console.warn('[ThreadState] No thread ID to verify');
          setIsValidThread(false);
          return;
        }
        
        console.log(`[ThreadState] Using thread ID: ${threadId}`);
        console.log(`[ThreadState] Using assistant ID: ${assistantId}`);
        setIsValidThread(true);
        
        // Test the thread if it's not the default
        if (threadId !== DEFAULT_THREAD_IDS[activeFeature]) {
          const result = await testThread(threadId, assistantId);
          // Even if validation fails, continue using the thread to avoid disrupting the UI
        }
      } catch (error) {
        console.error('[ThreadState] Error verifying thread ID:', error);
        // Continue using the thread despite validation issues
      }
    };

    verifyThreadId();
  }, [threadId, assistantId, activeFeature]);

  // On initial load, log initial state
  useEffect(() => {
    console.log(`[ThreadState] Initial feature: ${activeFeature}`);
    console.log(`[ThreadState] Initial thread ID: ${threadId}`);
    console.log(`[ThreadState] Initial assistant ID: ${assistantId}`);
  }, []);

  return {
    threadId,
    assistantId,
    activeFeature,
    appStoreAssistantId,
    setThreadId,
    setAssistantId,
    setActiveFeature,
    isValidThread
  };
};
