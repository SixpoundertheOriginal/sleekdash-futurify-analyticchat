
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Use the same constants as defined in ThreadContext.tsx
const DEFAULT_THREAD_ID = 'thread_wbaTz1aTmZhcT9bZqpHpTAQj';
const DEFAULT_ASSISTANT_ID = 'asst_EYm70EgIE2okxc8onNc1DVTj';

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
    const finalThreadId = threadId || DEFAULT_THREAD_ID;
    const finalAssistantId = assistantId || DEFAULT_ASSISTANT_ID;
    
    console.log('Using Thread ID:', finalThreadId)
    console.log('Using Assistant ID:', finalAssistantId)

    // Add your analysis logic here
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
        threadId: finalThreadId,  // Return the thread ID used for confirmation
        assistantId: finalAssistantId  // Return the assistant ID used for confirmation
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
