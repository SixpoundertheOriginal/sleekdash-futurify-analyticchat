
import { useState, useEffect } from "react";
import { Message } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { useThread, DEFAULT_THREAD_ID } from "@/contexts/ThreadContext";

export const useChat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: '✨ Welcome! I\'m your AI assistant. Upload your marketing data, and I\'ll help you analyze it.'
  }]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use the thread context
  const { threadId, assistantId, setThreadId } = useThread();
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Force the threadId to match DEFAULT_THREAD_ID to ensure consistency
  useEffect(() => {
    if (threadId !== DEFAULT_THREAD_ID) {
      console.log(`Ensuring thread consistency: updating from ${threadId} to ${DEFAULT_THREAD_ID}`);
      setThreadId(DEFAULT_THREAD_ID);
    }
  }, [threadId, setThreadId]);

  // Log the thread ID to confirm we're using the correct one
  useEffect(() => {
    console.log(`Using thread ID from context: ${threadId}`);
  }, [threadId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Always use the DEFAULT_THREAD_ID
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'chat-message',
        {
          body: { 
            message: userMessage,
            threadId: DEFAULT_THREAD_ID,
            assistantId: assistantId
          }
        }
      );

      if (functionError) {
        console.error('Function error:', functionError);
        throw new Error(functionError.message);
      }

      if (!functionData || !functionData.analysis) {
        throw new Error('No response received from the assistant');
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: functionData.analysis
      }]);

    } catch (error) {
      console.error('Error processing message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '❌ I apologize, but I encountered an error processing your message. Please try again.' 
      }]);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process your message. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    message,
    setMessage,
    messages,
    setMessages,
    isLoading,
    handleSubmit,
    threadId: DEFAULT_THREAD_ID // Always return the DEFAULT_THREAD_ID
  };
};
