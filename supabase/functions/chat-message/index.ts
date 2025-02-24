
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

    const { message } = await req.json();
    console.log('Processing message:', message);

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
            content: 'You are a helpful marketing analysis assistant. Provide clear, concise insights about marketing data and strategies.' 
          },
          { role: 'user', content: message }
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to get response from AI',
          analysis: 'I encountered an error while processing your message. Please try again.' 
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const data = await response.json();
    console.log('AI response received:', data);

    const analysis = data.choices[0].message.content;
    
    return new Response(
      JSON.stringify({ analysis }),
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
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
