
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const DEFAULT_THREAD_ID = 'thread_2saO94Wc9LZobi27LwrKoqEw';
const DEFAULT_ASSISTANT_ID = 'asst_EYm70EgIE2okxc8onNc1DVTj';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Request headers:', req.headers);
    const body = await req.json();
    console.log('Received body:', body);
    
    const fileContent = body.fileContent;
    const threadId = body.threadId || DEFAULT_THREAD_ID;
    const assistantId = body.assistantId || DEFAULT_ASSISTANT_ID;

    console.log(`[process-keywords] Using thread ID: ${threadId}`);
    console.log(`[process-keywords] Using assistant ID: ${assistantId}`);

    if (!fileContent) {
      console.error('No file content provided');
      return new Response(
        JSON.stringify({ error: 'No file content provided' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }

    // Split the content into lines and process
    const lines = fileContent.split('\n');
    if (lines.length < 2) {
      console.error('File is empty or has no data rows');
      return new Response(
        JSON.stringify({ error: 'File is empty or has no data rows' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }

    const headers = lines[0].split(/[,\t]/);
    console.log('Found headers:', headers);
    
    const expectedColumns = [
      "Keyword", "Volume", "Max Reach", "Results", "Difficulty",
      "Chance", "KEI", "Relevancy", "Rank", "Growth"
    ];

    // Make the column check case-insensitive
    const headerMap = new Map(
      headers.map(h => [h.trim().toLowerCase(), h.trim()])
    );
    const missingColumns = expectedColumns.filter(col => 
      !headerMap.has(col.toLowerCase())
    );

    if (missingColumns.length > 0) {
      console.error('Missing columns:', missingColumns);
      return new Response(
        JSON.stringify({ error: `Missing columns: ${missingColumns.join(', ')}` }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }

    // Convert file content to structured data
    const data = lines
      .slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = line.split(/[,\t]/);
        return expectedColumns.reduce((obj, col, index) => {
          obj[col] = values[index]?.trim() || '';
          return obj;
        }, {});
      });

    if (data.length === 0) {
      console.error('No valid data rows found');
      return new Response(
        JSON.stringify({ error: 'No valid data rows found in file' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }

    console.log('Processed data rows:', data.length);

    // Process with OpenAI - Get analysis first
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are an ASO expert analyzing keyword data. Provide insights on keyword trends, ranking opportunities, and optimization recommendations.'
          },
          {
            role: 'user',
            content: `Analyze this keyword data: ${JSON.stringify(data)}`
          }
        ],
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error('Failed to get analysis from OpenAI');
    }

    const aiAnalysis = await openaiResponse.json();
    const analysis = aiAnalysis.choices[0].message.content;
    
    // Now add the analysis to the existing conversation thread
    console.log(`[process-keywords] Adding keyword analysis to thread: ${threadId}`);
    
    try {
      // 1. Add a message to the thread with the analysis
      const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          role: 'user',
          content: `I've uploaded a keyword file with ${data.length} rows. Please analyze it.`
        }),
      });

      if (!messageResponse.ok) {
        const errorText = await messageResponse.text();
        console.error('[process-keywords] Error adding message to thread:', errorText);
        // Continue despite the error to return the analysis
      } else {
        console.log('[process-keywords] Message added to thread successfully');
        
        // 2. Run the assistant to process the message
        const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v2'
          },
          body: JSON.stringify({
            assistant_id: assistantId
          }),
        });

        if (!runResponse.ok) {
          const errorText = await runResponse.text();
          console.error('[process-keywords] Error running assistant:', errorText);
          // Continue despite the error
        } else {
          console.log('[process-keywords] Assistant run initiated successfully');
        }
      }
    } catch (error) {
      console.error('[process-keywords] Error adding file analysis to thread:', error);
      // Continue despite the error to return the analysis
    }

    return new Response(
      JSON.stringify({
        status: 'success',
        data: data,
        analysis: analysis,
        threadId: threadId // Return the thread ID in the response
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-keywords function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process file', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});
