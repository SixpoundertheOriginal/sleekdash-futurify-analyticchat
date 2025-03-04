
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
    const textContent = openaiMessage.content.find((item: any) => 
      item.type === 'text' || (item.text && item.text.value)
    );
    
    if (textContent) {
      return textContent.text?.value || textContent.text || JSON.stringify(textContent);
    }
  }
  
  // Fallback - return serialized content
  return typeof openaiMessage.content === 'object' 
    ? JSON.stringify(openaiMessage.content) 
    : String(openaiMessage.content || '');
};
