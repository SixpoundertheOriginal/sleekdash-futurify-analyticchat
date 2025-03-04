import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Environment variables
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const DEFAULT_THREAD_ID = 'thread_2saO94Wc9LZobi27LwrKoqEw';
const DEFAULT_ASSISTANT_ID = 'asst_EYm70EgIE2okxc8onNc1DVTj';

// Helper function to extract content from various message formats
const extractMessageContent = (message: any): string => {
  // For newer OpenAI API format (content as array)
  if (Array.isArray(message.content)) {
    // Collect all text content parts
    const textParts = message.content
      .filter((part: any) => part.type === 'text')
      .map((part: any) => part.text?.value || '');
    
    if (textParts.length > 0) {
      return textParts.join('\n\n');
    }
  }
  
  // For string content
  if (typeof message.content === 'string') {
    return message.content;
  }
  
  // Handle empty content
  if (message.content === "[]" || !message.content) {
    // Try to find content in other properties
    for (const key of ['value', 'text', 'message', 'analysis']) {
      if (message[key] && typeof message[key] === 'string' && message[key].length > 0) {
        return message[key];
      }
    }
  }
  
  // Last resort - check if there's a text value directly in the message
  if (message.text && typeof message.text.value === 'string') {
    return message.text.value;
  }
  
  // Fallback for unknown format
  return typeof message.content === 'object' 
    ? JSON.stringify(message.content) 
    : String(message.content || 'No content available');
};

// Helper function to create a response with CORS headers
const createResponse = (data: any, status = 200) => {
  return new Response(
    JSON.stringify(data),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status 
    }
  );
};

// Helper function to log errors and create error responses
const handleError = (error: any, message: string) => {
  console.error(`[chat-message] ${message}:`, error);
  return createResponse({ 
    success: false, 
    error: { message: `${message}: ${error instanceof Error ? error.message : String(error)}` } 
  }, 500);
};

// Function to retrieve messages from a thread
async function getMessagesFromThread(threadId: string) {
  console.log('[chat-message] Retrieving messages from thread');
  
  const listResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    }
  });
  
  if (!listResponse.ok) {
    const errorText = await listResponse.text();
    console.error('[chat-message] Error retrieving thread messages:', errorText);
    throw new Error(`Failed to retrieve thread messages: ${errorText}`);
  }
  
  const messagesData = await listResponse.json();
  console.log('[chat-message] Retrieved messages count:', messagesData.data?.length || 0);
  
  // Process messages to ensure content is properly extracted
  if (messagesData.data && Array.isArray(messagesData.data)) {
    messagesData.data = messagesData.data.map((msg: any) => {
      // Keep original content format but add processed_content field
      return {
        ...msg,
        processed_content: extractMessageContent(msg)
      };
    });
  }
  
  return messagesData.data || [];
}

// Function to add a message to a thread
async function addMessageToThread(threadId: string, message: string) {
  console.log('[chat-message] Adding user message to thread:', message.substring(0, 100) + (message.length > 100 ? '...' : ''));
  
  const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    },
    body: JSON.stringify({
      role: 'user',
      content: message
    }),
  });

  if (!messageResponse.ok) {
    const errorText = await messageResponse.text();
    console.error('[chat-message] Error adding message to thread:', errorText);
    throw new Error(`Failed to add message to thread: ${errorText}`);
  }
  
  console.log('[chat-message] Message added to thread successfully');
}

// Function to run the assistant on a thread
async function runAssistantOnThread(threadId: string, assistantId: string) {
  console.log('[chat-message] Running assistant on thread');
  
  const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    },
    body: JSON.stringify({
      assistant_id: assistantId
    }),
  });

  if (!runResponse.ok) {
    const errorText = await runResponse.text();
    console.error('[chat-message] Error running assistant:', errorText);
    throw new Error(`Failed to run assistant: ${errorText}`);
  }
  
  const runData = await runResponse.json();
  console.log('[chat-message] Assistant run initiated:', runData.id);
  return runData;
}

// Function to wait for a run to complete
async function waitForRunCompletion(threadId: string, runId: string) {
  let runStatus: any = { status: 'in_progress' };
  let attempts = 0;
  const maxAttempts = 30; // Timeout after 30 attempts (90 seconds)
  
  while (runStatus.status !== 'completed' && runStatus.status !== 'failed' && attempts < maxAttempts) {
    console.log(`[chat-message] Waiting for assistant run to complete. Current status: ${runStatus.status}, attempt: ${attempts + 1}`);
    
    // Wait 3 seconds before checking again
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check the status of the run
    const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
    });
    
    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      console.error('[chat-message] Error checking run status:', errorText);
      throw new Error(`Failed to check run status: ${errorText}`);
    }
    
    runStatus = await statusResponse.json();
    attempts++;
  }
  
  if (runStatus.status === 'failed') {
    console.error('[chat-message] Assistant run failed:', runStatus.last_error);
    throw new Error(`Assistant run failed: ${runStatus.last_error?.message || 'Unknown error'}`);
  }
  
  if (attempts >= maxAttempts) {
    console.error('[chat-message] Timeout waiting for assistant run to complete');
    throw new Error('Timeout waiting for assistant run to complete');
  }
  
  console.log('[chat-message] Assistant run completed successfully');
  return runStatus;
}

// Function to handle the get_messages action
async function handleGetMessages(threadId: string) {
  try {
    const messages = await getMessagesFromThread(threadId);
    
    return createResponse({ 
      success: true, 
      messages: messages
    });
  } catch (error) {
    return handleError(error, 'Failed to retrieve thread messages');
  }
}

// Function to handle the send_message action
async function handleSendMessage(threadId: string, assistantId: string, message: string) {
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

// Main serve function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[chat-message] Request headers:', req.headers);
    const body = await req.json();
    console.log('[chat-message] Received body:', body);
    
    // Get thread ID and assistant ID, with fallbacks
    const threadId = body.threadId || DEFAULT_THREAD_ID;
    const assistantId = body.assistantId || DEFAULT_ASSISTANT_ID;
    const action = body.action || 'send_message';

    console.log(`[chat-message] Using thread ID: ${threadId}`);
    console.log(`[chat-message] Using assistant ID: ${assistantId}`);
    console.log(`[chat-message] Requested action: ${action}`);

    // Handle different actions
    if (action === 'get_messages') {
      return await handleGetMessages(threadId);
    } 
    else if (action === 'send_message') {
      return await handleSendMessage(threadId, assistantId, body.message);
    } else {
      // Unknown action
      console.error('[chat-message] Unknown action requested:', action);
      return createResponse(
        { 
          success: false, 
          error: `Unknown action: ${action}` 
        },
        400
      );
    }
  } catch (error) {
    return handleError(error, 'Error in chat-message function');
  }
});
