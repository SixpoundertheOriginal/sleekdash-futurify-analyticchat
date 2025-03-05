
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
    
    // Debug: log all messages with content previews
    openaiMessages.forEach((msg: any, index: number) => {
      if (msg.role === 'assistant') {
        const contentType = typeof msg.content;
        const contentPreview = contentType === 'string' 
          ? msg.content.substring(0, 50) 
          : contentType === 'object' && Array.isArray(msg.content)
            ? `[Array:${msg.content.length}]`
            : JSON.stringify(msg.content).substring(0, 50);
        
        console.log(`[openai-service] Message #${index}: id=${msg.id?.substring(0, 10)}, content=${contentPreview}...`);
      }
    });
    
    // Filter for assistant messages and messages we haven't processed yet
    const newAssistantMessages = openaiMessages
      .filter(msg => 
        msg.role === 'assistant' && 
        msg.id && 
        !processedMessageIds.has(msg.id)
      )
      .map(msg => {
        const content = extractMessageContent(msg);
        const contentPreview = content ? content.substring(0, 50) + '...' : 'Empty content';
        console.log(`[openai-service] Processing message ${msg.id?.substring(0, 10)}...: ${contentPreview}`);
        
        // If content is empty or just "[]", try to extract from other properties
        if (!content || content === "[]" || content === "Content unavailable. The message appears to be empty.") {
          console.warn(`[openai-service] Empty content for message ${msg.id}. Attempting to find content in raw message.`);
          console.log('[openai-service] Raw message:', JSON.stringify(msg).substring(0, 300));
          
          // If message has processed_content from the edge function, use that
          if (msg.processed_content && typeof msg.processed_content === 'string') {
            console.log('[openai-service] Using processed_content from edge function');
            return {
              role: 'assistant' as const,
              content: msg.processed_content,
              id: msg.id,
              timestamp: new Date()
            };
          }
        }
        
        return {
          role: 'assistant' as const,
          content: content,
          id: msg.id,
          timestamp: new Date()
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
  assistantId: string,
  preprocessedData?: any
) => {
  console.log("[openai-service] Sending message to thread:", { threadId, message: message.substring(0, 50) });
  
  // Prepare the request body with optional preprocessed data
  const requestBody: any = { 
    message,
    threadId,
    assistantId,
    action: 'send_message'
  };
  
  // Add preprocessed data if available
  if (preprocessedData) {
    requestBody.preprocessedData = preprocessedData;
    console.log("[openai-service] Including preprocessed data in request");
  }

  const { data: functionData, error: functionError } = await supabase.functions.invoke(
    'chat-message',
    {
      body: requestBody
    }
  );

  console.log("[openai-service] Response from chat-message:", { 
    success: functionData?.success,
    hasError: !!functionError || !!functionData?.error,
    analysisLength: functionData?.analysis ? functionData.analysis.length : 0
  });

  if (functionError) {
    throw new Error(functionError.message);
  }

  if (!functionData || !functionData.success) {
    throw new Error(functionData?.error?.message || 'No response received from the assistant');
  }

  if (!functionData.analysis || typeof functionData.analysis !== 'string' || functionData.analysis.trim() === '') {
    console.error('[openai-service] Empty or invalid analysis in response:', functionData);
    throw new Error('Empty response received from the assistant');
  }

  return functionData;
};
