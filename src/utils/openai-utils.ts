
/**
 * Extracts the content from an OpenAI message object
 */
export const extractMessageContent = (msg: any): string => {
  if (!msg) {
    console.warn('[openai-utils] Received null or undefined message');
    return "No message data available";
  }

  // Check for processed_content field first (added by our edge function)
  if (msg.processed_content && typeof msg.processed_content === 'string') {
    return msg.processed_content;
  }
  
  // For newer OpenAI API format (content as array)
  if (Array.isArray(msg.content)) {
    // Collect all text content parts
    const textParts = msg.content
      .filter((part: any) => part.type === 'text')
      .map((part: any) => part.text?.value || '');
    
    if (textParts.length > 0) {
      return textParts.join('\n\n');
    }
    
    // Handle image content
    const hasImageContent = msg.content.some((part: any) => part.type === 'image');
    if (hasImageContent) {
      return "This message contains image content that cannot be displayed in text format.";
    }
    
    // If no text parts found, stringify the whole content
    console.warn('[openai-utils] Message had content array but no text parts', msg.content);
    return "Message format not supported. Please try a different query.";
  }
  
  // Handle case where content is an empty array (sent as string "[]")
  if (msg.content === "[]" || !msg.content) {
    console.warn('[openai-utils] Empty or null content detected, checking for alternative content');
    
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
    
    // Look for content in value properties nested within the message
    if (msg.content && typeof msg.content === 'object') {
      for (const key in msg.content) {
        if (msg.content[key] && typeof msg.content[key].value === 'string') {
          console.log(`[openai-utils] Found content in msg.content.${key}.value`);
          return msg.content[key].value;
        }
      }
    }
    
    // Check for run information
    if (msg.run_id) {
      return "Processing your request... (Run ID: " + msg.run_id.substring(0, 8) + ")";
    }
    
    return "Content unavailable. Please try again or upload a new file.";
  }
  
  // For string content (original format)
  if (typeof msg.content === 'string') {
    return msg.content;
  }
  
  // Fallback for unknown format
  console.warn('[openai-utils] Unknown message content format', msg);
  try {
    return JSON.stringify(msg.content || "No content available");
  } catch (e) {
    return "Content could not be displayed due to an unknown format.";
  }
};
