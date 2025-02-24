
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Handle chat messages
    if (req.headers.get("content-type")?.includes("application/json")) {
      const { message } = await req.json();
      
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an ASO expert analyzing keyword data. Provide insights on keyword trends, ranking opportunities, and optimization recommendations.'
            },
            {
              role: 'user',
              content: message
            }
          ],
        }),
      });

      const aiResponse = await openaiResponse.json();
      return new Response(
        JSON.stringify({ analysis: aiResponse.choices[0].message.content }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle file upload
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file uploaded' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Read file as text
    const fileContent = await file.text();
    
    // Basic validation for Excel-like structure (comma-separated or tab-separated)
    const lines = fileContent.split('\n');
    const headers = lines[0].split(/[,\t]/);
    
    const expectedColumns = [
      "Keyword", "Volume", "Max Reach", "Results", "Difficulty",
      "Chance", "KEI", "Relevancy", "Rank", "Growth"
    ];

    const missingColumns = expectedColumns.filter(col => 
      !headers.map(h => h.trim()).includes(col)
    );

    if (missingColumns.length > 0) {
      return new Response(
        JSON.stringify({ error: `Missing columns: ${missingColumns.join(', ')}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Convert file content to structured data
    const data = lines.slice(1).map(line => {
      const values = line.split(/[,\t]/);
      return expectedColumns.reduce((obj, col, index) => {
        obj[col] = values[index]?.trim() || '';
        return obj;
      }, {});
    }).filter(row => Object.values(row).some(val => val !== ''));

    // Process with OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
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

    const aiAnalysis = await openaiResponse.json();
    const analysis = aiAnalysis.choices[0].message.content;

    return new Response(
      JSON.stringify({
        status: 'success',
        data: data,
        analysis: analysis
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
