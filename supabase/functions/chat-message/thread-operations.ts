
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { extractMessageContent } from './utils.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

export async function getMessagesFromThread(threadId: string) {
  try {
    console.log(`[thread-operations] Fetching messages from thread: ${threadId}`);
    
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages?limit=50&order=desc`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[thread-operations] OpenAI API error: ${error}`);
      throw new Error(`Failed to get messages from thread: ${error}`);
    }

    const data = await response.json();
    console.log(`[thread-operations] Fetched ${data.data.length} messages from thread`);
    
    return data.data;
  } catch (error) {
    console.error('[thread-operations] Error fetching messages:', error);
    throw new Error(`Failed to get messages from thread: ${error.message}`);
  }
}

export async function sendMessageToThread(threadId: string, message: string) {
  try {
    console.log(`[thread-operations] Sending message to thread: ${threadId}`);
    console.log(`[thread-operations] Message: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`);
    
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        role: 'user',
        content: message
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[thread-operations] OpenAI API error: ${error}`);
      throw new Error(`Failed to send message to thread: ${error}`);
    }

    const data = await response.json();
    console.log(`[thread-operations] Message sent with ID: ${data.id}`);
    
    return data.id;
  } catch (error) {
    console.error('[thread-operations] Error sending message:', error);
    throw new Error(`Failed to send message to thread: ${error.message}`);
  }
}

export async function runAssistantOnThread(threadId: string, assistantId: string) {
  try {
    console.log(`[thread-operations] Running assistant ${assistantId} on thread ${threadId}`);
    
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        assistant_id: assistantId
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[thread-operations] OpenAI API error: ${error}`);
      throw new Error(`Failed to run assistant on thread: ${error}`);
    }

    const data = await response.json();
    console.log(`[thread-operations] Run started with ID: ${data.id}`);
    
    // Option to poll for completion if needed
    await waitForRunCompletion(threadId, data.id);
    
    return data.id;
  } catch (error) {
    console.error('[thread-operations] Error running assistant:', error);
    throw new Error(`Failed to run assistant on thread: ${error.message}`);
  }
}

async function waitForRunCompletion(threadId: string, runId: string) {
  try {
    let status = 'queued';
    let attempts = 0;
    const maxAttempts = 20; // Prevent infinite loops
    
    while (status !== 'completed' && status !== 'failed' && attempts < maxAttempts) {
      console.log(`[thread-operations] Checking run status (attempt ${attempts + 1}): ${status}`);
      
      // Avoid polling too quickly
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        }
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error(`[thread-operations] Error checking run status: ${error}`);
        break;
      }
      
      const data = await response.json();
      status = data.status;
      attempts++;
      
      if (status === 'failed') {
        console.error(`[thread-operations] Run failed:`, data.last_error);
        throw new Error(`Assistant run failed: ${data.last_error?.message || 'Unknown error'}`);
      }
    }
    
    console.log(`[thread-operations] Run completed with final status: ${status}`);
    return status === 'completed';
  } catch (error) {
    console.error('[thread-operations] Error waiting for run completion:', error);
    return false;
  }
}

export async function exportChatHistory(threadId: string, format: 'json' | 'csv' | 'pdf' = 'json') {
  try {
    console.log(`[thread-operations] Exporting chat history from thread: ${threadId} in ${format} format`);
    
    // Get all messages from the thread
    const messages = await getMessagesFromThread(threadId);
    
    // Format messages based on requested format
    if (format === 'json') {
      return {
        success: true,
        data: messages,
        format: 'json'
      };
    }
    
    if (format === 'csv') {
      // Create CSV format
      const headers = 'timestamp,role,content\n';
      const rows = messages.map((msg: any) => {
        const content = extractMessageContent(msg);
        const timestamp = new Date(msg.created_at).toISOString();
        return `"${timestamp}","${msg.role}","${content.replace(/"/g, '""')}"`; // Escape quotes
      }).join('\n');
      
      return {
        success: true,
        data: headers + rows,
        format: 'csv'
      };
    }
    
    // For PDF we'd typically generate this server-side with a library
    // Since we can't do that in an edge function, we'd return data to be formatted
    // client-side, or use a dedicated PDF service
    return {
      success: true,
      data: messages,
      format: 'pdf_ready_data'
    };
  } catch (error) {
    console.error('[thread-operations] Error exporting chat history:', error);
    throw new Error(`Failed to export chat history: ${error.message}`);
  }
}
