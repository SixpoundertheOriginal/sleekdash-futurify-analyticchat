
import { useEffect, useState } from "react";
import { Sparkles, AlertTriangle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { useThread, DEFAULT_THREAD_ID } from "@/contexts/ThreadContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export function ChatInterface() {
  const { 
    message, 
    setMessage, 
    messages, 
    setMessages, 
    isLoading, 
    handleSubmit
  } = useChat();
  
  // Get threadId and other context values
  const { threadId, createNewThread, isValidThread } = useThread();
  const { toast } = useToast();
  const [isCreatingThread, setIsCreatingThread] = useState(false);

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
          if (payload.new && payload.new.openai_analysis) {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: payload.new.openai_analysis
            }]);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('[ChatInterface] Cleanup: removing Supabase channel subscription');
      supabase.removeChannel(channel);
    };
  }, [setMessages, threadId]);

  // Display if we're using the default thread or not
  const isUsingDefaultThread = threadId === DEFAULT_THREAD_ID;

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
            {isUsingDefaultThread ? (
              <span className="text-xs text-green-400 ml-2">Thread: {threadId?.substring(0, 10)}...</span>
            ) : (
              <span className="text-xs text-amber-400 ml-2">Custom thread: {threadId?.substring(0, 10)}...</span>
            )}
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
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
      </div>

      <ChatInput
        message={message}
        isLoading={isLoading}
        onMessageChange={setMessage}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
