
// CORS headers for all responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400', // 24 hours cache for preflight requests
};

// Helper function to handle errors
export const handleError = (error: any, context: string) => {
  console.error(`[export-chat] ${context}:`, error);
  return new Response(
    JSON.stringify({ 
      success: false, 
      error: { message: `${context}: ${error instanceof Error ? error.message : String(error)}` }
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 500 
    }
  );
};
