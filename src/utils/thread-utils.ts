
import { Message } from "@/types/chat";
import { fetchThreadMessages, sendMessageToThread } from "@/services/openai-service";

/**
 * Processes new messages in a thread and tracks processed message IDs
 */
export const processThreadMessages = async (
  threadId: string,
  assistantId: string,
  processedMessageIds: Set<string>
): Promise<{ newMessages: Message[], hasNewMessages: boolean }> => {
  if (!threadId) {
    console.warn('[thread-utils] Cannot fetch thread messages: No thread ID available');
    return { newMessages: [], hasNewMessages: false };
  }

  return await fetchThreadMessages(threadId, assistantId, processedMessageIds);
};

/**
 * Handles sending a message to a thread and updating the UI
 */
export const sendThreadMessage = async (
  message: string,
  threadId: string,
  assistantId: string,
  setIsLoading: (loading: boolean) => void,
  setMessages: (updater: (prev: Message[]) => Message[]) => void,
  showToast: (props: any) => void,
  addUserMessage: (messages: Message[], content: string) => Message[],
  addAssistantMessage: (messages: Message[], content: string, messageId?: string) => Message[],
  preprocessData?: any
): Promise<string | null> => {
  const userMessage = message.trim();
  
  console.log("[thread-utils] Submitting message with thread ID:", threadId);
  
  setIsLoading(true);
  setMessages(prev => addUserMessage(prev, userMessage));

  try {
    // Pass the preprocessed data if it exists
    const functionData = await sendMessageToThread(userMessage, threadId, assistantId, preprocessData);

    // Check if there's an OpenAI error in the response
    if (functionData.error) {
      console.error('[thread-utils] OpenAI error in response:', functionData.error);
      
      // Display the OpenAI error in the chat instead of a generic message
      setMessages(prev => addAssistantMessage(
        prev, 
        `❌ I encountered an error processing your message: ${functionData.error.message || 'Unknown error'}`
      ));
      
      // Also show a toast notification about the error
      showToast({
        variant: "destructive",
        title: "OpenAI Error",
        description: functionData.error.message || "There was an error processing your message."
      });
      
      return null;
    }

    if (!functionData.analysis) {
      console.error('[thread-utils] No analysis content in response:', functionData);
      throw new Error('Empty response received from the assistant');
    }

    console.log("[thread-utils] Setting assistant message:", functionData.analysis.substring(0, 100) + '...');
    
    setMessages(prev => addAssistantMessage(prev, functionData.analysis, functionData.messageId));
    
    return functionData.messageId || null;

  } catch (error) {
    console.error('[thread-utils] Error processing message:', error);
    setMessages(prev => addAssistantMessage(
      prev, 
      '❌ I apologize, but I encountered an error processing your message. Please try again.'
    ));
    
    showToast({
      variant: "destructive",
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to process your message. Please try again."
    });
    
    return null;
  } finally {
    setIsLoading(false);
  }
};
