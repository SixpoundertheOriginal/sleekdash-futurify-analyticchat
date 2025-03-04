
import { createResponse, handleError, corsHeaders } from './utils.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

export async function analyzeKeywords(data: any[]) {
  console.log('[process-keywords] Analyzing keywords with OpenAI');
  
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
      return { 
        error: { message: 'Failed to get analysis from OpenAI: ' + errorText },
        analysis: 'I was unable to analyze your keyword data due to an error. Please try again or contact support if the issue persists.'
      };
    } 
    
    const aiAnalysis = await openaiResponse.json();
    return { 
      analysis: aiAnalysis.choices[0].message.content,
      error: null
    };
  } catch (error) {
    console.error('[process-keywords] Error calling OpenAI:', error);
    return { 
      error: { message: 'Error processing with OpenAI: ' + error.message },
      analysis: 'I was unable to analyze your keyword data due to an error. Please try again or contact support if the issue persists.'
    };
  }
}

export async function addToThread(threadId: string, data: any[], dataSample: any[], openaiError: any = null) {
  console.log(`[process-keywords] Adding keyword analysis to thread: ${threadId}`);
  
  try {
    // Format the content for the thread message
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
      return { error: errorText };
    }
    
    console.log('[process-keywords] Message added to thread successfully');
    return { success: true };
  } catch (error) {
    console.error('[process-keywords] Error adding file analysis to thread:', error);
    return { error: error.message };
  }
}

export async function runAssistant(threadId: string, assistantId: string) {
  try {
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
      return { error: errorText };
    }
    
    const runData = await runResponse.json();
    console.log('[process-keywords] Assistant run initiated successfully:', runData.id);
    return { success: true, runId: runData.id };
  } catch (error) {
    console.error('[process-keywords] Error running assistant:', error);
    return { error: error.message };
  }
}
