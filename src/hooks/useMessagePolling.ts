
import { useEffect, useRef, useState } from "react";
import { Message } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";

interface UseMessagePollingProps {
  threadId: string | null;
  isLoading: boolean;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  fetchThreadMessages: () => Promise<boolean>;
}

export function useMessagePolling({
  threadId,
  isLoading,
  messages,
  setMessages,
  fetchThreadMessages
}: UseMessagePollingProps) {
  const [isCheckingForResponses, setIsCheckingForResponses] = useState(false);
  const [lastFileUpload, setLastFileUpload] = useState<Date | null>(null);
  
  const pollingTimeoutRef = useRef<number | null>(null);
  const pollingAttemptsRef = useRef(0);
  const maxPollingAttempts = 20;
  const responseFoundRef = useRef(false);

  const clearPollingTimers = () => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
  };

  const checkForNewResponses = async () => {
    if (!threadId || responseFoundRef.current) {
      clearPollingTimers();
      setIsCheckingForResponses(false);
      
      if (responseFoundRef.current) {
        console.log("[ChatInterface] Response already found, stopping polling");
      }
      
      return;
    }
    
    try {
      setIsCheckingForResponses(true);
      console.log(`[ChatInterface] Polling for assistant responses (attempt ${pollingAttemptsRef.current + 1}/${maxPollingAttempts})`);
      
      const hasNewMessages = await fetchThreadMessages();
      
      if (hasNewMessages) {
        console.log("[ChatInterface] Found new assistant response, stopping polling");
        responseFoundRef.current = true;
        clearPollingTimers();
        setIsCheckingForResponses(false);
        return;
      }
      
      pollingAttemptsRef.current += 1;
      
      if (pollingAttemptsRef.current < maxPollingAttempts) {
        pollingTimeoutRef.current = window.setTimeout(() => {
          checkForNewResponses();
        }, 1500);
      } else {
        setIsCheckingForResponses(false);
        console.log("[ChatInterface] Stopped polling after max attempts");
        
        setMessages(prevMessages => {
          const processingMsgIndex = prevMessages.findIndex(msg => 
            msg.role === 'assistant' && 
            msg.content.includes("processing your file")
          );
          
          if (processingMsgIndex !== -1) {
            const updatedMessages = [...prevMessages];
            updatedMessages[processingMsgIndex] = {
              role: 'assistant',
              content: "I've processed your file, but it's taking longer than expected for the analysis to complete. Please check back in a moment or try refreshing the page.",
              timestamp: new Date()
            };
            return updatedMessages;
          }
          return prevMessages;
        });
      }
    } catch (error) {
      console.error("[ChatInterface] Error during polling:", error);
      setIsCheckingForResponses(false);
    }
  };

  // Set up auto-polling for new messages
  useEffect(() => {
    if (!threadId) return;
    
    const autoPollingInterval = setInterval(async () => {
      if (!isCheckingForResponses && !isLoading) {
        try {
          await fetchThreadMessages();
        } catch (error) {
          console.error("[ChatInterface] Error during auto-polling:", error);
        }
      }
    }, 15000);
    
    return () => {
      clearInterval(autoPollingInterval);
    };
  }, [threadId, isCheckingForResponses, isLoading, fetchThreadMessages]);

  // Subscribe to keyword analysis events
  useEffect(() => {
    if (!threadId) {
      console.warn('[ChatInterface] No thread ID available for subscription');
      return;
    }
    
    responseFoundRef.current = false;
    
    const channel = supabase
      .channel('keyword_analysis_events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'keyword_analyses',
        },
        (payload) => {
          console.log('[ChatInterface] Received new analysis:', payload);
          
          clearPollingTimers();
          pollingAttemptsRef.current = 0;
          responseFoundRef.current = false;
          
          setLastFileUpload(new Date());
          
          const processingMessage = "I'm processing your file. I'll analyze your keywords and provide insights shortly...";
          
          if (!messages.some(msg => 
            msg.role === 'assistant' && 
            msg.content.includes("processing your file")
          )) {
            setMessages(prevMessages => [
              ...prevMessages,
              {
                role: 'assistant',
                content: processingMessage,
                timestamp: new Date()
              }
            ]);
          }
          
          pollingTimeoutRef.current = window.setTimeout(() => {
            checkForNewResponses();
          }, 1000);
        }
      )
      .subscribe();

    return () => {
      clearPollingTimers();
      supabase.removeChannel(channel);
    };
  }, [threadId, messages, setMessages, fetchThreadMessages]);

  // Initial fetch of thread messages
  useEffect(() => {
    if (threadId) {
      fetchThreadMessages().catch(console.error);
    }
  }, [threadId, fetchThreadMessages]);

  return {
    isCheckingForResponses,
    lastFileUpload,
    clearPollingTimers
  };
}
