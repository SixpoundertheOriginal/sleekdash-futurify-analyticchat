
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400', // 24 hours cache for preflight requests
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const DEFAULT_THREAD_ID = 'thread_d5BLFmp47v8EbWacFTjs6sgh'; // App Store thread ID
const DEFAULT_ASSISTANT_ID = 'asst_TfGVD0dcL2vsnPCihybxorC7'; // App Store assistant ID

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    console.log("Analyze app store function called");
    const requestData = await req.json();
    
    // Handle either appDescription or rawText for backward compatibility
    const appDescription = requestData.appDescription || requestData.rawText;
    
    const { 
      threadId = DEFAULT_THREAD_ID, 
      assistantId = DEFAULT_ASSISTANT_ID,
      processedData,
      dateRange
    } = requestData;

    if (!appDescription) {
      console.error("No app description provided");
      return new Response(
        JSON.stringify({ error: 'App description is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Using thread ID: ${threadId}`);
    console.log(`Using assistant ID: ${assistantId}`);
    console.log(`Processing app description with length: ${appDescription.length}`);
    
    // Log date range if provided
    if (dateRange) {
      console.log(`Analyzing data for date range: ${dateRange.from} to ${dateRange.to}`);
    }
    
    // Log if we received pre-processed data
    if (processedData) {
      console.log('Received pre-processed data with validation confidence:', processedData.validation?.confidence);
    }

    // 1. Create an enhanced structured prompt with better sections and specific questions
    let prompt = `Analyze this app store data: ${appDescription}

Please provide a comprehensive analysis with the following sections:

1. Executive Summary
   - Provide a concise overview of the app's overall health
   - Identify the most critical positive and negative trends
   - Calculate estimated impact of any crash increases on user experience
   - Prioritize identifying crashes and ANRs as critical issues affecting user experience and app store rankings
   - Recognize their impact on organic discoverability
   - Investigate traffic source changes, especially dips in ad and referral traffic
   - Highlight growth areas such as increased organic traffic or improved brand search
   - Associate performance metrics with strategic initiatives (e.g., ASO, keyword optimization)
   - Analyze how KPIs affect business goals, identifying negative trends and root causes
   - Balance challenges and successes for a nuanced understanding
   - Transform data analysis into actionable business strategies

2. Acquisition Analysis
   - Analyze the full acquisition funnel and calculate drop-off rates between stages
   - Compare conversion efficiency to industry benchmarks (typically 1-3%)
   - Explain causes for any conversion rate changes
   - Calculate cost implications if this was paid traffic
   - Investigate dips in ad and referral traffic to identify marketing strategy deficiencies
   - Highlight organic traffic improvements and their connection to ASO efforts

3. Engagement & Retention
   - Break down what the sessions per active device metric tells us about user behavior
   - Analyze correlation between engagement metrics and other performance indicators
   - Calculate estimated user retention based on available data
   - Recommend specific strategies to improve engagement
   - Examine how engagement metrics correlate with crashes and ANRs

4. Technical Health
   - Analyze crash rates and their impact on user experience
   - Calculate the estimated percentage of user base affected by crashes
   - Provide technical troubleshooting priorities
   - Suggest monitoring and stability improvements
   - Prioritize technical issues based on their impact on user experience and app store rankings

5. Monetization Analysis
   - Calculate average revenue per download and compare to previous periods
   - Analyze correlation between proceeds growth and download growth
   - Provide estimated lifetime value projections
   - Suggest optimal pricing strategies based on the conversion and proceeds data
   - Connect monetization performance to overall business objectives

6. Strategic Recommendations
   - Provide 3-5 specific, actionable recommendations prioritized by impact
   - Suggest A/B testing approaches for problem areas
   - Outline a roadmap to address any critical issues
   - Recommend key metrics to monitor going forward
   - Suggest solutions for identified challenges and strategies to leverage growth opportunities
   - Emphasize improvements like ASO for better organic reach
   - Keep recommendations concise and focused on key insights needed for decision-making

Please include specific percentages, calculations, and metrics in your analysis. Use tables where appropriate to present data clearly. Format your response with clear section headings and bullet points for readability.`;

    // If we have date range, include it in the prompt with more specific temporal context
    if (dateRange && dateRange.from && dateRange.to) {
      prompt = `Analyze this app store data from ${dateRange.from} to ${dateRange.to}:\n\n${appDescription}\n\n${prompt.split('Analyze this app store data:')[1]}`;
      
      // Add seasonal context request
      prompt += `\n\nAlso consider any seasonal factors or market trends that might be influencing results during this specific time period (${dateRange.from} to ${dateRange.to}).`;
    }

    // If we have processed data, include it in the prompt with better structure
    if (processedData) {
      let extractedMetrics;
      let extractedChanges;
      
      try {
        extractedMetrics = JSON.stringify(processedData.metrics, null, 2);
        extractedChanges = JSON.stringify(processedData.changes, null, 2);
      } catch (error) {
        console.error("Error stringifying processed data:", error);
        extractedMetrics = "Error processing metrics data";
        extractedChanges = "Error processing changes data";
      }
      
      prompt += `\n\nI've already extracted the following metrics from the data:
\`\`\`json
${extractedMetrics}
\`\`\`

And the following percentage changes:
\`\`\`json
${extractedChanges}
\`\`\`

Please use these structured values in your analysis to:
- Calculate derived metrics (ARPU, LTV, funnel conversion rates)
- Identify correlations between different metrics
- Compare to industry benchmarks
- Make evidence-based recommendations

Format all metrics consistently with appropriate units (%, $, counts) and use tables where helpful to present comparative data.`;

      // If we have a date range from processed data, include that too
      if (processedData.dateRange) {
        prompt += `\n\nThe data covers the specific period: ${processedData.dateRange}. Consider any seasonal trends or events during this timeframe in your analysis.`;
      }
    }

    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        role: 'user',
        content: prompt
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

    // If we have processed data, store it in Supabase
    if (processedData && processedData.validation?.isValid) {
      // This is where you would store in Supabase
      console.log('Would store processed data in Supabase');
      // TODO: Add Supabase storage logic if needed
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: analysisContent,
        messageId: latestMessage.id,
        threadId: threadId,
        assistantId: assistantId, // Include the assistant ID in the response
        dateRange: dateRange,
        processedDataIncluded: !!processedData
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
