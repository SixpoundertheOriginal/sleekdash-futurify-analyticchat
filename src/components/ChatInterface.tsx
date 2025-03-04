
import { useEffect } from "react";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";

export function ChatInterface() {
  const { 
    message, 
    setMessage, 
    messages, 
    setMessages, 
    isLoading, 
    handleSubmit,
    threadId
  } = useChat();

  useEffect(() => {
    if (!threadId) return;
    
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
      supabase.removeChannel(channel);
    };
  }, [setMessages, threadId]);

  return (
    <div className="flex h-[700px] flex-col rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg">
      <div className="flex items-center gap-2 border-b border-white/10 p-4 bg-primary/10">
        <Sparkles className="h-5 w-5 text-primary animate-pulse" />
        <h2 className="font-semibold text-white">
          AI Analysis Assistant
          {threadId && <span className="text-xs text-white/50 ml-2">Thread: {threadId.substring(0, 8)}...</span>}
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!threadId && (
          <div className="p-3 bg-primary/10 rounded-lg text-white/70 text-sm">
            ⏳ Initializing your personal chat thread...
          </div>
        )}
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
      </div>

      <ChatInput
        message={message}
        isLoading={isLoading || !threadId}
        onMessageChange={setMessage}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
