
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { 
  AssistantType, 
  getThreadData, 
  getAssistantId, 
  saveThreadId,
  DEFAULT_THREAD_IDS
} from '@/utils/thread-management';

// Re-export for backward compatibility
export const DEFAULT_THREAD_ID = DEFAULT_THREAD_IDS.general;
export const DEFAULT_ASSISTANT_ID = getAssistantId('general');
export const APP_STORE_ASSISTANT_ID = getAssistantId('appStore');

interface ThreadContextType {
  threadId: string;
  assistantId: string;
  activeFeature: AssistantType;
  appStoreAssistantId: string;
  setThreadId: (id: string) => void;
  setAssistantId: (id: string) => void;
  setActiveFeature: (feature: AssistantType) => void;
  isValidThread: boolean;
  createNewThread: () => Promise<string | null>;
  getFeatureThreadId: (feature: AssistantType) => string;
  getFeatureAssistantId: (feature: AssistantType) => string;
}

const ThreadContext = createContext<ThreadContextType | undefined>(undefined);

export const ThreadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Start with the general feature as active
  const [activeFeature, setActiveFeature] = useState<AssistantType>('general');
  
  // Get initial thread and assistant IDs from the active feature
  const initialThreadData = getThreadData(activeFeature);
  
  const [threadId, setThreadId] = useState<string>(initialThreadData.threadId);
  const [assistantId, setAssistantId] = useState<string>(initialThreadData.assistantId);
  const [isValidThread, setIsValidThread] = useState<boolean>(true);
  
  const { toast } = useToast();

  // App Store assistant ID is fixed
  const appStoreAssistantId = getAssistantId('appStore');

  // Update thread and assistant when feature changes
  useEffect(() => {
    const { threadId: featureThreadId, assistantId: featureAssistantId } = getThreadData(activeFeature);
    setThreadId(featureThreadId);
    setAssistantId(featureAssistantId);
    console.log(`[ThreadContext] Switched to ${activeFeature} feature with thread ID: ${featureThreadId}`);
  }, [activeFeature]);

  const createNewThread = async (): Promise<string | null> => {
    try {
      console.log(`[ThreadContext] Creating new thread for ${activeFeature} feature...`);
      
      const { data, error } = await supabase.functions.invoke('create-thread', {
        body: {}
      });

      if (error) {
        console.error('[ThreadContext] Edge function error:', error);
        toast({
          variant: "destructive",
          title: "Thread Creation Failed",
          description: error.message
        });
        return null;
      }
      
      if (!data || !data.threadId) {
        console.error('[ThreadContext] Invalid response:', data);
        toast({
          variant: "destructive",
          title: "Thread Creation Failed",
          description: "No thread ID returned in response"
        });
        return null;
      }

      console.log(`[ThreadContext] Thread created successfully for ${activeFeature}: ${data.threadId}`);
      
      // Update the thread ID in state
      setThreadId(data.threadId);
      
      // Save the thread ID for the current feature
      saveThreadId(activeFeature, data.threadId);
      
      toast({
        title: "Thread Created",
        description: `New thread created for ${activeFeature}: ${data.threadId.substring(0, 10)}...`
      });
      
      return data.threadId;
    } catch (error) {
      console.error('[ThreadContext] Error creating thread:', error);
      toast({
        variant: "destructive",
        title: "Thread Creation Failed",
        description: error instanceof Error ? error.message : "Unknown error"
      });
      return null;
    }
  };

  // Get thread ID for a specific feature
  const getFeatureThreadId = (feature: AssistantType): string => {
    return feature === activeFeature ? threadId : getThreadData(feature).threadId;
  };

  // Get assistant ID for a specific feature
  const getFeatureAssistantId = (feature: AssistantType): string => {
    return getAssistantId(feature);
  };

  // Verify thread ID validity on component mount or when it changes
  useEffect(() => {
    const verifyThreadId = async () => {
      try {
        if (!threadId) {
          console.warn('[ThreadContext] No thread ID to verify');
          setIsValidThread(false);
          return;
        }
        
        console.log(`[ThreadContext] Using thread ID: ${threadId}`);
        console.log(`[ThreadContext] Using assistant ID: ${assistantId}`);
        
        // Store the current thread ID in feature-specific storage
        saveThreadId(activeFeature, threadId);
        setIsValidThread(true);
        
        // Test the thread if it's not the default
        if (threadId !== DEFAULT_THREAD_IDS[activeFeature]) {
          console.log(`[ThreadContext] Testing thread for ${activeFeature}: ${threadId}`);
          try {
            const { data, error } = await supabase.functions.invoke('test-thread', {
              body: { 
                threadId: threadId,
                assistantId: assistantId
              }
            });
            
            if (error || !data?.success) {
              console.warn('[ThreadContext] Thread validation failed:', error || data?.error);
              // Don't invalidate to avoid disrupting the UI, but log the warning
            } else {
              console.log('[ThreadContext] Thread validation successful');
            }
          } catch (e) {
            console.warn('[ThreadContext] Error testing thread:', e);
            // Continue using the thread despite validation issues
          }
        }
      } catch (error) {
        console.error('[ThreadContext] Error verifying thread ID:', error);
        setIsValidThread(false);
      }
    };

    verifyThreadId();
  }, [threadId, assistantId, activeFeature]);

  // On initial load, try to restore thread ID from local storage
  useEffect(() => {
    // Each feature already loads its own thread ID from storage through getThreadData
    console.log(`[ThreadContext] Initial feature: ${activeFeature}`);
    console.log(`[ThreadContext] Initial thread ID: ${threadId}`);
    console.log(`[ThreadContext] Initial assistant ID: ${assistantId}`);
  }, []);

  return (
    <ThreadContext.Provider value={{ 
      threadId, 
      assistantId,
      activeFeature,
      appStoreAssistantId,
      setThreadId, 
      setAssistantId,
      setActiveFeature,
      isValidThread,
      createNewThread,
      getFeatureThreadId,
      getFeatureAssistantId
    }}>
      {children}
    </ThreadContext.Provider>
  );
};

export const useThread = (): ThreadContextType => {
  const context = useContext(ThreadContext);
  if (context === undefined) {
    throw new Error('useThread must be used within a ThreadProvider');
  }
  return context;
};
