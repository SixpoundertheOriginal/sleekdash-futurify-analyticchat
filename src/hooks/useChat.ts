
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Message } from '@/types/chat';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const { toast } = useToast();

  const sendMessage = useCallback(async (userMessage: string) => {
    try {
      setIsLoading(true);

      // Add user message to chat
      const userMessageObj: Message = {
        role: 'user',
        content: userMessage
      };
      setMessages(prev => [...prev, userMessageObj]);

      // Call chat function
      const { data, error } = await supabase.functions.invoke('chat-message', {
        body: { 
          message: userMessage,
          threadId: threadId
        }
      });

      if (error) throw error;

      // Update thread ID if it's a new conversation
      if (data.threadId) {
        setThreadId(data.threadId);
      }

      // Add assistant response to chat
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message"
      });
    } finally {
      setIsLoading(false);
    }
  }, [threadId, toast]);

  return {
    messages,
    isLoading,
    sendMessage,
  };
}
