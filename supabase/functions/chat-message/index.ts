
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

    console.log(`=== CHAT MESSAGE FUNCTION EXECUTION START ===`);
    console.log(`Using thread ID: ${threadId}`);
    console.log(`Using assistant ID: ${assistantId}`);
    console.log(`Message content: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`);

    // 1. Add a message to the thread
    console.log(`📢 Sending message request to OpenAI for thread: ${threadId}`);
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
      console.error('Error adding message to thread:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        console.error('Structured error data:', errorData);
      } catch (e) {
        // Not JSON, that's fine
      }
      throw new Error(`Failed to add message to thread: ${messageResponse.status} ${messageResponse.statusText}`);
    }

    const messageData = await messageResponse.json();
    console.log('✅ Message added to thread:', messageData.id);
    console.log('Message data:', JSON.stringify(messageData, null, 2).substring(0, 200) + '...');

    // 2. Run the assistant on the thread
    console.log(`📢 Running Assistant ${assistantId} for thread: ${threadId}`);
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
      console.error('Error running assistant:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        console.error('Structured error data:', errorData);
      } catch (e) {
        // Not JSON, that's fine
      }
      throw new Error(`Failed to run assistant: ${runResponse.status} ${runResponse.statusText}`);
    }

    const runData = await runResponse.json();
    console.log('✅ Assistant run initiated:', runData.id);
    console.log('Run data:', JSON.stringify(runData, null, 2).substring(0, 200) + '...');

    // 3. Wait for the run to complete
    let runStatus = runData.status;
    let runCompletedData;
    let retryCount = 0;
    const maxRetries = 30; // Maximum number of status check retries
    const initialWaitTime = 1000; // 1 second initial wait
    let currentWaitTime = initialWaitTime;

    console.log('Waiting for run to complete. Initial status:', runStatus);

    while (runStatus !== 'completed' && runStatus !== 'failed' && runStatus !== 'cancelled' && retryCount < maxRetries) {
      // Wait before checking status again, with exponential backoff
      console.log(`Waiting ${currentWaitTime}ms before checking run status again...`);
      await new Promise(resolve => setTimeout(resolve, currentWaitTime));
      
      // Increase wait time for next iteration (capped at 5000ms)
      currentWaitTime = Math.min(currentWaitTime * 1.5, 5000);
      retryCount++;

      console.log(`Checking run status (attempt ${retryCount}/${maxRetries})...`);
      const runStatusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runData.id}`, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        },
      });

      if (!runStatusResponse.ok) {
        const errorText = await runStatusResponse.text();
        console.error('Error checking run status:', errorText);
        throw new Error(`Failed to check run status: ${runStatusResponse.status} ${runStatusResponse.statusText}`);
      }

      runCompletedData = await runStatusResponse.json();
      runStatus = runCompletedData.status;
      console.log('Current run status:', runStatus);

      if (runStatus === 'failed') {
        console.error('Run failed:', JSON.stringify(runCompletedData, null, 2));
        throw new Error(`Run failed: ${runCompletedData.last_error?.message || 'Unknown error'}`);
      }
      
      if (runStatus === 'cancelled') {
        console.error('Run cancelled:', JSON.stringify(runCompletedData, null, 2));
        throw new Error(`Run cancelled: ${runCompletedData.last_error?.message || 'Unknown reason'}`);
      }
    }

    if (retryCount >= maxRetries && runStatus !== 'completed') {
      throw new Error(`Run did not complete within the expected time (status: ${runStatus})`);
    }

    // 4. Get the latest message from the thread
    console.log('Run completed, fetching the latest messages...');
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages?limit=1&order=desc`, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
    });

    if (!messagesResponse.ok) {
      const errorText = await messagesResponse.text();
      console.error('Error retrieving messages:', errorText);
      throw new Error(`Failed to retrieve messages: ${messagesResponse.status} ${messagesResponse.statusText}`);
    }

    const messagesData = await messagesResponse.json();
    console.log('Messages response:', JSON.stringify(messagesData, null, 2).substring(0, 200) + '...');
    
    if (!messagesData.data || messagesData.data.length === 0) {
      throw new Error('No messages found in the thread');
    }

    // Get the latest assistant message
    const latestMessage = messagesData.data[0];
    console.log('Latest message role:', latestMessage.role);
    
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

    console.log('Extracted content length:', analysisContent.length);
    console.log('Content preview:', analysisContent.substring(0, 100) + '...');
    console.log(`=== CHAT MESSAGE FUNCTION EXECUTION COMPLETE ===`);

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
