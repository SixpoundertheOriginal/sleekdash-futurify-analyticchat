
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ASSISTANT_ID = 'asst_EYm70EgIE2okxc8onNc1DVTj';
const THREAD_ID = 'thread_HBqkU1GtWrBXoJwfyLZrswcb';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    // Parse the request body and validate message
    const { message } = await req.json();
    if (!message || typeof message !== 'string') {
      throw new Error('Invalid or missing message');
    }
    console.log('Processing message:', message);

    // Add the message to the thread
    console.log('Adding message to thread...');
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${THREAD_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify({
        role: 'user',
        content: message
      })
    });

    if (!messageResponse.ok) {
      const errorText = await messageResponse.text();
      console.error('Message addition failed:', errorText);
      throw new Error(`Failed to add message: ${errorText}`);
    }

    // Create a run to process the message
    console.log('Creating run...');
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${THREAD_ID}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify({
        assistant_id: ASSISTANT_ID
      })
    });

    if (!runResponse.ok) {
      const errorText = await runResponse.text();
      console.error('Run creation failed:', errorText);
      throw new Error(`Failed to create run: ${errorText}`);
    }

    const runData = await runResponse.json();
    const runId = runData.id;
    console.log('Run created with ID:', runId);

    // Poll for the run completion
    let runStatus = 'queued';
    let attempts = 0;
    const maxAttempts = 60; // Increased timeout to 60 seconds
    
    console.log('Waiting for run completion...');
    while (runStatus !== 'completed' && attempts < maxAttempts) {
      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${THREAD_ID}/runs/${runId}`, {
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'OpenAI-Beta': 'assistants=v1'
        }
      });

      if (!statusResponse.ok) {
        const errorText = await statusResponse.text();
        console.error('Status check failed:', errorText);
        throw new Error(`Failed to check run status: ${errorText}`);
      }

      const statusData = await statusResponse.json();
      runStatus = statusData.status;
      console.log('Current run status:', runStatus);

      if (runStatus === 'failed' || runStatus === 'cancelled' || runStatus === 'expired') {
        throw new Error(`Run failed with status: ${runStatus}`);
      }

      if (runStatus !== 'completed') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }
    }

    if (runStatus !== 'completed') {
      throw new Error('Run timed out');
    }

    // Get the latest message from the thread
    console.log('Fetching assistant response...');
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${THREAD_ID}/messages?limit=1`, {
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'OpenAI-Beta': 'assistants=v1'
      }
    });

    if (!messagesResponse.ok) {
      const errorText = await messagesResponse.text();
      console.error('Message fetch failed:', errorText);
      throw new Error(`Failed to get messages: ${errorText}`);
    }

    const messagesData = await messagesResponse.json();
    const latestAssistantMessage = messagesData.data
      .filter((msg: any) => msg.role === 'assistant')[0];

    if (!latestAssistantMessage) {
      throw new Error('No assistant response found');
    }

    const assistantResponse = latestAssistantMessage.content[0].text.value;
    console.log('Successfully retrieved assistant response');

    return new Response(
      JSON.stringify({ 
        analysis: assistantResponse 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error in chat-message function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred'
      }),
      { 
        status: 400, // Changed from 500 to 400 for client errors
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
