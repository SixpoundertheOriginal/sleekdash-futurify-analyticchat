
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const ASSISTANT_ID = 'asst_TfGVD0dcL2vsnPCihybxorC7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { message, threadId } = await req.json();
    console.log('Received message:', message);
    console.log('Thread ID:', threadId);

    if (!message || !threadId) {
      throw new Error('Message and threadId are required');
    }

    // Add message to thread
    console.log('Adding message to thread:', threadId);
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1',
      },
      body: JSON.stringify({
        role: 'user',
        content: message,
      }),
    });

    if (!messageResponse.ok) {
      const error = await messageResponse.text();
      console.error('Message creation error:', error);
      throw new Error('Failed to send message');
    }

    // Run the assistant
    console.log('Starting chat with assistant:', ASSISTANT_ID);
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1',
      },
      body: JSON.stringify({
        assistant_id: ASSISTANT_ID,
        instructions: `You are a helpful AI assistant for marketing and data analysis. 
        When analyzing data:
        - Focus on key metrics and trends
        - Highlight significant changes
        - Use clear formatting with headers (###) for sections
        - Use tables when comparing data
        - Bold (**) important numbers and findings
        - Add relevant emojis for better visualization
        - Provide actionable insights
        - Be concise but thorough`
      }),
    });

    if (!runResponse.ok) {
      const error = await runResponse.text();
      console.error('Run creation error:', error);
      throw new Error('Failed to process message');
    }

    const run = await runResponse.json();
    console.log('Started run:', run.id);

    // Poll for completion
    let runStatus;
    let attempts = 0;
    const maxAttempts = 60; // Maximum 60 seconds wait

    do {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(
        `https://api.openai.com/v1/threads/${threadId}/runs/${run.id}`,
        {
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'OpenAI-Beta': 'assistants=v1',
          },
        }
      );

      if (!statusResponse.ok) {
        throw new Error('Failed to check message status');
      }

      runStatus = await statusResponse.json();
      console.log('Run status:', runStatus.status);
      attempts++;

    } while (runStatus.status === 'in_progress' && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      throw new Error('Response timed out');
    }

    if (runStatus.status !== 'completed') {
      console.error('Run failed with status:', runStatus.status);
      throw new Error('Failed to generate response');
    }

    // Get messages
    const messagesResponse = await fetch(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      {
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'OpenAI-Beta': 'assistants=v1',
        },
      }
    );

    if (!messagesResponse.ok) {
      throw new Error('Failed to retrieve response');
    }

    const messages = await messagesResponse.json();
    
    if (!messages.data || messages.data.length === 0) {
      throw new Error('No response received');
    }

    // Get the latest assistant message
    const assistantMessage = messages.data
      .find(msg => msg.role === 'assistant')?.content[0]?.text?.value;

    if (!assistantMessage) {
      throw new Error('Invalid response format');
    }

    return new Response(
      JSON.stringify({ analysis: assistantMessage }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in chat-message function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
