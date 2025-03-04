
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleError } from './utils.ts';
import { handleGetMessages, handleSendMessage } from './actions.ts';

// Environment variables
const DEFAULT_THREAD_ID = 'thread_2saO94Wc9LZobi27LwrKoqEw';
const DEFAULT_ASSISTANT_ID = 'asst_EYm70EgIE2okxc8onNc1DVTj';

// Main serve function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200
    });
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
    return handleError(error, 'Error in chat-message function');
  }
});
