
/**
 * Utilities for working with OpenAI message formats
 */

/**
 * Extract text content from various OpenAI message formats
 */
export const extractMessageContent = (openaiMessage: any): string => {
  // Handle different content formats
  if (typeof openaiMessage.content === 'string') {
    return openaiMessage.content;
  } 
  
  if (Array.isArray(openaiMessage.content) && openaiMessage.content.length > 0) {
    // Find text content in the array
    const textContents = openaiMessage.content
      .filter((item: any) => 
        item.type === 'text' || (item.text && item.text.value)
      )
      .map((item: any) => 
        item.text?.value || item.text || JSON.stringify(item)
      );
    
    if (textContents.length > 0) {
      return textContents.join('\n\n');
    }
  }
  
  // Handle potential text value in the message
  if (openaiMessage.text && typeof openaiMessage.text.value === 'string') {
    return openaiMessage.text.value;
  }
  
  // Fallback - return serialized content
  return typeof openaiMessage.content === 'object' 
    ? JSON.stringify(openaiMessage.content) 
    : String(openaiMessage.content || '');
};
