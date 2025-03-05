
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleError } from './utils.ts';
import { exportChatHistory } from '../chat-message/thread-operations.ts';
import { formatChatHistory } from './exportFormatters.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    console.log('[export-chat] Request headers:', req.headers);
    const body = await req.json();
    console.log('[export-chat] Received request body:', body);
    
    const { threadId, format } = body;
    
    if (!threadId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Thread ID is required' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }

    // Export the chat history
    const messages = await exportChatHistory(threadId);
    
    // Format the messages according to the requested format
    const { data, mimeType } = formatChatHistory(messages, format || 'json');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        data,
        mimeType,
        filename: `chat-export-${threadId}.${format || 'json'}`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    );
  } catch (error) {
    return handleError(error, 'Error in export-chat function');
  }
});
