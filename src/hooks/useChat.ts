
import { useState, useEffect, useCallback, useRef } from "react";
import { Message } from "@/types/chat";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { useThread, DEFAULT_THREAD_ID } from "@/contexts/ThreadContext";
import { addUserMessage, addAssistantMessage, updateMessagesWithResponse } from "@/utils/message-utils";
import { processThreadMessages, sendThreadMessage } from "@/utils/thread-utils";

export const useChat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: '✨ Welcome! I\'m your AI assistant. Upload your marketing data, and I\'ll help you analyze it.',
    timestamp: new Date()
  }]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use the thread context
  const { threadId, assistantId } = useThread();
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Using a ref for processed message IDs to persist across renders
  const processedMessageIdsRef = useRef<Set<string>>(new Set());

  // Log thread information on mount
  useEffect(() => {
    logThreadInfo();
    ensureDefaultThread();
  }, [threadId, assistantId]);

  // Log thread ID and assistant ID
  const logThreadInfo = () => {
    console.log(`[useChat] Using thread ID from context: ${threadId}`);
    console.log(`[useChat] Using assistant ID from context: ${assistantId}`);
    
    if (!threadId) {
      console.warn('[useChat] No thread ID available - this may cause issues with message storage');
    }
  };

  // Ensure default thread ID is set in localStorage
  const ensureDefaultThread = () => {
    if (localStorage.getItem('appThreadId') !== DEFAULT_THREAD_ID) {
      console.log(`[useChat] Updating stored thread ID to new value: ${DEFAULT_THREAD_ID}`);
      localStorage.setItem('appThreadId', DEFAULT_THREAD_ID);
    }
  };

  // Function to fetch messages from OpenAI thread
  const fetchThreadMessagesHandler = useCallback(async (): Promise<boolean> => {
    const result = await processThreadMessages(
      threadId || DEFAULT_THREAD_ID,
      assistantId,
      processedMessageIdsRef.current
    );
    
    if (result.hasNewMessages) {
      setMessages(prevMessages => updateMessagesWithResponse(prevMessages, result.newMessages));
      return true;
    }
    
    return false;
  }, [threadId, assistantId]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    // Always use the threadId from context, with fallback to DEFAULT_THREAD_ID
    const currentThreadId = threadId || DEFAULT_THREAD_ID;
    
    // Store the message before clearing the input
    const userMessage = message.trim();
    setMessage("");
    
    // Send the message to the thread
    const messageId = await sendThreadMessage(
      userMessage,
      currentThreadId,
      assistantId,
      setIsLoading,
      setMessages,
      toast,
      addUserMessage,
      addAssistantMessage
    );
    
    // Add the message ID to the set of processed message IDs
    if (messageId) {
      processedMessageIdsRef.current.add(messageId);
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
