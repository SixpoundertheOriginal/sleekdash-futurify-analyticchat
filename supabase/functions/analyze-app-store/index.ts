
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
        content: `Analyze this app store data and generate a comprehensive performance report following this exact structure:

Monthly Performance Report: [App Name]
Date Range: [Date Range]

Executive Summary
- Provide an overarching summary of key trends and performance highlights
- Emphasize areas of strong growth, notable successes, and critical concerns

User Acquisition Metrics
- Impressions: [Value] ([Change %])
- Product Page Views: [Value] ([Change %])
- Conversion Rate: [Value] ([Change %])
- Total Downloads: [Value] ([Change %])

Conversion Funnel Analysis
1. Calculate and report:
   - Impressions to Product Page Views Rate = (Product Page Views / Impressions × 100)%
   - Product Page Views to Downloads Rate = (Total Downloads / Product Page Views × 100)%
2. Identify significant funnel drop-off points

Financial Performance
1. Core Metrics:
   - Proceeds: $[Value] ([Change %])
   - Proceeds per Paying User: $[Value] ([Change %])
2. Calculated Revenue Metrics:
   - ARPD = Proceeds / Total Downloads
   - Revenue per Impression = Proceeds / Impressions
   - Monetization Efficiency = Proceeds / Product Page Views
   - Paying User % = ((Proceeds / Proceeds per Paying User) / Total Downloads × 100)%

User Engagement & Retention
1. Activity Metrics:
   - Sessions per Active Device: [Value] ([Change %])
2. Retention Analysis:
   - Day 1: [Value]% vs Industry Benchmark
   - Day 7: [Value]% vs Industry Benchmark
   - Day 14: [Value]% vs Industry Benchmark
   - Day 21: [Value]% vs Industry Benchmark
   - Day 28: [Value]% vs Industry Benchmark
3. Revenue-Retention Correlation Analysis:
   - Identify patterns between retention spikes and revenue

Technical Performance
1. Core Metrics:
   - Crash Count: [Value] ([Change %])
   - Crash Rate vs Industry Percentile
2. Impact Analysis:
   - Estimated Revenue Loss from Crashes
   - Crash-to-Churn Correlation
   - Technical Improvement Priorities

Geographical & Device Performance
1. Market Analysis:
   - Top 3-5 Markets: Downloads (%) and Count
   - Revenue/Download Ratio by Country
2. Device Distribution:
   - Device-specific Downloads
   - Device-specific Revenue
   - Optimization Recommendations

Conclusion & Strategic Analysis
1. Key Takeaways:
   - Critical Insights
   - Growth Opportunities
   - Risk Areas
2. Action Items:
   - Technical Improvements
   - Marketing Optimizations
   - User Experience Enhancements
3. Strategic Planning:
   - Market Expansion Opportunities
   - Platform Strategy
   - Revenue Optimization Paths

Deep Insights (Derived KPIs)
1. Financial Efficiency:
   - Revenue/Impression
   - Revenue/Page View
   - Device Revenue Efficiency
2. Conversion Analysis:
   - Funnel Drop-off Points
   - Stage-by-Stage Effectiveness
3. User Quality Metrics:
   - Session Value
   - Retention-Revenue Impact
4. Geographic Analysis:
   - Country-specific ARPU
   - Market Expansion ROI
5. Growth Indicators:
   - Growth-Retention Balance
   - Platform-specific Performance

App Store Data for Analysis:
${appDescription}`
      }),
    });

    if (!messageResponse.ok) {
      const error = await messageResponse.text();
      console.error('Message creation error:', error);
      throw new Error(`Failed to submit app description: ${error}`);
    }

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
        instructions: `You are an expert App Store Analytics Specialist. Generate a detailed performance report following the exact structure provided, with these key requirements:

1. Mathematical Precision:
   - Use the exact formulas provided for all calculations
   - Show percentage changes with proper signs (+ or -)
   - Round monetary values to 2 decimal places
   - Round percentages to 1 decimal place

2. Data Analysis:
   - Compare all metrics to previous periods
   - Highlight statistically significant changes
   - Identify correlations between metrics
   - Calculate and explain derived KPIs

3. Industry Context:
   - Compare metrics to industry benchmarks
   - Identify competitive advantages/disadvantages
   - Suggest market positioning strategies

4. Actionable Insights:
   - Provide specific, data-driven recommendations
   - Prioritize suggestions by potential impact
   - Include implementation considerations

Format the report with clear sections, bullet points, and proper spacing for readability.
Use consistent numerical formatting throughout the report.`
      }),
    });

    if (!runResponse.ok) {
      const error = await runResponse.text();
      console.error('Run creation error:', error);
      throw new Error(`Failed to start analysis: ${error}`);
    }

    const run = await runResponse.json();
    console.log('Started run:', run.id);

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
