import { createResponse, handleError, extractMessageContent } from './utils.ts';
import { getMessagesFromThread, addMessageToThread, runAssistantOnThread, waitForRunCompletion } from './thread-operations.ts';

// Function to handle the get_messages action
export async function handleGetMessages(threadId: string) {
  try {
    const messages = await getMessagesFromThread(threadId);
    
    // Process messages to ensure content is properly extracted
    if (messages && Array.isArray(messages)) {
      const processedMessages = messages.map((msg: any) => {
        // Keep original content format but add processed_content field
        return {
          ...msg,
          processed_content: extractMessageContent(msg)
        };
      });
      
      return createResponse({ 
        success: true, 
        messages: processedMessages
      });
    }
    
    return createResponse({ 
      success: true, 
      messages: []
    });
  } catch (error) {
    return handleError(error, 'Failed to retrieve thread messages');
  }
}

// Function to handle the send_message action
export async function handleSendMessage(threadId: string, assistantId: string, message: string) {
  try {
    if (!message) {
      console.error('[chat-message] No message provided');
      return createResponse(
        { error: 'No message provided' },
        400
      );
    }

    // 1. Add the user's message to the thread
    await addMessageToThread(threadId, message);

    // 2. Run the assistant to process the message
    const runData = await runAssistantOnThread(threadId, assistantId);

    // 3. Wait for the run to complete
    await waitForRunCompletion(threadId, runData.id);

    // 4. Get the latest messages from the thread
    const messages = await getMessagesFromThread(threadId);
    
    // Get the latest assistant message (should be the first in the list)
    const assistantMessages = messages.filter(msg => msg.role === 'assistant');
    
    if (assistantMessages.length === 0) {
      console.error('[chat-message] No assistant messages found in thread');
      return createResponse(
        { 
          success: false, 
          error: { message: 'No assistant response found' } 
        },
        400
      );
    }
    
    const latestAssistantMessage = assistantMessages[0];
    console.log('[chat-message] Latest assistant message:', latestAssistantMessage.id);
    
    // Extract the content of the message using our helper function
    const messageContent = extractMessageContent(latestAssistantMessage);
    
    console.log('[chat-message] Assistant response content length:', messageContent.length);
    console.log('[chat-message] Assistant response preview:', messageContent.substring(0, 100) + '...');

    return createResponse({ 
      success: true, 
      analysis: messageContent,
      messageId: latestAssistantMessage.id,
      runId: runData.id,
      messagesCount: messages.length
    });
  } catch (error) {
    return handleError(error, 'Failed to process message');
  }
}
