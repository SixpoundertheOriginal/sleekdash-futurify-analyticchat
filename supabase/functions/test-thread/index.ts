
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
      throw new Error('OpenAI API key not configured');
    }

    const { threadId, assistantId } = await req.json();

    console.log('Testing thread:', threadId);
    console.log('Testing assistant:', assistantId);

    if (!threadId) {
      throw new Error('Thread ID is required');
    }

    if (!assistantId) {
      throw new Error('Assistant ID is required');
    }

    // First step: Check if the thread exists by trying to list messages
    try {
      const checkThreadResponse = await fetch(
        `https://api.openai.com/v1/threads/${threadId}/messages`,
        {
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'OpenAI-Beta': 'assistants=v1',
          },
        }
      );

      if (!checkThreadResponse.ok) {
        const errorData = await checkThreadResponse.json();
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Thread validation failed: ${errorData.error?.message || 'Thread not found'}`,
            step: 'thread_validation',
            details: errorData
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // If we got here, the thread exists
      console.log('Thread exists, checking assistant...');
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Thread check error: ${error.message}`,
          step: 'thread_check',
          details: error
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Second step: Check if the assistant exists
    try {
      const checkAssistantResponse = await fetch(
        `https://api.openai.com/v1/assistants/${assistantId}`,
        {
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'OpenAI-Beta': 'assistants=v1',
          },
        }
      );

      if (!checkAssistantResponse.ok) {
        const errorData = await checkAssistantResponse.json();
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Assistant validation failed: ${errorData.error?.message || 'Assistant not found'}`,
            step: 'assistant_validation',
            details: errorData
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // If we got here, the assistant exists
      console.log('Assistant exists, both checks passed!');
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Assistant check error: ${error.message}`,
          step: 'assistant_check',
          details: error
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
    }

    // If we got here, both the thread and assistant exist!
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Thread and assistant validated successfully',
        threadId,
        assistantId
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in test-thread function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `General error: ${error.message}`,
        step: 'general',
        details: error
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
