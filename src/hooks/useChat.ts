
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
  // Using the updated specific thread ID provided
  const [threadId, setThreadId] = useState<string>("thread_wbaTz1aTmZhcT9bZqpHpTAQj");
  const assistantId = 'asst_EYm70EgIE2okxc8onNc1DVTj';
  const { toast } = useToast();
  const { user } = useAuth();

  // Load thread ID on component mount - using the fixed thread ID
  useEffect(() => {
    console.log(`Using fixed thread ID: ${threadId}`);
  }, [threadId]);

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
