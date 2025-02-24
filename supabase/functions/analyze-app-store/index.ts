
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    // Validate OpenAI API Key
    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is not configured' }),
        { 
          status: 200, // Changed to 200 to ensure the error message reaches the client
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { appDescription } = await req.json();
    
    if (!appDescription?.trim()) {
      return new Response(
        JSON.stringify({ error: 'App description is required' }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create a thread
    console.log('Creating thread...');
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
      console.error('Thread creation failed:', await threadResponse.text());
      return new Response(
        JSON.stringify({ error: 'Failed to initialize analysis' }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const thread = await threadResponse.json();
    console.log('Thread created:', thread.id);

    // Test message to verify API key and connection
    const testMessage = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Test connection' }],
      }),
    });

    if (!testMessage.ok) {
      console.error('API connection test failed:', await testMessage.text());
      return new Response(
        JSON.stringify({ error: 'Failed to connect to OpenAI API' }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // If we get here, the API connection is working
    console.log('API connection successful');

    // Continue with the analysis using simple completion for now
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in analyzing app store descriptions. Provide insights on keywords, target audience, and potential improvements.'
          },
          {
            role: 'user',
            content: `Please analyze this app description: ${appDescription}`
          }
        ],
      }),
    });

    if (!response.ok) {
      console.error('Analysis failed:', await response.text());
      return new Response(
        JSON.stringify({ error: 'Analysis failed. Please try again.' }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ analysis }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in analyze-app-store function:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
