
/**
 * Utility functions for processing message content
 */

/**
 * Processes the message content to make it more readable and visually appealing
 */
export const processMessageContent = (content: any): string => {
  // Check if content is not a string (could be an object from OpenAI API)
  if (typeof content !== 'string') {
    console.log('[MessageContentUtils] Received non-string content:', content);
    
    // Handle OpenAI new format where content might be an array
    if (Array.isArray(content)) {
      // Extract the text from the content array
      const textParts = content
        .filter((item: any) => item.type === 'text')
        .map((item: any) => item.text?.value || '');
      
      if (textParts.length > 0) {
        content = textParts.join('\n\n');
      } else {
        // Fallback - stringify the content
        content = JSON.stringify(content);
      }
    } else {
      // Fallback - stringify the content
      content = JSON.stringify(content);
    }
  }

  // Handle empty content or problematic values
  if (!content || content === "[]" || content.trim() === "") {
    console.warn('[MessageContentUtils] Empty or invalid content detected');
    content = "Content unavailable. Please try again or upload a new file.";
  }
  
  // Process the content for better display
  return content
    .replace(/^### (.*)/gm, '## $1')
    .replace(/^#### (.*)/gm, '### $1')
    .replace(/\*\*(.*?)\*\*/g, '**$1**')
    .replace(/^- /gm, '• ')
    .replace(/(\$[\d,]+\.?\d*)/g, '**$1**')
    .replace(/([+\-]?\d+\.?\d*%)/g, '**$1**')
    .replace(/increase/gi, '📈 increase')
    .replace(/decrease/gi, '📉 decrease')
    .replace(/improved/gi, '✨ improved')
    .replace(/downloads/gi, '⬇️ downloads')
    .replace(/revenue/gi, '💰 revenue')
    .replace(/users/gi, '👥 users')
    .replace(/growth/gi, '📊 growth');
};

/**
 * Generate suggested replies based on message content
 */
export const getSuggestedReplies = (content: string, role: string): string[] => {
  if (role !== 'assistant') return [];
  
  // Simple keyword-based suggestions
  if (content.includes('keyword')) {
    return ["Tell me more about top keywords", "What's the competition like?"];
  } else if (content.includes('performance')) {
    return ["Show me detailed metrics", "How can I improve?"];
  } else if (content.includes('trend')) {
    return ["What's driving this trend?", "Compare to last month"];
  } else if (content.includes('analysis')) {
    return ["Show me the data breakdown", "What actions should I take?"];
  } else if (content.includes('report') || content.includes('insight')) {
    return ["Export this report", "Highlight key findings"];
  }
  
  // Default suggestions
  return ["Tell me more", "Can you explain that?"];
};

/**
 * Format timestamp 
 */
export const formatTimestamp = (timestamp: string | Date | undefined): string => {
  return timestamp 
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
