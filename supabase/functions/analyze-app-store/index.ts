
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400', // 24 hours cache for preflight requests
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const DEFAULT_THREAD_ID = 'thread_XexaKEggRcir8kQLQbbLqqy9';
const DEFAULT_ASSISTANT_ID = 'asst_TfGVD0dcL2vsnPCihybxorC7';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    const requestData = await req.json();
    const { 
      appDescription, 
      threadId = DEFAULT_THREAD_ID, 
      assistantId = DEFAULT_ASSISTANT_ID 
    } = requestData;

    if (!appDescription) {
      return new Response(
        JSON.stringify({ error: 'App description is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Using thread ID: ${threadId}`);
    console.log(`Using assistant ID: ${assistantId}`);
    console.log(`Processing app description with length: ${appDescription.length}`);

    // 1. Add a message to the thread
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        role: 'user',
        content: `Analyze this app store data: ${appDescription}

Please provide a structured analysis with the following sections:
1. Summary
2. Acquisition
3. Engagement
4. Retention
5. Monetization
6. Recommendations

Include metrics and percentages where available. Format your response so it can be parsed into sections.`
      }),
    });

    if (!messageResponse.ok) {
      const errorData = await messageResponse.text();
      console.error('Error adding message to thread:', errorData);
      throw new Error(`Failed to add message to thread: ${errorData}`);
    }

    const messageData = await messageResponse.json();
    console.log('Message added to thread:', messageData.id);

    // 2. Run the assistant on the thread
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        assistant_id: assistantId
      }),
    });

    if (!runResponse.ok) {
      const errorData = await runResponse.text();
      console.error('Error running assistant:', errorData);
      throw new Error(`Failed to run assistant: ${errorData}`);
    }

    const runData = await runResponse.json();
    console.log('Assistant run initiated:', runData.id);

    // 3. Wait for the run to complete
    let runStatus = runData.status;
    let runCompletedData;

    while (runStatus !== 'completed' && runStatus !== 'failed' && runStatus !== 'cancelled') {
      // Wait before checking status again
      await new Promise(resolve => setTimeout(resolve, 1000));

      const runStatusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runData.id}`, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        },
      });

      if (!runStatusResponse.ok) {
        const errorData = await runStatusResponse.text();
        console.error('Error checking run status:', errorData);
        throw new Error(`Failed to check run status: ${errorData}`);
      }

      runCompletedData = await runStatusResponse.json();
      runStatus = runCompletedData.status;
      console.log('Current run status:', runStatus);

      if (runStatus === 'failed') {
        throw new Error(`Run failed: ${JSON.stringify(runCompletedData)}`);
      }
      
      if (runStatus === 'cancelled') {
        throw new Error(`Run cancelled: ${JSON.stringify(runCompletedData)}`);
      }
    }

    // 4. Get the latest message from the thread
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages?limit=1`, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
    });

    if (!messagesResponse.ok) {
      const errorData = await messagesResponse.text();
      console.error('Error retrieving messages:', errorData);
      throw new Error(`Failed to retrieve messages: ${errorData}`);
    }

    const messagesData = await messagesResponse.json();
    
    if (!messagesData.data || messagesData.data.length === 0) {
      throw new Error('No messages found in the thread');
    }

    // Get the latest assistant message
    const latestMessage = messagesData.data[0];
    
    // Extract content from the message
    let analysisContent = '';
    
    if (latestMessage.content && latestMessage.content.length > 0) {
      // OpenAI's API returns content as an array of content blocks
      for (const contentBlock of latestMessage.content) {
        if (contentBlock.type === 'text') {
          analysisContent += contentBlock.text.value;
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: analysisContent,
        messageId: latestMessage.id,
        threadId: threadId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-app-store function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An unknown error occurred' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
