
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const ASSISTANT_ID = 'asst_TfGVD0dcL2vsnPCihybxorC7';
const THREAD_ID = 'thread_aQs9lArOFgRIHwSyKPrXOxeC';

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
      console.error('OpenAI API key not found');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is not configured' }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { appDescription } = await req.json();
    console.log('Received app description:', appDescription);
    
    if (!appDescription?.trim()) {
      return new Response(
        JSON.stringify({ error: 'App description is required' }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Add message to existing thread
    console.log('Adding message to thread:', THREAD_ID);
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${THREAD_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1',
      },
      body: JSON.stringify({
        role: 'user',
        content: `Please analyze this app store description with these specific aspects:
        1. Key target audience identification
        2. Core value propositions
        3. Critical keywords for ASO (App Store Optimization)
        4. Suggested improvements for better visibility
        5. Competitive positioning
        6. Potential user acquisition channels
        
        App Description:
        ${appDescription}`,
      }),
    });

    if (!messageResponse.ok) {
      const error = await messageResponse.text();
      console.error('Message creation error:', error);
      throw new Error('Failed to submit app description for analysis');
    }

    console.log('Message added successfully');

    // Run the assistant
    console.log('Starting analysis with assistant:', ASSISTANT_ID);
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${THREAD_ID}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1',
      },
      body: JSON.stringify({
        assistant_id: ASSISTANT_ID,
        instructions: `You are an expert in App Store Optimization and mobile app marketing.
        When analyzing app descriptions:
        - Use ### headers for each major section
        - Bold (**) key findings and metrics
        - Create tables for comparing features or metrics
        - Use emojis for better visualization
        - Focus on actionable ASO recommendations
        - Highlight competitive advantages
        - Suggest specific keywords for ASO
        - Provide clear, structured improvement steps
        Format the response in a clear, visually appealing way using markdown.`
      }),
    });

    if (!runResponse.ok) {
      const error = await runResponse.text();
      console.error('Run creation error:', error);
      throw new Error('Failed to start analysis');
    }

    const run = await runResponse.json();
    console.log('Started run:', run.id);

    // Poll for completion
    let runStatus;
    let attempts = 0;
    const maxAttempts = 30; // Maximum 30 seconds wait

    do {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(
        `https://api.openai.com/v1/threads/${THREAD_ID}/runs/${run.id}`,
        {
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'OpenAI-Beta': 'assistants=v1',
          },
        }
      );

      if (!statusResponse.ok) {
        throw new Error('Failed to check analysis status');
      }

      runStatus = await statusResponse.json();
      console.log('Run status:', runStatus.status);
      attempts++;

    } while ((runStatus.status === 'in_progress' || runStatus.status === 'queued') && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      throw new Error('Analysis timed out');
    }

    if (runStatus.status !== 'completed') {
      console.error('Run failed with status:', runStatus.status);
      throw new Error('Analysis failed to complete');
    }

    // Get messages
    console.log('Retrieving analysis results');
    const messagesResponse = await fetch(
      `https://api.openai.com/v1/threads/${THREAD_ID}/messages`,
      {
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'OpenAI-Beta': 'assistants=v1',
        },
      }
    );

    if (!messagesResponse.ok) {
      const error = await messagesResponse.text();
      console.error('Messages retrieval error:', error);
      throw new Error('Failed to retrieve analysis results');
    }

    const messages = await messagesResponse.json();
    console.log('Received messages:', messages);

    if (!messages.data || messages.data.length === 0) {
      throw new Error('No response received from assistant');
    }

    // Get the latest assistant message
    const assistantMessage = messages.data
      .find(msg => msg.role === 'assistant')?.content[0]?.text?.value;

    if (!assistantMessage) {
      throw new Error('No valid response found in assistant messages');
    }

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
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
