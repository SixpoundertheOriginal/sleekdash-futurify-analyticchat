
import { useState, useEffect, useCallback, useRef } from "react";
import { Message } from "@/types/chat";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { useThread } from "@/contexts/ThreadContext";
import { addUserMessage, addAssistantMessage, updateMessagesWithResponse } from "@/utils/message-utils";
import { processThreadMessages, sendThreadMessage } from "@/utils/thread-utils";
import { AssistantType } from "@/utils/thread-management";

interface UseChatOptions {
  preprocessDataFn?: (message: string) => Promise<any>;
  feature?: AssistantType;
}

export const useChat = (options: UseChatOptions = {}) => {
  const { preprocessDataFn, feature = 'general' } = options;
  
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: '✨ Welcome! I\'m your AI assistant. Upload your marketing data, and I\'ll help you analyze it.',
    timestamp: new Date()
  }]);
  const [isLoading, setIsLoading] = useState(false);
  const [preprocessedData, setPreprocessedData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Use the thread context with feature-specific handling
  const threadContext = useThread();
  const { toast } = useToast();
  const { user } = useAuth();

  // Set the active feature when the component mounts
  useEffect(() => {
    threadContext.setActiveFeature(feature);
  }, [feature]);

  // Get the current thread and assistant IDs based on the active feature
  const threadId = threadContext.getFeatureThreadId(feature);
  const assistantId = threadContext.getFeatureAssistantId(feature);

  // Using a ref for processed message IDs to persist across renders
  const processedMessageIdsRef = useRef<Set<string>>(new Set());

  // Log thread information on mount
  useEffect(() => {
    logThreadInfo();
  }, [threadId, assistantId]);

  // Log thread ID and assistant ID
  const logThreadInfo = () => {
    console.log(`[useChat] Using thread ID for ${feature}: ${threadId}`);
    console.log(`[useChat] Using assistant ID for ${feature}: ${assistantId}`);
    
    if (!threadId) {
      console.warn(`[useChat] No thread ID available for ${feature} - this may cause issues with message storage`);
    }
  };

  // Function to fetch messages from OpenAI thread
  const fetchThreadMessagesHandler = useCallback(async (): Promise<boolean> => {
    const result = await processThreadMessages(
      threadId,
      assistantId,
      processedMessageIdsRef.current
    );
    
    if (result.hasNewMessages) {
      setMessages(prevMessages => updateMessagesWithResponse(prevMessages, result.newMessages));
      return true;
    }
    
    return false;
  }, [threadId, assistantId]);

  // Process message data if a preprocessor is provided
  const preprocess = async (messageText: string) => {
    if (!preprocessDataFn) return null;
    
    try {
      setIsProcessing(true);
      console.log('[useChat] Preprocessing message data');
      const data = await preprocessDataFn(messageText);
      setPreprocessedData(data);
      console.log('[useChat] Data preprocessing completed');
      return data;
    } catch (error) {
      console.error('[useChat] Error preprocessing data:', error);
      toast({
        variant: "destructive",
        title: "Processing Error",
        description: error instanceof Error ? error.message : "Failed to process message data"
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    // Use the feature-specific thread ID
    const currentThreadId = threadId;
    
    // Store the message before clearing the input
    const userMessage = message.trim();
    setMessage("");
    
    // Preprocess the message if needed
    let processedData = null;
    if (preprocessDataFn) {
      processedData = await preprocess(userMessage);
      // If preprocessing fails and is required, we might want to stop here
      // But for now, we'll continue with the raw message
    }
    
    // Send the message to the thread
    const messageId = await sendThreadMessage(
      userMessage,
      currentThreadId,
      assistantId,
      setIsLoading,
      setMessages,
      toast,
      addUserMessage,
      addAssistantMessage,
      processedData
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
    isProcessing,
    preprocessedData,
    handleSubmit,
    threadId,
    assistantId,
    feature,
    fetchThreadMessages: fetchThreadMessagesHandler,
    preprocess
  };
};
