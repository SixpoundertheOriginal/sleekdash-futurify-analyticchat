
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, createResponse, handleError } from './utils.ts';
import { processKeywordFile } from './file-processor.ts';
import { analyzeKeywords, addToThread, runAssistant } from './openai-service.ts';

const DEFAULT_THREAD_ID = 'thread_XexaKEggRcir8kQLQbbLqqy9';
const DEFAULT_ASSISTANT_ID = 'asst_EYm70EgIE2okxc8onNc1DVTj';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  try {
    console.log('[process-keywords] Request headers:', req.headers);
    console.log('[process-keywords] Request method:', req.method);
    console.log('[process-keywords] Request URL:', req.url);
    
    const body = await req.json();
    console.log('[process-keywords] Received body:', body);
    
    const fileContent = body.fileContent;
    const threadId = body.threadId || DEFAULT_THREAD_ID;
    const assistantId = body.assistantId || DEFAULT_ASSISTANT_ID;

    console.log(`[process-keywords] Using thread ID: ${threadId}`);
    console.log(`[process-keywords] Using assistant ID: ${assistantId}`);

    // 1. Process the file content
    const processResult = await processKeywordFile(fileContent);
    
    // Handle processing errors
    if (processResult instanceof Response) {
      return processResult;
    }
    
    const { data } = processResult;

    // 2. Analyze the keywords with OpenAI
    const { analysis, error: openaiError } = await analyzeKeywords(data);
    
    // 3. Add analysis to the OpenAI thread
    const dataSample = data.slice(0, 15);
    await addToThread(threadId, data, dataSample, openaiError);
    
    // 4. Run the assistant
    await runAssistant(threadId, assistantId);

    // 5. Return the results
    return createResponse({
      status: 'success',
      data: data.slice(0, 50), // Limit data sent back to avoid payload size issues
      analysis: analysis,
      threadId: threadId,
      error: openaiError
    });

  } catch (error) {
    console.error('[process-keywords] Error in process-keywords function:', error);
    return handleError(error, 'Failed to process file');
  }
});
