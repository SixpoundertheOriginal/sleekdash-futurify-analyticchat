
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
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key not found',
          analysis: 'I apologize, but I am not properly configured. Please contact support.' 
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Parse the request body and validate message
    const { message } = await req.json();
    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid or missing message',
          analysis: 'I apologize, but I could not understand your message. Please try again.' 
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
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
      return new Response(
        JSON.stringify({ 
          error: 'Failed to process message',
          analysis: 'I encountered an error while processing your message. Please try again.' 
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
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
      return new Response(
        JSON.stringify({ 
          error: 'Failed to process message',
          analysis: 'I encountered an error while processing your message. Please try again.' 
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
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
        return new Response(
          JSON.stringify({ 
            error: 'Failed to check run status',
            analysis: 'I encountered an error while processing your message. Please try again.' 
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        );
      }

      const statusData = await statusResponse.json();
      runStatus = statusData.status;
      console.log('Current run status:', runStatus);

      if (runStatus === 'failed' || runStatus === 'cancelled' || runStatus === 'expired') {
        return new Response(
          JSON.stringify({ 
            error: `Run failed with status: ${runStatus}`,
            analysis: 'I encountered an error while processing your message. Please try again.' 
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        );
      }

      if (runStatus !== 'completed') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }
    }

    if (runStatus !== 'completed') {
      return new Response(
        JSON.stringify({ 
          error: 'Run timed out',
          analysis: 'I apologize, but the request took too long to process. Please try again.' 
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
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
      return new Response(
        JSON.stringify({ 
          error: 'Failed to get messages',
          analysis: 'I encountered an error while retrieving the response. Please try again.' 
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const messagesData = await messagesResponse.json();
    const latestAssistantMessage = messagesData.data
      .filter((msg: any) => msg.role === 'assistant')[0];

    if (!latestAssistantMessage) {
      return new Response(
        JSON.stringify({ 
          error: 'No assistant response found',
          analysis: 'I apologize, but I could not generate a response. Please try again.' 
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
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
        error: error.message || 'An unexpected error occurred',
        analysis: 'I apologize, but I encountered an unexpected error. Please try again.' 
      }),
      { 
        status: 200, // Always return 200 even for errors
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
