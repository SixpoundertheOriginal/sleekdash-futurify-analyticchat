
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Message } from '@/types/chat';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch the latest analysis when the component mounts
  useEffect(() => {
    const fetchLatestAnalysis = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('keyword_analyses')
          .select('openai_analysis')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;

        if (data?.openai_analysis) {
          setMessages([
            {
              role: 'assistant',
              content: "I've analyzed your keyword data. Here's what I found:\n\n" + data.openai_analysis
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching analysis:', error);
      }
    };

    fetchLatestAnalysis();

    // Subscribe to changes in the keyword_analyses table
    const channel = supabase
      .channel('keyword_analyses_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'keyword_analyses'
        },
        (payload) => {
          if (payload.new?.openai_analysis) {
            setMessages([
              {
                role: 'assistant',
                content: "I've analyzed your new keyword data. Here's what I found:\n\n" + payload.new.openai_analysis
              }
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
