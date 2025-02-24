
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const ASSISTANT_ID = 'asst_TfGVD0dcL2vsnPCihybxorC7'; // App Store Analysis Assistant ID

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { appDescription } = await req.json();
    console.log('Received app description:', appDescription);

    // Create a thread
    const threadResponse = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1',
      },
      body: JSON.stringify({}),
    });

    const thread = await threadResponse.json();
    console.log('Created thread:', thread.id);
    
    // Add message to thread
    await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1',
      },
      body: JSON.stringify({
        role: 'user',
        content: `Please analyze this app store data: ${appDescription}`,
      }),
    });

    // Run the assistant
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1',
      },
      body: JSON.stringify({
        assistant_id: ASSISTANT_ID,
      }),
    });

    const run = await runResponse.json();
    console.log('Started run:', run.id);

    // Poll for completion
    let runStatus = await checkRunStatus(thread.id, run.id);
    while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await checkRunStatus(thread.id, run.id);
    }
    console.log('Run completed with status:', runStatus.status);

    // Get messages
    const messagesResponse = await fetch(
      `https://api.openai.com/v1/threads/${thread.id}/messages`,
      {
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'OpenAI-Beta': 'assistants=v1',
        },
      }
    );

    const messages = await messagesResponse.json();
    console.log('Received messages:', messages);

    if (!messages.data || messages.data.length === 0) {
      throw new Error('No response received from assistant');
    }

    const assistantMessage = messages.data[0].content[0].text.value;

    return new Response(JSON.stringify({ analysis: assistantMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-app-store function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function checkRunStatus(threadId: string, runId: string) {
  const response = await fetch(
    `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
    {
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'OpenAI-Beta': 'assistants=v1',
      },
    }
  );
  return await response.json();
}
