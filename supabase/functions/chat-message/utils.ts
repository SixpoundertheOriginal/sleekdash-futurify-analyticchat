
// CORS headers for all responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to extract content from various message formats
export const extractMessageContent = (message: any): string => {
  // For newer OpenAI API format (content as array)
  if (Array.isArray(message.content)) {
    // Collect all text content parts
    const textParts = message.content
      .filter((part: any) => part.type === 'text')
      .map((part: any) => part.text?.value || '');
    
    if (textParts.length > 0) {
      return textParts.join('\n\n');
    }
  }
  
  // For string content
  if (typeof message.content === 'string') {
    return message.content;
  }
  
  // Handle empty content
  if (message.content === "[]" || !message.content) {
    // Try to find content in other properties
    for (const key of ['value', 'text', 'message', 'analysis']) {
      if (message[key] && typeof message[key] === 'string' && message[key].length > 0) {
        return message[key];
      }
    }
  }
  
  // Last resort - check if there's a text value directly in the message
  if (message.text && typeof message.text.value === 'string') {
    return message.text.value;
  }
  
  // Fallback for unknown format
  return typeof message.content === 'object' 
    ? JSON.stringify(message.content) 
    : String(message.content || 'No content available');
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

// Helper function to log errors and create error responses
export const handleError = (error: any, message: string) => {
  console.error(`[chat-message] ${message}:`, error);
  return createResponse({ 
    success: false, 
    error: { message: `${message}: ${error instanceof Error ? error.message : String(error)}` } 
  }, 500);
};
