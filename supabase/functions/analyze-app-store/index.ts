
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Use the same constants as defined in ThreadContext.tsx
const DEFAULT_THREAD_ID = 'thread_2saO94Wc9LZobi27LwrKoqEw';
const DEFAULT_ASSISTANT_ID = 'asst_EYm70EgIE2okxc8onNc1DVTj';
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { appDescription, threadId, assistantId } = await req.json()

    if (!appDescription) {
      throw new Error('App description is required')
    }

    console.log('Received request with description:', appDescription.substring(0, 100) + '...')
    
    // Use provided IDs if available, otherwise use defaults
    // We prioritize the DEFAULT_THREAD_ID to ensure we're adding to the same thread
    const finalThreadId = DEFAULT_THREAD_ID;
    const finalAssistantId = assistantId || DEFAULT_ASSISTANT_ID;
    
    console.log('Using Thread ID:', finalThreadId)
    console.log('Using Assistant ID:', finalAssistantId)

    // For real OpenAI integration, uncomment this block
    if (openAIApiKey) {
      try {
        // Create a message in the thread
        const messageResponse = await fetch(`https://api.openai.com/v1/threads/${finalThreadId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v2', // Updated to v2
          },
          body: JSON.stringify({
            role: 'user',
            content: appDescription,
          }),
        });

        if (!messageResponse.ok) {
          const errorData = await messageResponse.json();
          console.error('Message creation error:', errorData);
          throw new Error(`Failed to send app data: ${errorData.error?.message || 'Unknown error'}`);
        }
        
        // Run the assistant on the thread
        const runResponse = await fetch(`https://api.openai.com/v1/threads/${finalThreadId}/runs`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v2', // Updated to v2
          },
          body: JSON.stringify({
            assistant_id: finalAssistantId,
            instructions: `Analyze this app store data and provide insights in a clear, structured format. Focus on key metrics, trends, and actionable recommendations.`
          }),
        });

        if (!runResponse.ok) {
          const errorData = await runResponse.json();
          console.error('Run creation error:', errorData);
          throw new Error(`Failed to analyze data: ${errorData.error?.message || 'Unknown error'}`);
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
            throw new Error(`Failed to check run status: ${errorData.error?.message || 'Unknown error'}`);
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
          throw new Error(`Analysis failed with status: ${runStatus.status}`);
        }

        // Get the latest messages
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
          throw new Error(`Failed to retrieve analysis results: ${errorData.error?.message || 'Unknown error'}`);
        }

        const messages = await messagesResponse.json();
        
        if (!messages.data || messages.data.length === 0) {
          throw new Error('No response received from assistant');
        }

        // Get the latest assistant message
        const assistantMessage = messages.data
          .find(msg => msg.role === 'assistant')?.content[0]?.text?.value;

        if (!assistantMessage) {
          throw new Error('Invalid response format');
        }

        return new Response(
          JSON.stringify({
            success: true,
            analysis: assistantMessage,
            threadId: finalThreadId,
            assistantId: finalAssistantId
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        );
      } catch (error) {
        console.error('OpenAI API error:', error);
        throw error;
      }
    }

    // For demo purposes, if no OpenAI API key is available, use a mock response
    const analysis = `Monthly Performance Report: Example App
Date Range: January 1 - January 31, 2024

Executive Summary
Strong performance across key metrics with notable growth in user acquisition and revenue. Engagement metrics show positive trends while maintaining stable technical performance.

### User Acquisition Metrics
Impressions: 150,000 (+25%)
Product Page Views: 45,000 (+15%)
Conversion Rate: 3.5% (+10%)
Total Downloads: 5,250 (+20%)

### Financial Performance
Proceeds: $25,000 (+30%)
Proceeds per Paying User: $5.50 (+15%)
ARPD: $4.76
Revenue per Impression: $0.17
Monetization Efficiency: 85%
Paying User Percentage: 12%

### User Engagement & Retention
Sessions per Active Device: 8.5 (+12%)
Day 1 Retention: 45% (Benchmark: 40%)
Day 7 Retention: 25% (Benchmark: 20%)

### Technical Performance
Crash Count: 150 (-10%)
Crash Rate: 0.8% (75th percentile)

### Top Markets by Downloads:
United States: 35% (1,838)
United Kingdom: 15% (788)
Canada: 12% (630)
Australia: 10% (525)
Germany: 8% (420)

### Device Distribution:
iPhone: 65% (3,413)
iPad: 25% (1,313)
iPod: 10% (525)`;

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysis,
        threadId: finalThreadId,
        assistantId: finalAssistantId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error in analyze-app-store function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
