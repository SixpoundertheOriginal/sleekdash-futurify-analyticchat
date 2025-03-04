
import { corsHeaders, createResponse, handleError } from './utils.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

// Function to retrieve messages from a thread
export async function getMessagesFromThread(threadId: string) {
  console.log('[chat-message] Retrieving messages from thread');
  
  const listResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
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
  
  return messagesData.data || [];
}

// Function to add a message to a thread
export async function addMessageToThread(threadId: string, message: string) {
  console.log('[chat-message] Adding user message to thread:', message.substring(0, 100) + (message.length > 100 ? '...' : ''));
  
  const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
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
export async function runAssistantOnThread(threadId: string, assistantId: string) {
  console.log('[chat-message] Running assistant on thread');
  
  const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
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
export async function waitForRunCompletion(threadId: string, runId: string) {
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
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
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
