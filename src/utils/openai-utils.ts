
/**
 * Extracts the content from an OpenAI message object
 */
export const extractMessageContent = (msg: any): string => {
  // For newer OpenAI API format (content as array)
  if (Array.isArray(msg.content)) {
    // Collect all text content parts
    const textParts = msg.content
      .filter((part: any) => part.type === 'text')
      .map((part: any) => part.text?.value || '');
    
    if (textParts.length > 0) {
      return textParts.join('\n\n');
    }
    
    // If no text parts found, stringify the whole content
    console.warn('[openai-utils] Message had content array but no text parts', msg.content);
    return JSON.stringify(msg.content);
  }
  
  // Handle case where content is an empty array (sent as string "[]")
  if (msg.content === "[]") {
    console.warn('[openai-utils] Empty array content detected, checking for text value');
    // Check if there's a text value directly in the message
    if (msg.text && typeof msg.text.value === 'string') {
      return msg.text.value;
    }
    
    // Try to find content in other properties
    for (const key of ['value', 'text', 'message', 'analysis']) {
      if (msg[key] && typeof msg[key] === 'string' && msg[key].length > 0) {
        console.log(`[openai-utils] Found content in ${key} property`);
        return msg[key];
      }
    }
    
    return "Content unavailable. The message appears to be empty.";
  }
  
  // For string content (original format)
  if (typeof msg.content === 'string') {
    return msg.content;
  }
  
  // Fallback for unknown format
  console.warn('[openai-utils] Unknown message content format', msg);
  return JSON.stringify(msg.content || "No content available");
};
