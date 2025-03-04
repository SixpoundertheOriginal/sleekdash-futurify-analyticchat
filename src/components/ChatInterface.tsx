
import { useEffect, useState } from "react";
import { Sparkles, AlertTriangle, RefreshCw, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { useThread, DEFAULT_THREAD_ID } from "@/contexts/ThreadContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

  // Function to poll for new messages after file upload
  const checkForNewResponses = async () => {
    if (!threadId) return;
    
    try {
      setIsCheckingForResponses(true);
      console.log("[ChatInterface] Polling for new assistant responses...");
      await fetchThreadMessages();
    } catch (error) {
      console.error("[ChatInterface] Error polling for messages:", error);
    } finally {
      setIsCheckingForResponses(false);
    }
  };

  useEffect(() => {
    if (!threadId) {
      console.warn('[ChatInterface] No thread ID available for subscription');
      return;
    }
    
    console.log('[ChatInterface] Setting up real-time subscription for thread:', threadId);
    
    const channel = supabase
      .channel('chat_interface')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'keyword_analyses',
        },
        (payload) => {
          console.log('[ChatInterface] Received new analysis:', payload);
          
          // Update the last file upload timestamp
          setLastFileUpload(new Date());
          
          // Start polling for new messages
          const pollInterval = setInterval(async () => {
            await checkForNewResponses();
            
            // Check if there are messages from the assistant after the file upload
            const hasAssistantResponse = messages.some(msg => 
              msg.role === 'assistant' && 
              msg.content.includes('analyzed your keywords')
            );
            
            if (hasAssistantResponse) {
              clearInterval(pollInterval);
            }
          }, 3000); // Poll every 3 seconds
          
          // Stop polling after 30 seconds to prevent endless polling
          setTimeout(() => {
            clearInterval(pollInterval);
          }, 30000);
          
          // Add an immediate message to let the user know file processing is happening
          if (!messages.some(msg => msg.content.includes('processing your file'))) {
            setMessages(prevMessages => [
              ...prevMessages,
              {
                role: 'assistant',
                content: "I'm processing your file. I'll analyze your keywords and provide insights shortly..."
              }
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('[ChatInterface] Cleanup: removing Supabase channel subscription');
      supabase.removeChannel(channel);
    };
  }, [threadId, messages, setMessages]);

  // Poll for new messages when file upload timestamp changes
  useEffect(() => {
    if (lastFileUpload) {
      // Initial check right after file upload
      checkForNewResponses();
      
      // Set up interval to check for new messages
      const interval = setInterval(() => {
        checkForNewResponses();
      }, 5000); // Check every 5 seconds
      
      // Clear interval after 30 seconds
      const timeout = setTimeout(() => {
        clearInterval(interval);
      }, 30000);
      
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [lastFileUpload]);

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
    <div className="flex h-[700px] flex-col rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 p-4 bg-primary/10">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          <h2 className="font-semibold text-white">
            AI Analysis Assistant
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className={`text-xs ${threadId === DEFAULT_THREAD_ID ? 'text-green-400' : 'text-amber-400'} ml-2 flex items-center gap-1`}>
                    <Info className="h-3 w-3" />
                    Thread: {threadId?.substring(0, 10)}...
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">
                    {threadId === DEFAULT_THREAD_ID 
                      ? "Using default OpenAI thread" 
                      : "Using custom OpenAI thread"}
                    <br />
                    Full ID: {threadId}
                    <br />
                    Assistant ID: {assistantId?.substring(0, 10)}...
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h2>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleCreateNewThread}
          disabled={isCreatingThread}
          className="bg-primary/20 border-primary/30 hover:bg-primary/30 text-white text-xs"
        >
          {isCreatingThread ? (
            <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />
          ) : null}
          New Conversation
        </Button>
      </div>
      
      {!isValidThread && (
        <div className="flex items-center gap-2 p-3 bg-red-500/20 text-red-200 text-sm">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>
            Thread validation failed. Messages may not be stored correctly.
            <Button
              variant="link"
              className="text-red-200 underline pl-1 h-auto p-0"
              onClick={handleCreateNewThread}
            >
              Create new thread?
            </Button>
          </span>
        </div>
      )}
      
      {lastFileUpload && (
        <div className="flex items-center gap-2 p-2 bg-blue-500/20 text-blue-200 text-xs">
          <Info className="h-3 w-3 flex-shrink-0" />
          <span>
            {isCheckingForResponses ? (
              <>File uploaded at {lastFileUpload.toLocaleTimeString()}. Checking for assistant's response...</>
            ) : (
              <>File uploaded at {lastFileUpload.toLocaleTimeString()}. The assistant will process it and respond shortly.</>
            )}
          </span>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
      </div>

      <ChatInput
        message={message}
        isLoading={isLoading || isCheckingForResponses}
        onMessageChange={setMessage}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
