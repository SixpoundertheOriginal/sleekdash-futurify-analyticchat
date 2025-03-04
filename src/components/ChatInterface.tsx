
import { useEffect, useState, useRef } from "react";
import { Sparkles, RefreshCw, Info, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { useThread, DEFAULT_THREAD_ID } from "@/contexts/ThreadContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function ChatInterface() {
  const { 
    message, 
    setMessage, 
    messages, 
    setMessages, 
    isLoading, 
    handleSubmit,
    fetchThreadMessages
  } = useChat();
  
  // Get threadId and other context values
  const { threadId, assistantId, createNewThread, isValidThread } = useThread();
  const { toast } = useToast();
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [lastFileUpload, setLastFileUpload] = useState<Date | null>(null);
  const [isCheckingForResponses, setIsCheckingForResponses] = useState(false);
  
  // Use refs to prevent stale closures
  const pollingTimeoutRef = useRef<number | null>(null);
  const pollingAttemptsRef = useRef(0);
  const maxPollingAttempts = 20; // Increase max polling attempts
  const responseFoundRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Clean up polling timers
  const clearPollingTimers = () => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
  };

  // Function to check for responses from the assistant after file upload
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
      
      // Fetch the latest messages
      const hasNewMessages = await fetchThreadMessages();
      
      // If we found a substantive response (not just the processing message)
      if (hasNewMessages) {
        console.log("[ChatInterface] Found new assistant response, stopping polling");
        responseFoundRef.current = true;
        clearPollingTimers();
        setIsCheckingForResponses(false);
        return;
      }
      
      pollingAttemptsRef.current += 1;
      
      // Continue polling if we haven't reached the max attempts
      if (pollingAttemptsRef.current < maxPollingAttempts) {
        pollingTimeoutRef.current = window.setTimeout(() => {
          checkForNewResponses();
        }, 1500); // Poll more frequently (1.5 seconds)
      } else {
        setIsCheckingForResponses(false);
        console.log("[ChatInterface] Stopped polling after max attempts");

        // Add a message to let the user know polling stopped
        setMessages(prevMessages => {
          const processingMsgIndex = prevMessages.findIndex(msg => 
            msg.role === 'assistant' && 
            msg.content.includes("processing your file")
          );
          
          if (processingMsgIndex !== -1) {
            const updatedMessages = [...prevMessages];
            updatedMessages[processingMsgIndex] = {
              role: 'assistant',
              content: "I've processed your file, but it's taking longer than expected for the analysis to complete. Please check back in a moment or try refreshing the page."
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

  // Implement automatic polling for new messages periodically
  useEffect(() => {
    if (!threadId) return;
    
    // Every 15 seconds, quietly check for new messages in the background
    const autoPollingInterval = setInterval(async () => {
      if (!isCheckingForResponses && !isLoading) {
        // Silent polling without UI indicator
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

  // Handle new file analysis events
  useEffect(() => {
    if (!threadId) {
      console.warn('[ChatInterface] No thread ID available for subscription');
      return;
    }
    
    console.log('[ChatInterface] Setting up real-time subscription for thread:', threadId);
    
    // Reset response tracking when component mounts or thread changes
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
          
          // Reset polling state
          clearPollingTimers();
          pollingAttemptsRef.current = 0;
          responseFoundRef.current = false;
          
          // Update the last file upload timestamp
          setLastFileUpload(new Date());
          
          // Add an immediate message to let the user know file processing is happening
          const processingMessage = "I'm processing your file. I'll analyze your keywords and provide insights shortly...";
          
          // Check if we already have this processing message to avoid duplicates
          if (!messages.some(msg => 
            msg.role === 'assistant' && 
            msg.content.includes("processing your file")
          )) {
            setMessages(prevMessages => [
              ...prevMessages,
              {
                role: 'assistant',
                content: processingMessage
              }
            ]);
          }
          
          // Start polling for new messages immediately
          pollingTimeoutRef.current = window.setTimeout(() => {
            checkForNewResponses();
          }, 1000);
        }
      )
      .subscribe();

    return () => {
      console.log('[ChatInterface] Cleaning up: removing Supabase channel subscription');
      clearPollingTimers();
      supabase.removeChannel(channel);
    };
  }, [threadId, messages, setMessages, fetchThreadMessages]);

  // When the component mounts, check for any pending messages
  useEffect(() => {
    if (threadId) {
      // Check for any pending messages once on mount
      fetchThreadMessages().catch(console.error);
    }
  }, [threadId, fetchThreadMessages]);

  const handleCreateNewThread = async () => {
    setIsCreatingThread(true);
    try {
      const newThreadId = await createNewThread();
      if (newThreadId) {
        // Reset messages for the new thread
        setMessages([{
          role: 'assistant',
          content: '✨ Welcome to your new conversation! How can I help you today?'
        }]);
        
        toast({
          title: "New Thread Created",
          description: "Your conversation history has been reset with a new thread."
        });
      }
    } catch (error) {
      console.error('[ChatInterface] Error creating new thread:', error);
    } finally {
      setIsCreatingThread(false);
    }
  };

  return (
    <Card className="flex h-[700px] flex-col rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 p-3 bg-primary/10">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 h-8 w-8 rounded-full flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-white flex items-center">
              AI Analysis Assistant
              {threadId && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className={`ml-2 ${threadId === DEFAULT_THREAD_ID ? 'bg-primary/20 hover:bg-primary/30' : 'bg-amber-500/20 hover:bg-amber-500/30'} text-xs border-0`}>
                        <Info className="h-3 w-3 mr-1" />
                        {threadId.substring(0, 8)}...
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <p className="text-xs space-y-1">
                        <span className="block font-semibold">{threadId === DEFAULT_THREAD_ID ? "Default Thread" : "Custom Thread"}</span>
                        <span className="block opacity-80">ID: {threadId}</span>
                        <span className="block opacity-80">Assistant: {assistantId?.substring(0, 10)}...</span>
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </h2>
            <p className="text-xs text-white/60">AI-Powered Keyword Analysis</p>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleCreateNewThread}
          disabled={isCreatingThread}
          className="bg-primary/20 border-primary/30 hover:bg-primary/30 text-white text-xs gap-1"
        >
          {isCreatingThread ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : null}
          New Conversation
        </Button>
      </div>
      
      {!isValidThread && (
        <div className="flex items-center gap-2 p-2 bg-red-500/20 text-red-200 text-xs">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="flex-1">
            Thread validation failed. Messages may not be stored correctly.
            <Button
              variant="link"
              className="text-red-200 underline pl-1 h-auto p-0 text-xs"
              onClick={handleCreateNewThread}
            >
              Create new thread?
            </Button>
          </span>
        </div>
      )}
      
      {lastFileUpload && isCheckingForResponses && (
        <div className="flex items-center gap-2 p-2 bg-blue-500/20 text-blue-200 text-xs border-b border-blue-500/20">
          <RefreshCw className="h-3 w-3 flex-shrink-0 animate-spin" />
          <span>
            File uploaded at {lastFileUpload.toLocaleTimeString()}. Analyzing your data...
          </span>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        {messages.map((msg, index) => (
          <ChatMessage key={`${msg.id || msg.role}-${index}`} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        message={message}
        isLoading={isLoading || isCheckingForResponses}
        onMessageChange={setMessage}
        onSubmit={handleSubmit}
      />
    </Card>
  );
}
