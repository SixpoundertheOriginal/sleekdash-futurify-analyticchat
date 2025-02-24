
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const ASSISTANT_ID = 'asst_TfGVD0dcL2vsnPCihybxorC7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate OpenAI API Key
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { appDescription } = await req.json();
    
    // Validate input
    if (!appDescription?.trim()) {
      return new Response(
        JSON.stringify({ error: 'App description is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

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

    if (!threadResponse.ok) {
      const error = await threadResponse.json();
      console.error('Thread creation error:', error);
      throw new Error('Failed to create analysis thread');
    }

    const thread = await threadResponse.json();
    console.log('Created thread:', thread.id);
    
    // Add message to thread
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
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

    if (!messageResponse.ok) {
      const error = await messageResponse.json();
      console.error('Message creation error:', error);
      throw new Error('Failed to submit app description for analysis');
    }

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

    if (!runResponse.ok) {
      const error = await runResponse.json();
      console.error('Run creation error:', error);
      throw new Error('Failed to start analysis');
    }

    const run = await runResponse.json();
    console.log('Started run:', run.id);

    // Poll for completion
    let runStatus = await checkRunStatus(thread.id, run.id);
    let attempts = 0;
    const maxAttempts = 30; // Maximum 30 seconds wait

    while ((runStatus.status === 'in_progress' || runStatus.status === 'queued') && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await checkRunStatus(thread.id, run.id);
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error('Analysis timed out');
    }

    if (runStatus.status === 'failed') {
      console.error('Run failed:', runStatus);
      throw new Error('Analysis failed to complete');
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

    if (!messagesResponse.ok) {
      const error = await messagesResponse.json();
      console.error('Messages retrieval error:', error);
      throw new Error('Failed to retrieve analysis results');
    }

    const messages = await messagesResponse.json();
    console.log('Received messages:', messages);

    if (!messages.data || messages.data.length === 0) {
      throw new Error('No response received from assistant');
    }

    const assistantMessage = messages.data[0].content[0].text.value;

    return new Response(
      JSON.stringify({ analysis: assistantMessage }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in analyze-app-store function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred during analysis'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
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

  if (!response.ok) {
    throw new Error('Failed to check analysis status');
  }

  return await response.json();
}
