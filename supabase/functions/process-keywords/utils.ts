
// CORS headers for all responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Helper function to create a response with CORS headers
export const createResponse = (data: any, status = 200) => {
  return new Response(
    JSON.stringify(data),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status 
    }
  );
};

// Helper function to handle errors
export const handleError = (error: any, context: string) => {
  console.error(`[process-keywords] ${context}:`, error);
  return createResponse({ 
    error: { message: `${context}: ${error instanceof Error ? error.message : String(error)}` }
  }, 500);
};
