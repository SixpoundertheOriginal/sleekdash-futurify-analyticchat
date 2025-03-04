
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
  const { threadId, assistantId } = useThread();
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Log the thread ID to confirm we're using the correct one
  useEffect(() => {
    console.log(`[useChat] Using thread ID from context: ${threadId}`);
    console.log(`[useChat] Using assistant ID from context: ${assistantId}`);
    
    if (!threadId) {
      console.warn('[useChat] No thread ID available - this may cause issues with message storage');
    }
  }, [threadId, assistantId]);

  // Function to fetch messages from OpenAI thread
  const fetchThreadMessages = async () => {
    if (!threadId) {
      console.warn('[useChat] Cannot fetch thread messages: No thread ID available');
      return;
    }

    try {
      console.log('[useChat] Fetching thread messages from OpenAI...');
      
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'chat-message',
        {
          body: { 
            action: 'get_messages',
            threadId: threadId,
            assistantId: assistantId
          }
        }
      );

      if (functionError) {
        console.error('[useChat] Error fetching thread messages:', functionError);
        return;
      }

      if (!functionData?.messages || !Array.isArray(functionData.messages)) {
        console.warn('[useChat] No messages returned from thread fetch or invalid format');
        return;
      }

      // Process and update messages if needed
      const openaiMessages = functionData.messages;
      console.log('[useChat] Received messages from OpenAI thread:', openaiMessages.length);
      
      // Convert OpenAI messages to our format and filter out any we already have
      const newMessages: Message[] = [];
      
      for (const openaiMsg of openaiMessages) {
        // Skip user messages that contain file uploads
        if (openaiMsg.role === 'user' && openaiMsg.content.includes('uploaded a keyword file')) {
          continue;
        }
        
        // Add assistant messages that we don't already have
        if (openaiMsg.role === 'assistant') {
          const msgContent = typeof openaiMsg.content === 'string' 
            ? openaiMsg.content 
            : Array.isArray(openaiMsg.content) && openaiMsg.content.length > 0 
              ? openaiMsg.content[0].text 
              : '';
              
          // Check if we already have this message
          const messageExists = messages.some(msg => 
            msg.role === 'assistant' && 
            msg.content === msgContent
          );
          
          if (!messageExists && msgContent) {
            newMessages.push({
              role: 'assistant',
              content: msgContent
            });
          }
        }
      }
      
      // Add new messages to our state
      if (newMessages.length > 0) {
        console.log('[useChat] Adding new messages from OpenAI thread:', newMessages);
        setMessages(prev => [...prev, ...newMessages]);
      }
    } catch (error) {
      console.error('[useChat] Error fetching thread messages:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    // Always use the threadId from context, with fallback to DEFAULT_THREAD_ID
    const currentThreadId = threadId || DEFAULT_THREAD_ID;
    
    console.log("[useChat] Submitting message with thread ID:", currentThreadId);
    console.log("[useChat] Using assistant ID:", assistantId);
    console.log("[useChat] Message content:", message);

    const userMessage = message.trim();
    setMessage("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      console.log("[useChat] Invoking chat-message function...");
      
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'chat-message',
        {
          body: { 
            message: userMessage,
            threadId: currentThreadId,
            assistantId: assistantId,
            action: 'send_message'
          }
        }
      );

      console.log("[useChat] Response from chat-message:", { functionData, functionError });

      if (functionError) {
        console.error('[useChat] Function error:', functionError);
        throw new Error(functionError.message);
      }

      if (!functionData || !functionData.success) {
        console.error('[useChat] Function returned error:', functionData?.error || 'Unknown error');
        throw new Error(functionData?.error || 'No response received from the assistant');
      }

      // Check if there's an OpenAI error in the response
      if (functionData.error) {
        console.error('[useChat] OpenAI error in response:', functionData.error);
        
        // Display the OpenAI error in the chat instead of a generic message
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `❌ I encountered an error processing your message: ${functionData.error.message || 'Unknown error'}`
        }]);
        
        // Also show a toast notification about the error
        toast({
          variant: "destructive",
          title: "OpenAI Error",
          description: functionData.error.message || "There was an error processing your message."
        });
        
        setIsLoading(false);
        return;
      }

      if (!functionData.analysis) {
        console.error('[useChat] No analysis content in response:', functionData);
        throw new Error('Empty response received from the assistant');
      }

      console.log("[useChat] Setting assistant message:", functionData.analysis.substring(0, 100) + '...');

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: functionData.analysis
      }]);

    } catch (error) {
      console.error('[useChat] Error processing message:', error);
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
    threadId,
    fetchThreadMessages
  };
};
