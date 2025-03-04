
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define constants for thread and assistant IDs
export const DEFAULT_THREAD_ID = 'thread_wbaTz1aTmZhcT9bZqpHpTAQj';
export const DEFAULT_ASSISTANT_ID = 'asst_EYm70EgIE2okxc8onNc1DVTj';

interface ThreadContextType {
  threadId: string;
  assistantId: string;
  setThreadId: (id: string) => void;
  setAssistantId: (id: string) => void;
  isValidThread: boolean;
}

const ThreadContext = createContext<ThreadContextType | undefined>(undefined);

export const ThreadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [threadId, setThreadId] = useState<string>(DEFAULT_THREAD_ID);
  const [assistantId, setAssistantId] = useState<string>(DEFAULT_ASSISTANT_ID);
  const [isValidThread, setIsValidThread] = useState<boolean>(true);

  // Verify thread ID validity on component mount or when it changes
  useEffect(() => {
    const verifyThreadId = async () => {
      try {
        console.log(`Using thread ID: ${threadId}`);
        
        // Store the current thread ID in local storage for persistence
        localStorage.setItem('appThreadId', threadId);
        setIsValidThread(true);
      } catch (error) {
        console.error('Error verifying thread ID:', error);
        setIsValidThread(false);
      }
    };

    verifyThreadId();
  }, [threadId]);

  // On initial load, try to restore thread ID from local storage
  useEffect(() => {
    const storedThreadId = localStorage.getItem('appThreadId');
    if (storedThreadId) {
      // Only use stored thread if it matches our default (for safety)
      if (storedThreadId === DEFAULT_THREAD_ID) {
        setThreadId(storedThreadId);
      } else {
        console.warn('Stored thread ID does not match default, using default instead');
        localStorage.setItem('appThreadId', DEFAULT_THREAD_ID);
      }
    }
  }, []);

  return (
    <ThreadContext.Provider value={{ 
      threadId, 
      assistantId,
      setThreadId, 
      setAssistantId,
      isValidThread 
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
