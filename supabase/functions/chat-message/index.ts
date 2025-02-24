
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, threadId } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get the latest keyword analysis data for context
    const { data: keywordData, error: dbError } = await supabase
      .from('keyword_analyses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    const systemPrompt = `
# ASO Keyword Analysis - AppTweak Data Processing

## Context:
You have received a keywords dataset from AppTweak for an app that requires ASO keyword optimization. Your task is to analyze the data and generate keyword recommendations based on ranking feasibility, competitive positioning, ASA synergy, user intent, and indexation efficiency.

## Input Data (Keywords Table)
The dataset includes the following columns:

- Keyword – The search term.
- Volume – Search volume index (not absolute search count).
- Max Reach – Estimated real user searches.
- Results – Number of competing apps ranking for the keyword.
- Difficulty – Competition level for ranking.
- Chance – Probability of ranking for this keyword.
- KEI – Keyword Efficiency Index (higher = better balance of traffic & competition).
- Relevancy – AppTweak's relevance score for the app.
- Rank – The app's current ranking for the keyword.
- Growth – Ranking movement over time.

## Objectives:
1. Identify High-Potential Keywords
   - Prioritize keywords with high ranking probability based on Max Reach, Chance Score, and KEI.
   - Exclude high-volume, high-difficulty keywords unless the app has strong ranking power.
   - Recommend low-difficulty, high-relevancy keywords for apps with low ASO equity.

2. Segment Keywords by Ranking Feasibility
   - Immediate Targets: Keywords the app can rank for now (High Chance, Mid Difficulty).
   - Growth Opportunities: Keywords with ranking potential if optimized properly (High KEI, Moderate Rank).
   - Long-Term Bets: High-traffic keywords that require significant equity building.

3. Analyze Competitive Landscape
   - Compare keyword competition levels with the app's current rank and ranking growth trends.
   - Identify niche keywords where competition is low, but ranking potential is high.

4. Leverage ASA Insights (If Available)
   - Identify keywords with strong ASA performance but weak organic ranking.
   - Recommend ASA-supported keywords for metadata reinforcement.

5. Ensure Metadata Optimization Efficiency
   - Structure keyword placement for maximum indexation (Title, Subtitle, Keyword Field).
   - Ensure long-tail and short-tail balance for broader coverage.

## Expected Output Format
Generate a structured keyword strategy report with keyword segments and recommended metadata placements.

# Immediate Target Keywords (Can Rank Now)
List keywords with their metrics and recommended placements.
Present in a table format using | separators.

# Growth Opportunity Keywords (Needs Optimization)
List keywords with their metrics and suggested strategies.
Present in a table format using | separators.

# Long-Term Strategic Keywords (High Volume, High Competition)
List keywords with their metrics and feasibility assessment.
Present in a table format using | separators.

## Final Instructions
- Prioritize high-ranking feasibility keywords over high-volume terms.
- Balance short-tail and long-tail keywords for maximum indexation.
- Use ASA insights to strengthen organic ranking potential.
- Provide structured metadata recommendations based on data-driven keyword selection.`;

    // Fetch OpenAI API key from environment variables
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.text();
      console.error('OpenAI API error:', errorData);
      throw new Error('Failed to get response from OpenAI');
    }

    const aiData = await openAIResponse.json();
    const analysis = aiData.choices[0].message.content;

    // Store the analysis in the database
    const { error: insertError } = await supabase
      .from('keyword_analyses')
      .insert([
        {
          openai_analysis: analysis,
          thread_id: threadId,
        }
      ]);

    if (insertError) {
      throw new Error(`Error storing analysis: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
