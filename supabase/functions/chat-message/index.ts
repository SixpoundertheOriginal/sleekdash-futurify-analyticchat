
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

    const { message } = await req.json();
    console.log('Received message:', message);

    // Add the message to the thread
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
      throw new Error(`Failed to add message: ${await messageResponse.text()}`);
    }

    // Create a run to process the message
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
      throw new Error(`Failed to create run: ${await runResponse.text()}`);
    }

    const runData = await runResponse.json();
    const runId = runData.id;

    // Poll for the run completion
    let runStatus = 'queued';
    let attempts = 0;
    const maxAttempts = 30;
    
    while (runStatus !== 'completed' && attempts < maxAttempts) {
      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${THREAD_ID}/runs/${runId}`, {
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'OpenAI-Beta': 'assistants=v1'
        }
      });

      if (!statusResponse.ok) {
        throw new Error(`Failed to check run status: ${await statusResponse.text()}`);
      }

      const statusData = await statusResponse.json();
      runStatus = statusData.status;

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
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${THREAD_ID}/messages`, {
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'OpenAI-Beta': 'assistants=v1'
      }
    });

    if (!messagesResponse.ok) {
      throw new Error(`Failed to get messages: ${await messagesResponse.text()}`);
    }

    const messagesData = await messagesResponse.json();
    const latestAssistantMessage = messagesData.data
      .filter((msg: any) => msg.role === 'assistant')[0];

    if (!latestAssistantMessage) {
      throw new Error('No assistant response found');
    }

    const assistantResponse = latestAssistantMessage.content[0].text.value;

    return new Response(
      JSON.stringify({ 
        analysis: assistantResponse 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error processing chat message:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
