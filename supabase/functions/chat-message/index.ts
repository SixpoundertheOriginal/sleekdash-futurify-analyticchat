
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const DEFAULT_THREAD_ID = 'thread_2saO94Wc9LZobi27LwrKoqEw';
const DEFAULT_ASSISTANT_ID = 'asst_EYm70EgIE2okxc8onNc1DVTj';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const { message, threadId = DEFAULT_THREAD_ID, assistantId = DEFAULT_ASSISTANT_ID } = requestData;

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Using thread ID: ${threadId}`);
    console.log(`Using assistant ID: ${assistantId}`);

    // 1. Add a message to the thread
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
      const errorData = await messageResponse.text();
      console.error('Error adding message to thread:', errorData);
      throw new Error(`Failed to add message to thread: ${errorData}`);
    }

    const messageData = await messageResponse.json();
    console.log('Message added to thread:', messageData.id);

    // 2. Run the assistant on the thread
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
      const errorData = await runResponse.text();
      console.error('Error running assistant:', errorData);
      throw new Error(`Failed to run assistant: ${errorData}`);
    }

    const runData = await runResponse.json();
    console.log('Assistant run initiated:', runData.id);

    // 3. Wait for the run to complete
    let runStatus = runData.status;
    let runCompletedData;

    while (runStatus !== 'completed' && runStatus !== 'failed' && runStatus !== 'cancelled') {
      // Wait before checking status again
      await new Promise(resolve => setTimeout(resolve, 1000));

      const runStatusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runData.id}`, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        },
      });

      if (!runStatusResponse.ok) {
        const errorData = await runStatusResponse.text();
        console.error('Error checking run status:', errorData);
        throw new Error(`Failed to check run status: ${errorData}`);
      }

      runCompletedData = await runStatusResponse.json();
      runStatus = runCompletedData.status;
      console.log('Current run status:', runStatus);

      if (runStatus === 'failed') {
        throw new Error(`Run failed: ${JSON.stringify(runCompletedData)}`);
      }
      
      if (runStatus === 'cancelled') {
        throw new Error(`Run cancelled: ${JSON.stringify(runCompletedData)}`);
      }
    }

    // 4. Get the latest message from the thread
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages?limit=1`, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
    });

    if (!messagesResponse.ok) {
      const errorData = await messagesResponse.text();
      console.error('Error retrieving messages:', errorData);
      throw new Error(`Failed to retrieve messages: ${errorData}`);
    }

    const messagesData = await messagesResponse.json();
    
    if (!messagesData.data || messagesData.data.length === 0) {
      throw new Error('No messages found in the thread');
    }

    // Get the latest assistant message
    const latestMessage = messagesData.data[0];
    
    // Extract content from the message
    let analysisContent = '';
    
    if (latestMessage.content && latestMessage.content.length > 0) {
      // OpenAI's API returns content as an array of content blocks
      for (const contentBlock of latestMessage.content) {
        if (contentBlock.type === 'text') {
          analysisContent += contentBlock.text.value;
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: analysisContent,
        messageId: latestMessage.id,
        threadId: threadId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in chat-message function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An unknown error occurred' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
