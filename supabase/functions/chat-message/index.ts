
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ASSISTANT_ID = "asst_EYm70EgIE2okxc8onNc1DVTj";
const THREAD_ID = "thread_oiE2rnK04vabHTAGUc9zRMCN";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    // Add the message to the thread
    await fetch(`https://api.openai.com/v1/threads/${THREAD_ID}/messages`, {
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

    // Create a run
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

    const runData = await runResponse.json();
    const runId = runData.id;

    // Poll for the run completion
    let runStatus;
    do {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between polls
      
      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${THREAD_ID}/runs/${runId}`, {
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'OpenAI-Beta': 'assistants=v1'
        }
      });
      
      const statusData = await statusResponse.json();
      runStatus = statusData.status;
      
    } while (runStatus === 'queued' || runStatus === 'in_progress');

    if (runStatus === 'completed') {
      // Get the latest messages
      const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${THREAD_ID}/messages`, {
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'OpenAI-Beta': 'assistants=v1'
        }
      });

      const messagesData = await messagesResponse.json();
      const latestMessage = messagesData.data[0]; // Get the most recent message

      return new Response(
        JSON.stringify({
          message: latestMessage.content[0].text.value,
          threadId: THREAD_ID
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      throw new Error(`Run failed with status: ${runStatus}`);
    }

  } catch (error) {
    console.error('Error in chat-message function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
