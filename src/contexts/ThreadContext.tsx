
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Define constants for thread and assistant IDs
export const DEFAULT_THREAD_ID = 'thread_2saO94Wc9LZobi27LwrKoqEw';
export const DEFAULT_ASSISTANT_ID = 'asst_EYm70EgIE2okxc8onNc1DVTj';

interface ThreadContextType {
  threadId: string;
  assistantId: string;
  setThreadId: (id: string) => void;
  setAssistantId: (id: string) => void;
  isValidThread: boolean;
  createNewThread: () => Promise<string | null>;
}

const ThreadContext = createContext<ThreadContextType | undefined>(undefined);

export const ThreadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always initialize with the default thread ID to ensure consistency
  const [threadId, setThreadId] = useState<string>(DEFAULT_THREAD_ID);
  const [assistantId, setAssistantId] = useState<string>(DEFAULT_ASSISTANT_ID);
  const [isValidThread, setIsValidThread] = useState<boolean>(true);
  const { toast } = useToast();

  const createNewThread = async (): Promise<string | null> => {
    try {
      console.log('[ThreadContext] Creating new thread...');
      
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

      console.log('[ThreadContext] Thread created successfully:', data.threadId);
      
      // Update the thread ID in state and localStorage
      setThreadId(data.threadId);
      localStorage.setItem('appThreadId', data.threadId);
      
      toast({
        title: "Thread Created",
        description: `New thread created: ${data.threadId.substring(0, 10)}...`
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
        
        // Store the current thread ID in local storage for persistence
        localStorage.setItem('appThreadId', threadId);
        setIsValidThread(true);
        
        // Test the thread if it's not the default (optional validation)
        if (threadId !== DEFAULT_THREAD_ID) {
          console.log(`[ThreadContext] Testing custom thread: ${threadId}`);
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
  }, [threadId, assistantId]);

  // On initial load, try to restore thread ID from local storage
  useEffect(() => {
    const storedThreadId = localStorage.getItem('appThreadId');
    if (storedThreadId) {
      console.log(`[ThreadContext] Restoring thread ID from localStorage: ${storedThreadId}`);
      setThreadId(storedThreadId);
    } else {
      console.log(`[ThreadContext] No stored thread ID found, using default: ${DEFAULT_THREAD_ID}`);
      localStorage.setItem('appThreadId', DEFAULT_THREAD_ID);
    }
  }, []);

  return (
    <ThreadContext.Provider value={{ 
      threadId, 
      assistantId,
      setThreadId, 
      setAssistantId,
      isValidThread,
      createNewThread
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
