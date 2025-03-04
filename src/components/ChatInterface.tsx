
import { useEffect } from "react";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { useThread, DEFAULT_THREAD_ID } from "@/contexts/ThreadContext";

export function ChatInterface() {
  const { 
    message, 
    setMessage, 
    messages, 
    setMessages, 
    isLoading, 
    handleSubmit
  } = useChat();
  
  // Get threadId from the context
  const { threadId } = useThread();

  useEffect(() => {
    if (!threadId) {
      console.warn('No thread ID available for subscription');
      return;
    }
    
    console.log('Setting up real-time subscription for thread:', threadId);
    
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
          console.log('Received new analysis:', payload);
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
      console.log('Cleanup: removing Supabase channel subscription');
      supabase.removeChannel(channel);
    };
  }, [setMessages, threadId]);

  // Display if we're using the default thread or not
  const isUsingDefaultThread = threadId === DEFAULT_THREAD_ID;

  return (
    <div className="flex h-[700px] flex-col rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg">
      <div className="flex items-center gap-2 border-b border-white/10 p-4 bg-primary/10">
        <Sparkles className="h-5 w-5 text-primary animate-pulse" />
        <h2 className="font-semibold text-white">
          AI Analysis Assistant
          {isUsingDefaultThread ? (
            <span className="text-xs text-green-400 ml-2">Using thread: {threadId}</span>
          ) : (
            <span className="text-xs text-amber-400 ml-2">Using custom thread: {threadId}</span>
          )}
        </h2>
      </div>
      
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
