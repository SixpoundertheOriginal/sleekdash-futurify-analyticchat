
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleError } from './utils.ts';
import { handleGetMessages, handleSendMessage } from './actions.ts';

// Environment variables
const DEFAULT_THREAD_ID = 'thread_XexaKEggRcir8kQLQbbLqqy9';

// Assistant IDs for different features
const ASSISTANT_IDS = {
  keywords: 'asst_EYm70EgIE2okxc8onNc1DVTj',
  appStore: 'asst_TfGVD0dcL2vsnPCihybxorC7',
  marketing: 'asst_EYm70EgIE2okxc8onNc1DVTj',
  general: 'asst_EYm70EgIE2okxc8onNc1DVTj'
};

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
    
    // Get thread ID and assistant ID, with feature-based fallbacks
    const threadId = body.threadId || DEFAULT_THREAD_ID;
    const feature = body.feature || 'general';
    
    // Select the proper assistant ID based on feature or use provided assistant ID
    const assistantId = body.assistantId || ASSISTANT_IDS[feature] || ASSISTANT_IDS.general;
    
    const action = body.action || 'send_message';
    const preprocessedData = body.preprocessedData || null;

    console.log(`[chat-message] Using thread ID: ${threadId}`);
    console.log(`[chat-message] Using assistant ID: ${assistantId} for feature: ${feature}`);
    console.log(`[chat-message] Requested action: ${action}`);
    if (preprocessedData) {
      console.log('[chat-message] Preprocessed data included in request');
    }

    // Handle different actions
    if (action === 'get_messages') {
      return await handleGetMessages(threadId);
    } 
    else if (action === 'send_message') {
      return await handleSendMessage(threadId, assistantId, body.message, preprocessedData);
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
