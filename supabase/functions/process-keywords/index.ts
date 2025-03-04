
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const DEFAULT_THREAD_ID = 'thread_XexaKEggRcir8kQLQbbLqqy9';
const DEFAULT_ASSISTANT_ID = 'asst_EYm70EgIE2okxc8onNc1DVTj';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[process-keywords] Request headers:', req.headers);
    const body = await req.json();
    console.log('[process-keywords] Received body:', body);
    
    const fileContent = body.fileContent;
    const threadId = body.threadId || DEFAULT_THREAD_ID;
    const assistantId = body.assistantId || DEFAULT_ASSISTANT_ID;

    console.log(`[process-keywords] Using thread ID: ${threadId}`);
    console.log(`[process-keywords] Using assistant ID: ${assistantId}`);

    if (!fileContent) {
      console.error('[process-keywords] No file content provided');
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
      console.error('[process-keywords] File is empty or has no data rows');
      return new Response(
        JSON.stringify({ error: 'File is empty or has no data rows' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }

    // Detect delimiter (comma or tab)
    const firstLine = lines[0];
    let delimiter = ',';
    if (firstLine.includes('\t')) {
      delimiter = '\t';
    }
    
    const headers = lines[0].split(delimiter).map(h => h.trim());
    console.log('[process-keywords] Found headers:', headers);
    
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
      console.error('[process-keywords] Missing columns:', missingColumns);
      return new Response(
        JSON.stringify({ error: { message: `Missing columns: ${missingColumns.join(', ')}` } }),
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
        const values = line.split(delimiter);
        const result = {};
        
        // Only add fields that have values
        headers.forEach((header, index) => {
          const value = values[index]?.trim() || '';
          if (value) {
            result[header] = value;
          }
        });
        
        return result;
      })
      .filter(row => Object.keys(row).length > 0); // Remove empty rows

    if (data.length === 0) {
      console.error('[process-keywords] No valid data rows found');
      return new Response(
        JSON.stringify({ error: { message: 'No valid data rows found in file' } }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }

    console.log('[process-keywords] Processed data rows:', data.length);

    // Process with OpenAI - Get analysis first
    let analysis = '';
    let openaiError = null;
    
    try {
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
              content: `Analyze this keyword data: ${JSON.stringify(data.slice(0, 50))}`
            }
          ],
        }),
      });

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text();
        console.error('[process-keywords] OpenAI API error:', errorText);
        openaiError = { message: 'Failed to get analysis from OpenAI: ' + errorText };
        analysis = 'I was unable to analyze your keyword data due to an error. Please try again or contact support if the issue persists.';
      } else {
        const aiAnalysis = await openaiResponse.json();
        analysis = aiAnalysis.choices[0].message.content;
      }
    } catch (error) {
      console.error('[process-keywords] Error calling OpenAI:', error);
      openaiError = { message: 'Error processing with OpenAI: ' + error.message };
      analysis = 'I was unable to analyze your keyword data due to an error. Please try again or contact support if the issue persists.';
    }
    
    // Always add the file upload message to the thread, regardless of success or failure
    console.log(`[process-keywords] Adding keyword analysis to thread: ${threadId}`);
    
    try {
      // Format the data for better visualization in the thread
      const dataSample = data.slice(0, 15);

      // 1. Add a message to the thread with the analysis
      const fileUploadContent = openaiError
        ? `The user uploaded a keyword file with ${data.length} rows, but there was an error analyzing it: ${openaiError.message}`
        : `The user uploaded a keyword file with ${data.length} rows. Here's a sample of the data:
        
\`\`\`json
${JSON.stringify(dataSample, null, 2)}
\`\`\`

Please analyze this keyword data for App Store Optimization. Focus on:
1. Identifying high-opportunity keywords (based on volume, difficulty, and relevance)
2. Suggesting keyword combinations for app metadata
3. Providing insights on user search behavior
4. Recommending an optimization strategy based on the data`;
        
      console.log('[process-keywords] Sending message to OpenAI thread with content:', fileUploadContent.substring(0, 100) + '...');
      
      const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          role: 'user',
          content: fileUploadContent
        }),
      });

      if (!messageResponse.ok) {
        const errorText = await messageResponse.text();
        console.error('[process-keywords] Error adding message to thread:', errorText);
        // Continue despite the error to return some analysis
      } else {
        console.log('[process-keywords] Message added to thread successfully');
        
        // 2. Always run the assistant to process the message, regardless of analysis success
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
        } else {
          const runData = await runResponse.json();
          console.log('[process-keywords] Assistant run initiated successfully:', runData.id);
        }
      }
    } catch (error) {
      console.error('[process-keywords] Error adding file analysis to thread:', error);
    }

    return new Response(
      JSON.stringify({
        status: 'success',
        data: data.slice(0, 50), // Limit data sent back to avoid payload size issues
        analysis: analysis,
        threadId: threadId,
        error: openaiError
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[process-keywords] Error in process-keywords function:', error);
    return new Response(
      JSON.stringify({ 
        error: { message: 'Failed to process file: ' + error.message },
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});
