
import { useState, useEffect, useCallback, useRef } from "react";
import { Message } from "@/types/chat";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { useThread, DEFAULT_THREAD_ID } from "@/contexts/ThreadContext";
import { fetchThreadMessages, sendMessageToThread } from "@/services/openai-service";
import { addUserMessage, addAssistantMessage, updateMessagesWithResponse } from "@/utils/message-utils";

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

  // Using a ref for processed message IDs to persist across renders
  const processedMessageIdsRef = useRef<Set<string>>(new Set());

  // Log the thread ID to confirm we're using the correct one
  useEffect(() => {
    console.log(`[useChat] Using thread ID from context: ${threadId}`);
    console.log(`[useChat] Using assistant ID from context: ${assistantId}`);
    
    if (!threadId) {
      console.warn('[useChat] No thread ID available - this may cause issues with message storage');
    }
  }, [threadId, assistantId]);

  // Function to fetch messages from OpenAI thread
  const fetchThreadMessagesHandler = useCallback(async (): Promise<boolean> => {
    if (!threadId) {
      console.warn('[useChat] Cannot fetch thread messages: No thread ID available');
      return false;
    }

    const { newMessages, hasNewMessages } = await fetchThreadMessages(
      threadId,
      assistantId,
      processedMessageIdsRef.current
    );
    
    if (hasNewMessages) {
      setMessages(prevMessages => updateMessagesWithResponse(prevMessages, newMessages));
      return true;
    }
    
    return false;
  }, [threadId, assistantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    // Always use the threadId from context, with fallback to DEFAULT_THREAD_ID
    const currentThreadId = threadId || DEFAULT_THREAD_ID;
    const userMessage = message.trim();
    
    console.log("[useChat] Submitting message with thread ID:", currentThreadId);
    
    setMessage("");
    setMessages(prev => addUserMessage(prev, userMessage));
    setIsLoading(true);

    try {
      const functionData = await sendMessageToThread(userMessage, currentThreadId, assistantId);

      // Check if there's an OpenAI error in the response
      if (functionData.error) {
        console.error('[useChat] OpenAI error in response:', functionData.error);
        
        // Display the OpenAI error in the chat instead of a generic message
        setMessages(prev => addAssistantMessage(
          prev, 
          `❌ I encountered an error processing your message: ${functionData.error.message || 'Unknown error'}`
        ));
        
        // Also show a toast notification about the error
        toast({
          variant: "destructive",
          title: "OpenAI Error",
          description: functionData.error.message || "There was an error processing your message."
        });
        
        return;
      }

      if (!functionData.analysis) {
        console.error('[useChat] No analysis content in response:', functionData);
        throw new Error('Empty response received from the assistant');
      }

      console.log("[useChat] Setting assistant message:", functionData.analysis.substring(0, 100) + '...');

      // Record this message ID as processed to avoid duplicates
      if (functionData.messageId) {
        processedMessageIdsRef.current.add(functionData.messageId);
      }
      
      setMessages(prev => addAssistantMessage(prev, functionData.analysis, functionData.messageId));

    } catch (error) {
      console.error('[useChat] Error processing message:', error);
      setMessages(prev => addAssistantMessage(
        prev, 
        '❌ I apologize, but I encountered an error processing your message. Please try again.'
      ));
      
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
    fetchThreadMessages: fetchThreadMessagesHandler
  };
};
