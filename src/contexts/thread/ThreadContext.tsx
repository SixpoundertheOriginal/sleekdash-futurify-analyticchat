
import React, { createContext, useContext } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { 
  AssistantType, 
  getThreadData, 
  getAssistantId, 
  saveThreadId
} from '@/utils/thread-management';
import { createNewThread } from '@/utils/thread-context-utils';
import { useThreadState, DEFAULT_THREAD_ID, DEFAULT_ASSISTANT_ID, APP_STORE_ASSISTANT_ID } from './ThreadState';

// Re-export constants for backward compatibility
export { DEFAULT_THREAD_ID, DEFAULT_ASSISTANT_ID, APP_STORE_ASSISTANT_ID };

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
  const threadState = useThreadState();
  const { toast } = useToast();

  // Get thread ID for a specific feature
  const getFeatureThreadId = (feature: AssistantType): string => {
    return feature === threadState.activeFeature 
      ? threadState.threadId 
      : getThreadData(feature).threadId;
  };

  // Get assistant ID for a specific feature
  const getFeatureAssistantId = (feature: AssistantType): string => {
    return getAssistantId(feature);
  };

  // Create a new thread
  const handleCreateNewThread = async (): Promise<string | null> => {
    return createNewThread(
      threadState.activeFeature,
      (threadId) => {
        threadState.setThreadId(threadId);
        toast({
          title: "Thread Created",
          description: `New thread created for ${threadState.activeFeature}: ${threadId.substring(0, 10)}...`
        });
      },
      (error) => {
        toast({
          variant: "destructive",
          title: "Thread Creation Failed",
          description: error.message
        });
      }
    );
  };

  return (
    <ThreadContext.Provider value={{ 
      ...threadState,
      createNewThread: handleCreateNewThread,
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
