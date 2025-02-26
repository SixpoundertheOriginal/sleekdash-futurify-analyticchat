
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { appDescription, threadId, assistantId } = await req.json();
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    if (!appDescription?.trim()) {
      throw new Error('App description is required');
    }

    // Add message to thread
    console.log('Adding message to thread:', threadId);
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2',
      },
      body: JSON.stringify({
        role: 'user',
        content: `Please analyze this app store data and generate a comprehensive performance report following this exact structure:

Monthly Performance Report: [App Name]
Date Range: [Date Range]

Executive Summary
- Summarize key trends and performance highlights
- Focus on growth areas and major concerns

User Acquisition Metrics
- Impressions: [Value] ([Change %])
- Product Page Views: [Value] ([Change %])
- Conversion Rate: [Value] ([Change %])
- Total Downloads: [Value] ([Change %])

Conversion Funnel Analysis
- Impressions to Product Page Views Conversion Rate: [Calculated Value]%
- Product Page Views to Downloads Conversion Rate: [Calculated Value]%

Financial Performance
- Proceeds: $[Value] ([Change %])
- Proceeds per Paying User: $[Value] ([Change %])
- Average Revenue Per Download (ARPD): $[Calculated Value]
- Download to Proceed Conversion Rate: [Calculated Value]%

User Engagement & Retention
- Sessions per Active Device: [Value] ([Change %])
- Retention Rates:
  • Day 1: [Value]% (Benchmark Comparison)
  • Day 7: [Value]% (Benchmark Comparison)
  • Day 14: [Value]% (Benchmark Comparison)
  • Day 21: [Value]% (Benchmark Comparison)
  • Day 28: [Value]% (Benchmark Comparison)

Technical Performance
- Crash Count: [Value] ([Change %])
- Crash Rate: [Calculated Value]% with percentile comparison
- Include specific actions needed for technical improvements

Geographical & Device Performance
- Downloads by Country:
  List top countries with percentage and value of total downloads
- Market Penetration Analysis:
  Market Share in Key Regions: [Calculated Value]% for top regions
- Downloads by Device Type:
  Detail device type contributions with optimization recommendations

Conclusion & Next Steps
1. Key Takeaways:
   - Major insights
   - Growth opportunities
   - Areas of improvement

2. Action Items:
   - Specific, actionable recommendations
   - Retention strategy improvements
   - Product page optimization suggestions

3. Strategic Considerations:
   - Long-term growth opportunities
   - Market expansion possibilities
   - Product development recommendations

Deep Insights (Derived KPIs)
- Funnel Conversion Analysis
- Revenue Maximization Opportunities
- Long-term Retention Strategies

App Store Data for Analysis:
${appDescription}`
      }),
    });

    if (!messageResponse.ok) {
      const error = await messageResponse.text();
      console.error('Message creation error:', error);
      throw new Error(`Failed to submit app description: ${error}`);
    }

    // Run the assistant
    console.log('Starting analysis with assistant:', assistantId);
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2',
      },
      body: JSON.stringify({
        assistant_id: assistantId,
        instructions: `You are an expert App Store Analytics Specialist. Generate a detailed performance report following the exact structure provided in the user's message. Always include:

1. Actual numbers and percentages where data is available
2. Clear comparisons with previous periods
3. Actionable insights based on the data
4. Strategic recommendations for improvement
5. Calculated KPIs and derived metrics
6. Benchmark comparisons where relevant

Format the report clearly with proper spacing and sections for readability.`
      }),
    });

    if (!runResponse.ok) {
      const error = await runResponse.text();
      console.error('Run creation error:', error);
      throw new Error(`Failed to start analysis: ${error}`);
    }

    const run = await runResponse.json();
    console.log('Started run:', run.id);

    // Poll for completion
    let runStatus;
    let attempts = 0;
    const maxAttempts = 60;

    do {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(
        `https://api.openai.com/v1/threads/${threadId}/runs/${run.id}`,
        {
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'OpenAI-Beta': 'assistants=v2',
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
      throw new Error('Analysis timed out after 60 seconds');
    }

    if (runStatus.status !== 'completed') {
      throw new Error(`Analysis failed with status: ${runStatus.status}`);
    }

    // Get messages
    console.log('Retrieving analysis results');
    const messagesResponse = await fetch(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      {
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'OpenAI-Beta': 'assistants=v2',
        },
      }
    );

    if (!messagesResponse.ok) {
      throw new Error('Failed to retrieve analysis results');
    }

    const messages = await messagesResponse.json();
    console.log('Got messages response:', messages);

    const assistantMessage = messages.data?.find(msg => msg.role === 'assistant')?.content?.[0]?.text?.value;

    if (!assistantMessage) {
      throw new Error('No valid analysis results found in the response');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis: assistantMessage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in analyze-app-store function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'An unexpected error occurred during analysis'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
