
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { threadId, assistantId } = await req.json();
    
    if (!threadId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Thread ID is required' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    if (!assistantId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Assistant ID is required' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Testing thread ID: ${threadId}`);
    console.log(`Testing assistant ID: ${assistantId}`);
    
    // Test 1: Verify the thread exists
    const threadResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      }
    });

    if (!threadResponse.ok) {
      const errorData = await threadResponse.text();
      console.error('Thread validation failed:', errorData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Thread validation failed: ${errorData}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const threadData = await threadResponse.json();
    console.log('Thread validation response:', threadData);

    // Test 2: Verify the assistant exists
    const assistantResponse = await fetch(`https://api.openai.com/v1/assistants/${assistantId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      }
    });

    if (!assistantResponse.ok) {
      const errorData = await assistantResponse.text();
      console.error('Assistant validation failed:', errorData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Assistant validation failed: ${errorData}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const assistantData = await assistantResponse.json();
    console.log('Assistant validation response:', assistantData);

    // Test 3: Send a test message to the thread
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        role: 'user',
        content: 'This is a test message to verify thread functionality.'
      }),
    });

    if (!messageResponse.ok) {
      const errorData = await messageResponse.text();
      console.error('Message test failed:', errorData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Message test failed: ${errorData}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const messageData = await messageResponse.json();
    console.log('Test message sent successfully:', messageData);

    // All tests passed
    console.log('Thread validation successful');
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Thread and Assistant validated successfully',
        threadId: threadId,
        assistantId: assistantId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in test-thread function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An unknown error occurred' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
