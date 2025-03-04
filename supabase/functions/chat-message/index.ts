
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const DEFAULT_THREAD_ID = 'thread_2saO94Wc9LZobi27LwrKoqEw';
const DEFAULT_ASSISTANT_ID = 'asst_EYm70EgIE2okxc8onNc1DVTj';

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
      // Retrieve messages from the thread
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
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Failed to retrieve thread messages: ${errorText}` 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      const messagesData = await listResponse.json();
      console.log('[chat-message] Retrieved messages count:', messagesData.data?.length || 0);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          messages: messagesData.data || []
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } 
    else if (action === 'send_message') {
      // This is the original functionality for sending a message
      const message = body.message;
      
      if (!message) {
        console.error('[chat-message] No message provided');
        return new Response(
          JSON.stringify({ error: 'No message provided' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 400 
          }
        );
      }

      // 1. Add the user's message to the thread
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
        return new Response(
          JSON.stringify({ error: { message: `Failed to add message to thread: ${errorText}` } }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 400 
          }
        );
      }
      
      console.log('[chat-message] Message added to thread successfully');

      // 2. Run the assistant to process the message
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
        return new Response(
          JSON.stringify({ error: { message: `Failed to run assistant: ${errorText}` } }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 400 
          }
        );
      }
      
      const runData = await runResponse.json();
      console.log('[chat-message] Assistant run initiated:', runData.id);

      // 3. Wait for the run to complete
      let runStatus = runData;
      let attempts = 0;
      const maxAttempts = 30; // Timeout after 30 attempts (90 seconds)
      
      while (runStatus.status !== 'completed' && runStatus.status !== 'failed' && attempts < maxAttempts) {
        console.log(`[chat-message] Waiting for assistant run to complete. Current status: ${runStatus.status}, attempt: ${attempts + 1}`);
        
        // Wait 3 seconds before checking again
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check the status of the run
        const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runData.id}`, {
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v2'
          },
        });
        
        if (!statusResponse.ok) {
          const errorText = await statusResponse.text();
          console.error('[chat-message] Error checking run status:', errorText);
          break;
        }
        
        runStatus = await statusResponse.json();
        attempts++;
      }
      
      if (runStatus.status === 'failed') {
        console.error('[chat-message] Assistant run failed:', runStatus.last_error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: { message: `Assistant run failed: ${runStatus.last_error?.message || 'Unknown error'}` } 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      if (attempts >= maxAttempts) {
        console.error('[chat-message] Timeout waiting for assistant run to complete');
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: { message: 'Timeout waiting for assistant run to complete' } 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      console.log('[chat-message] Assistant run completed successfully');

      // 4. Get the latest messages from the thread
      console.log('[chat-message] Retrieving messages from thread');
      
      const listResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        },
      });
      
      if (!listResponse.ok) {
        const errorText = await listResponse.text();
        console.error('[chat-message] Error retrieving thread messages:', errorText);
        return new Response(
          JSON.stringify({ error: { message: `Failed to retrieve assistant response: ${errorText}` } }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 400 
          }
        );
      }
      
      const messagesData = await listResponse.json();
      console.log('[chat-message] Retrieved messages count:', messagesData.data?.length || 0);
      
      // Get the latest assistant message (should be the first in the list)
      const assistantMessages = messagesData.data.filter(msg => msg.role === 'assistant');
      
      if (assistantMessages.length === 0) {
        console.error('[chat-message] No assistant messages found in thread');
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: { message: 'No assistant response found' } 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      const latestAssistantMessage = assistantMessages[0];
      console.log('[chat-message] Latest assistant message:', latestAssistantMessage.id);
      
      // Extract the content of the message
      let messageContent = '';
      
      if (typeof latestAssistantMessage.content === 'string') {
        messageContent = latestAssistantMessage.content;
      } else if (Array.isArray(latestAssistantMessage.content) && latestAssistantMessage.content.length > 0) {
        // OpenAI's new format has content as an array of objects
        const textContent = latestAssistantMessage.content.find(item => item.type === 'text');
        if (textContent) {
          messageContent = textContent.text.value;
        }
      }
      
      console.log('[chat-message] Assistant response content length:', messageContent.length);

      return new Response(
        JSON.stringify({ 
          success: true, 
          analysis: messageContent,
          messageId: latestAssistantMessage.id,
          runId: runData.id,
          messagesCount: messagesData.data.length
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      // Unknown action
      console.error('[chat-message] Unknown action requested:', action);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Unknown action: ${action}` 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }
  } catch (error) {
    console.error('[chat-message] Error in chat-message function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: { message: 'Failed to process request: ' + error.message } 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});
