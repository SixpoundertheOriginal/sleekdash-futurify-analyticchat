
import { supabase } from "@/integrations/supabase/client";
import { extractMessageContent } from "@/utils/openai-utils";
import { Message } from "@/types/chat";

/**
 * Fetches messages from an OpenAI thread
 */
export const fetchThreadMessages = async (
  threadId: string, 
  assistantId: string,
  processedMessageIds: Set<string>
): Promise<{ newMessages: Message[], hasNewMessages: boolean }> => {
  try {
    console.log('[openai-service] Fetching thread messages from OpenAI...');
    
    const { data: functionData, error: functionError } = await supabase.functions.invoke(
      'chat-message',
      {
        body: { 
          action: 'get_messages',
          threadId,
          assistantId
        }
      }
    );

    if (functionError) {
      console.error('[openai-service] Error fetching thread messages:', functionError);
      return { newMessages: [], hasNewMessages: false };
    }

    if (!functionData?.messages || !Array.isArray(functionData.messages)) {
      console.warn('[openai-service] No messages returned from thread fetch or invalid format');
      return { newMessages: [], hasNewMessages: false };
    }

    // Process and update messages
    const openaiMessages = functionData.messages;
    console.log('[openai-service] Received messages from OpenAI thread:', openaiMessages.length);
    
    // Filter for assistant messages and messages we haven't processed yet
    const newAssistantMessages = openaiMessages
      .filter(msg => 
        msg.role === 'assistant' && 
        msg.id && 
        !processedMessageIds.has(msg.id)
      )
      .map(msg => {
        return {
          role: 'assistant' as const,
          content: extractMessageContent(msg),
          id: msg.id
        };
      });
    
    const hasNewMessages = newAssistantMessages.length > 0;
    if (hasNewMessages) {
      console.log('[openai-service] Found new assistant messages:', newAssistantMessages.length);
      
      // Mark messages as processed
      newAssistantMessages.forEach(msg => {
        if (msg.id) processedMessageIds.add(msg.id);
      });
    }
    
    return { 
      newMessages: newAssistantMessages,
      hasNewMessages
    };
  } catch (error) {
    console.error('[openai-service] Error fetching thread messages:', error);
    return { newMessages: [], hasNewMessages: false };
  }
};

/**
 * Sends a user message to an OpenAI thread and gets a response
 */
export const sendMessageToThread = async (
  message: string,
  threadId: string,
  assistantId: string
) => {
  console.log("[openai-service] Sending message to thread:", { threadId, message: message.substring(0, 50) });
  
  const { data: functionData, error: functionError } = await supabase.functions.invoke(
    'chat-message',
    {
      body: { 
        message,
        threadId,
        assistantId,
        action: 'send_message'
      }
    }
  );

  console.log("[openai-service] Response from chat-message:", { 
    success: functionData?.success,
    hasError: !!functionError || !!functionData?.error
  });

  if (functionError) {
    throw new Error(functionError.message);
  }

  if (!functionData || !functionData.success) {
    throw new Error(functionData?.error || 'No response received from the assistant');
  }

  return functionData;
};
