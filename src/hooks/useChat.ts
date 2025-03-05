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
  
  const threadContext = useThread();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    threadContext.setActiveFeature(feature);
  }, [feature]);

  const threadId = threadContext.getFeatureThreadId(feature);
  const assistantId = threadContext.getFeatureAssistantId(feature);

  const processedMessageIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    logThreadInfo();
  }, [threadId, assistantId]);

  const logThreadInfo = () => {
    console.log(`[useChat] Using thread ID for ${feature}: ${threadId}`);
    console.log(`[useChat] Using assistant ID for ${feature}: ${assistantId}`);
    
    if (!threadId) {
      console.warn(`[useChat] No thread ID available for ${feature} - this may cause issues with message storage`);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const currentThreadId = threadId;
    
    const userMessage = message.trim();
    setMessage("");
    
    let processedData = null;
    if (preprocessDataFn) {
      processedData = await preprocess(userMessage);
    }
    
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
    
    if (messageId) {
      processedMessageIdsRef.current.add(messageId);
    }
  };

  const sendMessage = async (
    userMessage: string, 
    currentThreadId?: string, 
    currentAssistantId?: string
  ): Promise<string> => {
    if (!userMessage.trim()) return "";
    
    const threadToUse = currentThreadId || threadId;
    const assistantToUse = currentAssistantId || assistantId;
    
    try {
      let processedData = null;
      if (preprocessDataFn) {
        processedData = await preprocess(userMessage);
      }
      
      const messageId = await sendThreadMessage(
        userMessage,
        threadToUse,
        assistantToUse,
        setIsLoading,
        setMessages,
        toast,
        addUserMessage,
        addAssistantMessage,
        processedData
      );
      
      if (messageId) {
        processedMessageIdsRef.current.add(messageId);
      }
      
      const lastMessage = messages[messages.length - 1];
      return lastMessage.role === 'assistant' ? lastMessage.content : "";
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message"
      });
      return "";
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
    sendMessage,
    threadId,
    assistantId,
    feature,
    fetchThreadMessages: fetchThreadMessagesHandler,
    preprocess
  };
};
