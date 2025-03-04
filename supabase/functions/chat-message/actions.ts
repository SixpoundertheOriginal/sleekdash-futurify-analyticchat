
import { corsHeaders } from './utils.ts';
import { getMessagesFromThread, runAssistantOnThread, sendMessageToThread } from './thread-operations.ts';

// Get messages from a thread
export async function handleGetMessages(threadId: string) {
  try {
    console.log('[chat-message:actions] Getting messages from thread:', threadId);
    const messages = await getMessagesFromThread(threadId);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        messages: messages
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('[chat-message:actions] Error getting messages:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: { message: `Error getting messages: ${error.message}` }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
}

// Send a message to a thread and run the assistant
export async function handleSendMessage(threadId: string, assistantId: string, message: string) {
  if (!message) {
    console.error('[chat-message:actions] No message provided');
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: { message: 'No message provided' }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      }
    );
  }

  try {
    console.log(`[chat-message:actions] Sending message to thread: ${threadId}`);
    console.log(`[chat-message:actions] Using assistant: ${assistantId}`);
    console.log(`[chat-message:actions] Message content: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`);
    
    // 1. Send the user message to the thread
    const userMessageId = await sendMessageToThread(threadId, message);
    console.log(`[chat-message:actions] User message sent with ID: ${userMessageId}`);
    
    // 2. Run the assistant on the thread
    const runId = await runAssistantOnThread(threadId, assistantId);
    console.log(`[chat-message:actions] Assistant run started with ID: ${runId}`);
    
    // 3. Get the assistant's latest response
    console.log('[chat-message:actions] Retrieving messages to find assistant response');
    const allMessages = await getMessagesFromThread(threadId);
    
    // Filter to find assistant messages that are newer than the user message
    const assistantResponses = allMessages
      .filter(msg => msg.role === 'assistant')
      .map(msg => {
        // Extract assistant message content
        let content = '';
        if (typeof msg.content === 'string') {
          content = msg.content;
        } else if (Array.isArray(msg.content)) {
          content = msg.content
            .filter(part => part.type === 'text')
            .map(part => part.text?.value || '')
            .join('\n');
        }
        
        return {
          id: msg.id,
          content,
          created_at: msg.created_at
        };
      })
      .filter(msg => msg.content.trim().length > 0);
    
    // Get the latest assistant response
    const latestResponse = assistantResponses[0];
    
    // Process and return the results
    const analysis = latestResponse?.content || 'I\'m processing your request. Please wait a moment and check back for my response.';
    const messageId = latestResponse?.id;
    
    console.log(`[chat-message:actions] Response found with ID: ${messageId}`);
    console.log(`[chat-message:actions] Response content (preview): ${analysis.substring(0, 100)}${analysis.length > 100 ? '...' : ''}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: messageId,
        analysis: analysis,
        threadId: threadId
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('[chat-message:actions] Error in handleSendMessage:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: { message: `Error processing message: ${error.message}` }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
}
