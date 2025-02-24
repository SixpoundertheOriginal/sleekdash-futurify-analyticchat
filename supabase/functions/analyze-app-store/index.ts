
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const ASSISTANT_ID = 'asst_TfGVD0dcL2vsnPCihybxorC7';
const THREAD_ID = 'thread_aQs9lArOFgRIHwSyKPrXOxeC';

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
      throw new Error('OpenAI API key is not configured');
    }

    const { appDescription } = await req.json();
    console.log('Received app description:', appDescription);
    
    if (!appDescription?.trim()) {
      throw new Error('App description is required');
    }

    // Add message to existing thread
    console.log('Adding message to thread:', THREAD_ID);
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${THREAD_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2',  // Updated to v2
      },
      body: JSON.stringify({
        role: 'user',
        content: `Please analyze this app store data and generate a comprehensive performance report following these aspects:

        1. Data Extraction & Cleaning
        - Process raw App Store Connect data
        - Clean HTML elements and navigation text
        - Extract structured metrics

        2. Key Metrics Analysis
        - User Acquisition: Impressions, Product Page Views, Conversion Rates, Downloads
        - Financial Performance: Total Proceeds, Proceeds per Paying User
        - User Engagement: Sessions per Device, Retention Rates (Day 1, 7, 14, 28)
        - Technical Performance: Crash Count, Crash Rate
        - Geographical & Device Analysis: Downloads by Country and Device Type

        3. Comparative Analysis
        - Current vs Previous Period Performance
        - Industry Benchmarks (if available)
        - Growth Trends and Areas of Concern

        App Store Data:
        ${appDescription}`,
      }),
    });

    if (!messageResponse.ok) {
      const error = await messageResponse.text();
      console.error('Message creation error:', error);
      throw new Error(`Failed to submit app description: ${error}`);
    }

    // Run the assistant
    console.log('Starting analysis with assistant:', ASSISTANT_ID);
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${THREAD_ID}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2',  // Updated to v2
      },
      body: JSON.stringify({
        assistant_id: ASSISTANT_ID,
        instructions: `You are an expert App Store Performance Report Generator.

        Generate a structured, client-focused monthly performance report following this format:

        # Monthly Performance Report: [App Name]
        ## Date Range: [Period]

        ### 📊 Executive Summary
        - Key trends and performance highlights
        - Critical changes from previous period
        - Major achievements or concerns

        ### 📈 User Acquisition Metrics
        - Impressions: [Value] ([Change %])
        - Product Page Views: [Value] ([Change %])
        - Conversion Rate: [Value] ([Change %])
        - Total Downloads: [Value] ([Change %])

        ### 💰 Financial Performance
        - Total Proceeds: [Value] ([Change %])
        - Proceeds per Paying User: [Value] ([Change %])
        - Revenue Trends Analysis

        ### 👥 User Engagement & Retention
        - Sessions per Active Device: [Value] ([Change %])
        - Retention Rates:
          • Day 1: [Value] ([Benchmark %])
          • Day 7: [Value] ([Benchmark %])
          • Day 14: [Value] ([Benchmark %])
          • Day 28: [Value] ([Benchmark %])

        ### ⚡ Technical Performance
        - Crash Count: [Value] ([Change %])
        - Crash Rate: [Value] ([Benchmark %])
        - Performance Optimization Recommendations

        ### 🌍 Geographical & Device Analysis
        - Top Performing Markets
        - Device Distribution
        - Platform-Specific Insights

        ### 🎯 Action Items & Recommendations
        1. Immediate Actions
        2. Medium-term Optimizations
        3. Long-term Strategy Adjustments`
      }),
    });

    if (!runResponse.ok) {
      const error = await runResponse.text();
      console.error('Run creation error:', error);
      throw new Error(`Failed to start analysis: ${error}`);
    }

    const run = await runResponse.json();
    console.log('Started run:', run.id);

    // Poll for completion with increased timeout
    let runStatus;
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds wait

    do {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(
        `https://api.openai.com/v1/threads/${THREAD_ID}/runs/${run.id}`,
        {
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'OpenAI-Beta': 'assistants=v2',  // Updated to v2
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
      `https://api.openai.com/v1/threads/${THREAD_ID}/messages`,
      {
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'OpenAI-Beta': 'assistants=v2',  // Updated to v2
        },
      }
    );

    if (!messagesResponse.ok) {
      throw new Error('Failed to retrieve analysis results');
    }

    const messages = await messagesResponse.json();
    console.log('Got messages response:', messages);

    // Get the latest assistant message
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
        status: 200,
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
