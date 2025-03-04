
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Using constants to ensure consistency
const DEFAULT_ASSISTANT_ID = 'asst_EYm70EgIE2okxc8onNc1DVTj';
const DEFAULT_THREAD_ID = 'thread_2saO94Wc9LZobi27LwrKoqEw';

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

    const { message, threadId, assistantId } = await req.json();
    
    // Log the received values
    console.log('Received message:', message);
    console.log('Received Thread ID:', threadId);
    console.log('Received Assistant ID:', assistantId);

    // Validate inputs
    if (!message) {
      throw new Error('Message is required');
    }
    
    // Use the DEFAULT_THREAD_ID to ensure consistency
    const finalThreadId = DEFAULT_THREAD_ID;
    console.log('Using Thread ID:', finalThreadId);
    
    // Use the provided assistantId if valid, otherwise fall back to the default
    const finalAssistantId = assistantId || DEFAULT_ASSISTANT_ID;
    console.log('Using Assistant ID:', finalAssistantId);

    // Add message to thread
    console.log('Adding message to thread:', finalThreadId);
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${finalThreadId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2', // Updated to v2
      },
      body: JSON.stringify({
        role: 'user',
        content: message,
      }),
    });

    if (!messageResponse.ok) {
      const errorData = await messageResponse.json();
      console.error('Message creation error:', errorData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to send message: ${errorData.error?.message || 'Unknown error'}`,
          details: errorData
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Run the assistant
    console.log('Starting chat with assistant:', finalAssistantId);
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${finalThreadId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2', // Updated to v2
      },
      body: JSON.stringify({
        assistant_id: finalAssistantId,
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
      const errorData = await runResponse.json();
      console.error('Run creation error:', errorData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to process message: ${errorData.error?.message || 'Unknown error'}`,
          details: errorData
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
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
        `https://api.openai.com/v1/threads/${finalThreadId}/runs/${run.id}`,
        {
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'OpenAI-Beta': 'assistants=v2', // Updated to v2
            'Content-Type': 'application/json'
          },
        }
      );

      if (!statusResponse.ok) {
        const errorData = await statusResponse.json();
        throw new Error(`Failed to check message status: ${errorData.error?.message || 'Unknown error'}`);
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
      throw new Error(`Failed to generate response: Run status is ${runStatus.status}`);
    }

    // Get messages
    const messagesResponse = await fetch(
      `https://api.openai.com/v1/threads/${finalThreadId}/messages`,
      {
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'OpenAI-Beta': 'assistants=v2', // Updated to v2
          'Content-Type': 'application/json'
        },
      }
    );

    if (!messagesResponse.ok) {
      const errorData = await messagesResponse.json();
      throw new Error(`Failed to retrieve response: ${errorData.error?.message || 'Unknown error'}`);
    }

    const messages = await messagesResponse.json();
    
    if (!messages.data || messages.data.length === 0) {
      throw new Error('No response received');
    }

    // Get the latest assistant message - Note: content structure might be different in v2
    const assistantMessage = messages.data
      .find(msg => msg.role === 'assistant')?.content[0]?.text?.value;

    if (!assistantMessage) {
      throw new Error('Invalid response format');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis: assistantMessage,
        threadId: finalThreadId,  // Return the thread ID used for confirmation
        assistantId: finalAssistantId  // Return the assistant ID used for confirmation
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in chat-message function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
