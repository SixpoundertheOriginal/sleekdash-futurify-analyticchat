
import { useState, useEffect } from "react";
import { Message } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/AuthProvider";

export const useChat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: '✨ Welcome! I\'m your AI assistant. Upload your marketing data, and I\'ll help you analyze it.'
  }]);
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const assistantId = 'asst_EYm70EgIE2okxc8onNc1DVTj';
  const { toast } = useToast();
  const { user } = useAuth();

  // Load or create thread ID on component mount
  useEffect(() => {
    const loadThreadId = async () => {
      if (!user) return;

      try {
        // Try to get existing thread ID from the database
        const { data, error } = await supabase
          .from('user_threads')
          .select('thread_id')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.log('No existing thread found, will create a new one');
          createNewThread();
        } else if (data?.thread_id) {
          console.log('Found existing thread:', data.thread_id);
          setThreadId(data.thread_id);
        } else {
          createNewThread();
        }
      } catch (error) {
        console.error('Error loading thread:', error);
        createNewThread();
      }
    };

    loadThreadId();
  }, [user]);

  const createNewThread = async () => {
    if (!user) return;

    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'create-thread',
        {}
      );

      if (functionError) {
        console.error('Function error:', functionError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create a new thread. Please try again."
        });
        return;
      }

      if (functionData?.threadId) {
        console.log('Created new thread:', functionData.threadId);
        setThreadId(functionData.threadId);

        // Save the new thread ID to the database
        const { error: saveError } = await supabase
          .from('user_threads')
          .upsert({
            user_id: user.id,
            thread_id: functionData.threadId,
            created_at: new Date().toISOString()
          });

        if (saveError) {
          console.error('Error saving thread ID:', saveError);
        }
      }
    } catch (error) {
      console.error('Error creating thread:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to initialize the chat. Please refresh the page."
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading || !threadId) return;

    const userMessage = message.trim();
    setMessage("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'chat-message',
        {
          body: { 
            message: userMessage,
            threadId: threadId,
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
    threadId
  };
};
